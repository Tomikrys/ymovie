namespace ymovie.tv.view.player {
	import Action = type.Action;
	import AudioTrack = type.AudioTrack;
	import DOM = ymovie.util.DOM;
	import Focus = util.Focus;
	import FocusableDataComponent = view.FocusableDataComponent;

	class Tracks<T> extends FocusableDataComponent<HTMLUListElement, Array<T>> {
		protected current:T;
		protected highlight:T;

		protected constructor(data:Array<T>, current:T) {
			super("ul", data);
			this.current = current;
			this.highlight = this.current;
		}

		focus() {
			this.highlight = this.current;
			this.render();
			super.focus();
		}

		executeFocusEvent(event:Focus.Event):boolean {
			const index = this.data.indexOf(this.highlight);
			if(event.action === "up") {
				if(index > 0)
					this.focusTrack(this.data[index - 1]!);
				return true;
			}
			if(event.action === "down") {
				if(index < this.data.length - 1)
					this.focusTrack(this.data[index + 1]!);
				return true;
			}
			if(event.action === "submit") {
				this.selectTrack(this.highlight);
				return true;
			}
			return super.executeFocusEvent(event);
		}

		private focusTrack(value:T) {
			this.highlight = value;
			this.render();
		}

		protected selectTrack(value:T) {
			this.current = value;
			this.render();
		}

		getBoundingRect():Focus.Rect | undefined {
			const rect = super.getBoundingRect();
			const body = document.body;
			return rect ? new Focus.Rect(rect.x + body.clientWidth, 0, rect.width, body.clientHeight) : undefined;
		}
	}

	export class AudioTracks extends Tracks<AudioTrack> {
		private constructor(data:Array<AudioTrack>) {
			super(data, data.find(item => item.enabled) || data[0]!);
		}

		static create(video:HTMLVideoElement):AudioTracks | undefined {
			const source = (<any>video).audioTracks;
			if(!source || !source.length || source.length < 2)
				return undefined;
			const list:Array<AudioTrack> = [];
			for(let i = 0; i < source.length; i++)
				list.push(source[i]);
			list.sort(this.sort);
			return new AudioTracks(list);
		}

		private static sort(a:AudioTrack, b:AudioTrack) {
			const c = a.language.toUpperCase() || "???";
			const d = b.language.toUpperCase() || "???";
			return (c < d) ? -1 : ((c > d) ? 1 : 0);
		}

		render() {
			this.clean();
			for(const track of this.data) {
				const li = DOM.create("li", undefined, track.language || "???");
				li.addEventListener("click", () => this.selectTrack(track));
				li.classList.toggle("current", track === this.current);
				li.classList.toggle("focused", track === this.highlight);
				this.append(li);
			}
			return super.render();
		}

		selectTrack(value:AudioTrack) {
			super.selectTrack(value);
			for(const track of this.data)
				track.enabled = false;
			this.current.enabled = true;
			this.trigger(new Action.AudioTrackSelected(this.current));
		}
	}

	export class TextTracks extends Tracks<TextTrackItem> {
		private constructor(data:Array<TextTrackItem>, none:TextTrackItem) {
			super(data, data.find(item => item.source.mode === "showing") || none);
		}

		static create(video:HTMLVideoElement, languages:Array<string> | undefined):TextTracks | undefined {
			const source = video.textTracks;
			if(!source || !source.length || source.length < 1)
				return undefined;
			const list:Array<TextTrackItem> = [];
			const useLanguages = languages?.length === source.length;
			for(let i = 0; i < source.length; i++) {
				const label = (useLanguages ? languages![i] : undefined) || source[i]?.language || "???";
				list.push({source:source[i]!, label});
			}
			list.sort(this.sort);
			const none = {source:video.addTextTrack("captions", "off", "off"), label:"off"};
			list.push(none);
			return new TextTracks(list, none);
		}

		private static sort(a:TextTrackItem, b:TextTrackItem) {
			return (a.label < b.label) ? -1 : ((a.label > b.label) ? 1 : 0);
		}

		render() {
			this.clean();
			for(const track of this.data) {
				const li = DOM.create("li", undefined, track.label);
				li.addEventListener("click", () => this.selectTrack(track));
				li.classList.toggle("current", track === this.current);
				li.classList.toggle("focused", track === this.highlight);
				this.append(li);
			}
			return super.render();
		}

		selectTrack(value:TextTrackItem) {
			super.selectTrack(value);
			for(const track of this.data)
				track.source.mode = "disabled";
			if(this.current)
				this.current.source.mode = "showing";
			this.trigger(new Action.TextTrackSelected(this.current.source));
		}
	}

	type TextTrackItem = {
		readonly source:TextTrack;
		readonly label:string;
	}
}
