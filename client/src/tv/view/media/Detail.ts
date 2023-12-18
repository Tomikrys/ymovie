namespace ymovie.tv.view.media {
	import Action = type.Action;
	import DataComponent = ymovie.view.DataComponent;
	import Context = ymovie.tv.type.Context;
	import DOM = ymovie.util.DOM;
	import Focus = util.Focus;
	import Media = ymovie.type.Media;
	import Timeout = ymovie.util.Timeout;
	import Thumbnail = ymovie.util.Thumbnail;
	import Util = ymovie.util.Util;

	export class Detail extends DataComponent<HTMLDivElement, DetailData> {
		private readonly background = new Background();
		private readonly container = DOM.div("container");
		private readonly streams:Streams;
		private readonly navigation = new Navigation().render();

		constructor(context:Context) {
			super("div", undefined);

			this.streams = new Streams(context);
			this.append(this.background.render());
			this.element.addEventListener("wheel", this.onWheel.bind(this));
		}

		render() {
			if(this.data instanceof Media.Base) {
				DOM.clean(this.container);
				DOM.append(this.container, this.renderBase(this.data));
				this.append([this.container, this.streams.render(), this.navigation]);
			} else {
				DOM.remove(this.container);
				DOM.remove(this.streams.element);
				DOM.remove(this.navigation);
			}

			return super.render();
		}

		update(data:DetailData) {
			if(data === this.data)
				return this.element;
			this.background.update(data?.fanart);
			this.streams.update(undefined);
			return super.update(data);
		}

		updateStreams(data:Action.StreamsLoadedData) {
			const streams = data.streams
				.sort((a, b) => ((a.width || 0) - (b.width || 0)) || ((a.size || 0) - (b.size || 0)));
			this.streams.update({media:data.media, streams});
			const first = this.streams.getFirst();
			if(first)
				this.trigger(new Action.RequestFocus({component:first, element:first.element}));
		}

		private renderBase(data:Media.Base) {
			let title = data.title;
			let subtitle = undefined;
			if(data instanceof Media.Episode) {
				title = data.title || data.seriesTitle;
				subtitle = data.subtitle;
			} else if(data instanceof Media.Season) {
				title = data.seriesTitle;
				subtitle = data.subtitle;
			}

			return [DOM.h1(title), subtitle ? DOM.h2(subtitle) : undefined,
				DOM.div("extra", [
					data.rating ? DOM.span("rating", data.rating) : undefined,
					data instanceof Media.Scc && data.year ? DOM.span("year", data.year) : undefined,
					data instanceof Media.PlayableScc && data.duration ? DOM.span("duration", Util.formatDuration(data.duration)) : undefined,
					data instanceof Media.PlayableScc && data.genres ? DOM.span("genres", data.genres) : undefined]),
				data instanceof Media.Scc ? DOM.p("plot", data.plot) : undefined
			];
		}

		private onWheel(event:WheelEvent) {
			var action:Focus.Action = event.deltaY < 0 ? "up" : "down";
			this.trigger(new Action.EmulateFocusAction(action));
		}
	}

	export type DetailData = Media.Base | undefined;

	class Background extends DataComponent<HTMLDivElement, BackgroundData> {
		private readonly timeout = new Timeout(1000);
		private readonly image = DOM.img(undefined, "");

		constructor() {
			super("div", undefined);

			this.image.addEventListener("load", this.onImageLoad.bind(this));
			this.append(this.image);
		}

		set visible(value:boolean) {
			this.element.classList.toggle("visible", value);
		}

		render() {
			this.visible = false;
			if(this.data)
				this.timeout.start(() => this.image.src = Thumbnail.largeBackground(this.data) || "");
			else
				this.timeout.stop();
			
			return super.render();
		}

		private onImageLoad() {
			this.visible = true;
		}
	}

	type BackgroundData = string | undefined;

	class Streams extends DataComponent<HTMLDivElement, StreamsData> {
		private first:Stream | undefined;
		private readonly pair:Pair;

		constructor(context:Context) {
			super("div", undefined);
			this.pair = new Pair(context.deviceId)
			this.listen(Action.Focused, this.onStreamFocused.bind(this));
		}

		getFirst():Stream | undefined {
			return this.first;
		}

		render() {
			this.clean();
			this.first = undefined;
			util.Transform.on(this.element, "none");
			this.append(this.pair.render());
			if(this.data)
				for(const item of this.data.streams) {
					const stream = new Stream({media:this.data.media, stream:item});
					if(!this.first) this.first = stream;
					this.append(stream.render());
				}
			return super.render();
		}

		private onStreamFocused(event:CustomEvent<Action.FocusData>) {
			const element = event.detail.element;
			util.Transform.on(this.element, `translateY(${-element.offsetTop}px)`);
		}
	}

	type StreamsData = {media:Media.Playable, streams:Array<Media.Stream>} | undefined;

	class Stream extends FocusableDataComponent<HTMLDivElement, StreamData> {
		constructor(data:StreamData) {
			super("div", data);
			this.element.addEventListener("click", this.onClick.bind(this));
			this.listenGlobal(Action.StreamUrlResolved, this.onStreamUrlResolved.bind(this));
		}

		getFocusLayer():string {
			return "stream";
		}

		submit() {
			this.loading = true;
			this.trigger(new Action.Play(this.data));
		}

		executeFocusEvent(event:Focus.Event):boolean {
			if(event.action === "back" || event.action === "left") {
				this.trigger(new Action.BlurStreams());
				return true;
			} else if(event.action === "submit") {
				this.submit();
				return true;
			}
			return super.executeFocusEvent(event);
		}

		render() {
			const data = this.data.stream;
			this.clean();
			this.append([
				this.add("resolution", `${data.width}x${data.height}`),
				this.add("size", Util.formatSize(data.size)),
				DOM.div("extra", [
					this.add("language", data.language),
					this.add("subtitles", data.subtitles),
					this.add("hdr", data.hdr),
					this.add("3d", data.is3d ? "3D" : undefined),
					this.add("codec", `${data.videoCodec}+${data.audioCodec}`)])]);
			return super.render();
		}

		private add(className:string, value:string | undefined | null):DOM.Content {
			return value ? DOM.span(className, value) : undefined;
		}

		private onClick() {
			this.trigger(new Action.RequestFocus({component:this, element:this.element}));
			this.submit();
		}

		private onStreamUrlResolved(event:CustomEvent<Action.StreamUrlResolvedData>) {
			if(event.detail.stream === this.data.stream)
				this.loading = false;
		}
	}

	type StreamData = {media:Media.Playable, stream:Media.Stream};
}
