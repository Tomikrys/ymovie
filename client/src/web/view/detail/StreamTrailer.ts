namespace ymovie.web.view.detail {
	import DOM = ymovie.util.DOM;
	import Trailer = ymovie.type.Media.Trailer;

	export class StreamTrailer extends StreamOption<Data> {
		renderInfo(){
			const data = this.data.trailer;
			const domain = new URL(data.url).hostname.split(".").splice(-2, 1);
			return DOM.span("info", [
				DOM.span("language", data.language),
				DOM.span("name", data.title), DOM.span("domain", domain)]);
		}
		
		onClick(){
			if(this.data)
				this.update({...this.data, url:this.data.trailer.url});
		}
	}

	type Data = {
		trailer:Trailer;
		url?:string;
	}
}
