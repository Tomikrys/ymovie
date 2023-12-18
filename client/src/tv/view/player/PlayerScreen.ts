namespace ymovie.tv.view.player {
	import Action = ymovie.tv.type.Action;
	import Base = ymovie.type.Action.Base;
	import Context = ymovie.tv.type.Context;
	import DOM = ymovie.util.DOM;
	import DOMUtil = util.DOMUtil;
	import Focus = util.Focus;
	import Keyboard = util.Keyboard;
	import Media = ymovie.type.Media;
	import Timeout = ymovie.util.Timeout;
	import Util = ymovie.util.Util;

	export class PlayerScreen extends Screen {
		private data:PlayerScreenData;
		private video?:HTMLVideoElement;
		private readonly controls = new Controls();
		private readonly tracks = DOM.div("tracks");
		private readonly seekTimer = new Timeout(1000);
		private readonly idleTimer = new Timeout(2000);
		private readonly _onGlobalKeyDown = this.onGlobalKeyDown.bind(this);
		private audioTracks:AudioTracks | undefined;
		private textTracks:TextTracks | undefined;

		constructor(context:Context) {
			super(context);

			this.listen(SeekBy, this.onSeekBy.bind(this));
			this.listen(SeekTo, this.onSeekTo.bind(this));
			this.listen(TogglePlay, this.onTogglePlay.bind(this));
			this.listen(FocusAudioTracks, this.onFocusAudioTracks.bind(this));
			this.listen(FocusTextTracks, this.onFocusTextTracks.bind(this));
			this.listen(Action.AudioTrackSelected, this.onAudioTrackSelected.bind(this));
			this.listen(Action.TextTrackSelected, this.onTextTrackSelected.bind(this));
			this.element.addEventListener("mousemove", this.onMouseMove.bind(this));
		}

		private set idle(value:boolean) {
			this.idleTimer.stop();
			if(!value) 
				this.idleTimer.start(() => this.idle = true);
			this.element.classList.toggle("idle", value);
		}

		update(data?:PlayerScreenData):HTMLElement {
			this.data = data;
			this.idle = !data;
			this.audioTracks?.remove();
			this.audioTracks = undefined;
			this.textTracks?.remove();
			this.textTracks = undefined;
			this.seekTimer.stop();
			this.controls.update({duration:0, currentTime:0});
			return this.render();
		}

		private focusControls() {
			this.trigger(new Action.RequestFocus({component:this.controls, element:this.controls.element}));
		}

		activate(focus:boolean) {
			super.activate(focus);
			this.focusControls();
			this.listenGlobal(Action.GlobalKeyDown, this._onGlobalKeyDown);
		}

		deactivate() {
			this.unlistenGlobal(Action.GlobalKeyDown, this._onGlobalKeyDown);
			super.deactivate();
			this.update();
		}

		render() {
			this.clean();
			this.loading = !!this.data;

			if(this.video) {
				this.video.pause();
				this.video.removeAttribute("src");
				this.video.load();
				this.video = undefined;
			}

			if(this.data) {
				this.video = <HTMLVideoElement>DOM.create("video");
				this.video.src = this.data.url;
				this.video.autoplay = true;
				this.video.addEventListener("timeupdate", this.onVideoTimeUpdate.bind(this));
				this.video.addEventListener("loadeddata", this.onVideoLoadedData.bind(this));
				this.video.addEventListener("loadedmetadata", this.onVideoLoadedMetadata.bind(this));
				this.video.addEventListener("seeking", this.onVideoSeeking.bind(this));
				this.video.addEventListener("seeked", this.onVideoSeeked.bind(this));
				this.video.addEventListener("playing", this.onVideoPlaying.bind(this));
				this.video.addEventListener("waiting", this.onVideoWaiting.bind(this));
				this.video.addEventListener("play", this.onVideoPlay.bind(this));
				this.video.addEventListener("pause", this.onVideoPause.bind(this));
				this.video.addEventListener("error", this.onVideoError.bind(this));
				this.append([this.video, this.tracks, this.controls.render()]);
			}

			return super.render();
		}

		private updateControls() {
			if(!this.video)
				return;
			
			const duration = this.video.duration;
			const currentTime = this.seekTimer.running ? this.controls.data.currentTime : this.video.currentTime;
			this.controls.update({duration, currentTime});
			this.element.classList.toggle("paused", this.video.paused);
		}
		
		private seek(time:number) {
			if(!this.video?.duration)
				return;

			const duration = this.video.duration;
			const currentTime = Math.max(0, Math.min(duration, time));
			this.controls.update({duration, currentTime});

			this.seekTimer.start(this.onApplySeek.bind(this));
		}

		private play() {
			if(!this.video)
				return;
			this.video.play();
		}

		private togglePlay() {
			if(!this.video)
				return;

			if(this.video.paused)
				this.video.play();
			else
				this.video.pause();
		}

		private stop() {
			this.trigger(new Action.GoBack());
		}

		private onVideoTimeUpdate() {
			this.updateControls();
		}

		private onVideoLoadedData() {
			this.audioTracks?.remove();
			this.audioTracks = AudioTracks.create(this.video!);
			if(this.audioTracks)
				DOM.append(this.tracks, this.audioTracks.render());

			this.textTracks?.remove();
			this.textTracks = TextTracks.create(this.video!, this.data?.stream.subtitleList);
			if(this.textTracks)
				DOM.append(this.tracks, this.textTracks.render());
			
			this.updateControls();

		}

		private onVideoLoadedMetadata() {
			this.updateControls();
		}

		private onVideoSeeking() {
			this.updateControls();
			this.loading = true;
		}

		private onVideoSeeked() {
			this.updateControls();
			this.loading = false;
		}

		private onVideoPlaying() {
			this.updateControls();
			this.loading = false;
		}

		private onVideoWaiting() {
			this.updateControls();
			this.loading = true;
		}

		private onVideoPlay() {
			this.updateControls();
		}

		private onVideoPause() {
			this.updateControls();
		}

		private onVideoError() {
			this.loading = false;
			const message = `Playback failed with code <strong>${this.video?.error?.code || 0}</strong> and message <strong>${this.video?.error?.message || 'empty'}</strong>.`;
			this.trigger(new Action.ShowNotification({title:"Player Error", message, html:true}));
			this.stop();
		}

		private onTogglePlay() {
			this.togglePlay();
		}

		private onAudioTrackSelected() {
			this.focusControls();
		}

		private onTextTrackSelected() {
			this.focusControls();
		}

		private onSeekBy(event:CustomEvent<number>) {
			this.seek(this.controls.data.currentTime + event.detail);
		}

		private onSeekTo(event:CustomEvent<number>) {
			this.seek(event.detail);
		}

		private onApplySeek() {
			if(this.video)
				this.video.currentTime = this.controls.data.currentTime;
		}

		private onMouseMove() {
			this.idle = false;
		}

		private onFocusAudioTracks(event:CustomEvent<FocusAudioTracksData>) {
			if(!this.audioTracks)
				return;
			event.detail.result = true;
			this.trigger(new Action.RequestFocus({component:this.audioTracks, element:this.audioTracks.element}));
		}

		private onFocusTextTracks(event:CustomEvent<FocusAudioTracksData>) {
			if(!this.textTracks)
				return;
			event.detail.result = true;
			this.trigger(new Action.RequestFocus({component:this.textTracks, element:this.textTracks.element}));
		}

		private onGlobalKeyDown(event:CustomEvent<KeyboardEvent>) {
			this.idle = false;
			const source = event.detail;
			if(Keyboard.isPlayPause(source)) {
				this.togglePlay();
				source.preventDefault();
			} else if(Keyboard.isPlay(source)) {
				this.play();
				source.preventDefault();
			} else if(Keyboard.isStop(source)) {
				this.stop();
				source.preventDefault();
			}
		}
	}

	type PlayerScreenData = undefined | {
		media:Media.Playable;
		stream:Media.Stream;
		url:string;
	}

	class Controls extends FocusableDataComponent<HTMLDivElement, ConstrolsData> {
		private readonly thumb = DOM.div("thumb");
		private readonly time = DOM.div("time");

		constructor() {
			super("div", {duration:0, currentTime:0});

			this.append([this.thumb, this.time]);
			this.thumb.addEventListener("click", this.onThumbClick.bind(this));
			this.element.addEventListener("click", this.onClick.bind(this));
		}

		render() {
			this.thumb.style.left = `${this.data.currentTime / this.data.duration * 100 || 0}%`;
			this.time.innerHTML = `${Util.formatDuration(this.data.currentTime)} / ${Util.formatDuration(this.data.duration)}`;
			return super.render();
		}

		submit() {
			this.trigger(new TogglePlay());
		}


		executeFocusEvent(event:Focus.Event):boolean {
			if(event.action === "right") {
				this.trigger(new SeekBy(30));
				return true;
			}
			if(event.action === "left") {
				this.trigger(new SeekBy(-30));
				return true;
			}
			if(event.action === "submit") {
				this.submit();
				return true;
			}
			if(event.action === "down") {
				let action = new FocusAudioTracks();
				this.trigger(action);
				if(action.data.result)
					return true;

				action = new FocusTextTracks();
				this.trigger(action);
				return action.data.result;
			}
			return super.executeFocusEvent(event);
		}

		onThumbClick(event:MouseEvent) {
			event.stopImmediatePropagation();
			this.submit();
		}

		onClick(event:MouseEvent) {
			const rect = DOMUtil.getGlobalRect(this.element);
			if(!rect)
				return;
			const time = (event.clientX - rect.left) / rect.width * this.data.duration;
			this.trigger(new SeekTo(time));
		}
	}

	type ConstrolsData = {
		readonly duration:number;
		readonly currentTime:number;
	}

	class TogglePlay extends Base<undefined> {constructor() {super(undefined);}}
	class SeekBy extends Base<number> {}
	class SeekTo extends Base<number> {}

	class FocusAudioTracks extends Base<FocusAudioTracksData> {
		constructor() {super({result:false});}
	}

	class FocusTextTracks extends Base<FocusTextTracksData> {
		constructor() {super({result:false});}
	}

	type FocusAudioTracksData = {result:boolean};
	type FocusTextTracksData = {result:boolean};
}
