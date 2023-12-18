namespace ymovie.web.view.detail {
	import DataComponent = ymovie.view.DataComponent
	import DOM = ymovie.util.DOM;
	import Media = ymovie.type.Media;
	import Player = type.Player;
	import PlayerWindow = ymovie.web.util.PlayerWindow;
	import Util = ymovie.util.Util;

	export class StreamOption<TData extends {source?:Media.Playable, url?:string}> extends DataComponent<HTMLDivElement, TData> {
		constructor(data:TData){
			super("div", data);
			this.element.classList.add("StreamOption");
		}
		
		get url(){
			return this.data.url;
		}
		
		render(){
			this.clean();
			const info = this.renderInfo();
			info?.addEventListener("click", this.onClick.bind(this));
			this.append([info, this.renderOptions()]);
			return super.render();
		}
		
		renderInfo():HTMLElement | undefined {
			return undefined;
		}
		
		renderOptions(){
			const url = this.url;
			if(!url)
				return null;
			
			const isYoutube = url.indexOf("youtube.com") > -1;
			const notYoutube = isYoutube ? undefined : true;

			const download = notYoutube && this.link("download", "Download", () => url);
			
			const android = notYoutube && Util.getAndroidVersion()
				&& this.link("android", "Play on Android", () => `intent:${url}#Intent;action=android.intent.action.VIEW;type=video/*;end`);
			
			const url2 = Util.containsExtension(url) && `${url}.mkv`;
			const android2 = notYoutube && url2 && Util.getAndroidVersion()
				&& this.link("android fix", "Play on Android", () => `intent:${url2}#Intent;action=android.intent.action.VIEW;type=video/*;end`);
			
			const play = this.link("play", "Play in new window", () => isYoutube ? url : PlayerWindow.getURL(url));
			
			const cast = notYoutube && DOM.span("cast", "Cast");
			cast?.addEventListener("click", () => this.triggerPlay(new Player.Cast()));
			
			const kodi = notYoutube && DOM.span("kodi", "Play in Kodi");
			kodi?.addEventListener("click", () => this.triggerPlayKodi(new Player.Kodi(1), kodi));
			
			const kodi2 = notYoutube && DOM.span("kodi2", "Play in Kodi");
			kodi2?.addEventListener("click", () => this.triggerPlayKodi(new Player.Kodi(2), kodi2));
			
			const vlc = notYoutube && this.link("vlc", "Play on VLC", () => `vlc://${url}`);
			const potplayer = notYoutube && this.link("potplayer", "Play in Potplayer", () => `potplayer://${url}`);
			const infuse = notYoutube && this.link("infuse", "Play in Infuse", () => `infuse://x-callback-url/play?url=${encodeURIComponent(url)}`);
			const iina = notYoutube && this.link("iina", "Play in IINA", () => `iina://weblink?url=${encodeURIComponent(url)}`);

			return DOM.div("options", [download, android || undefined, android2 || undefined,
				play, cast, kodi, kodi2, vlc, potplayer, infuse, iina]);
		}

		private triggerPlay(player:Player.Base){
			this.trigger(new type.Action.Play({player, media:<Media.Playable>this.data?.source, url:<string>this.url}));
		}

		private triggerPlayKodi(player:Player.Kodi, button:HTMLElement) {
			this.triggerPlay(player);
			button.classList.add("loading");
			setTimeout(() => button.classList.remove("loading"), 4000)
		}

		private link(className:string, content:string, getUrl:() => string) {
			const result = DOM.span(className, content);
			result.onclick = () => window.open("", "_blank")!.location.href = getUrl();
			return result;
		}

		onClick() {}
	}
}
