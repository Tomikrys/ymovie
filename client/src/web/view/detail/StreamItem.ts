/// <reference path="StreamOption.ts"/>

namespace ymovie.web.view.detail {
	import DOM = ymovie.util.DOM;
	import Media = ymovie.type.Media;
	import Util = ymovie.util.Util;
	import Watched = ymovie.util.Watched;

	export class StreamItem extends StreamOption<Data> {
		renderInfo(){
			const data = this.data?.stream;
			if(!data)
				return undefined;
			return DOM.span("info", [
				this.add("size", Util.formatSize(data.size)),
				this.add("language", data.language),
				this.add("subtitles", data.subtitles),
				this.add("hdr", data.hdr),
				this.add("3d", data.is3d ? "3D" : undefined),
				this.add("quality", `${data.width}x${data.height}`),
				this.add("codec", `${data.videoCodec}+${data.audioCodec}`),
				this.add("duration", Util.formatDuration(data.duration))]);
		}
		
		add(className:string, value:string | undefined | null):DOM.Content {
			return value ? DOM.span(className, value) : undefined;
		}
		
		onClick(){
			this.loading = true;
			this.trigger(new type.Action.ResolveStreamUrl({stream:<Media.Stream>this.data?.stream, callback:this.onUrl.bind(this)}));
			if(this.data?.source instanceof Media.Movie)
				Watched.addMovie(this.data.source.id);
			if(this.data?.source instanceof Media.Episode) {
				if(this.data.source.seriesId)
					Watched.addSeries(this.data.source.seriesId);
				Watched.addEpisode(this.data.source.id);
			}
		}
		
		onUrl(url:string){
			this.loading = false;
			if(this.data)
				this.update({...this.data, url});
		}
	}

	type Data = {
		stream:Media.Stream;
		source:Media.Playable;
		url?:string;
	}
}
