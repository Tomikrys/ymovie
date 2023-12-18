/// <reference path="StreamOption.ts"/>

namespace ymovie.web.view.detail {
	import DOM = ymovie.util.DOM;

	export class StreamNA extends StreamOption<any> {
		get url(){
			return undefined;
		}
		
		renderInfo(){
			return DOM.span("info", DOM.span("name", "No streams available."));
		}
		
		onClick(){}
	}
}
