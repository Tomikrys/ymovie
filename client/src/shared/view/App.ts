/// <reference path="Component.ts"/>

namespace ymovie.view {
	import Catalogue = type.Catalogue;
	import Scc = ymovie.api.Scc;
	import Status = type.Status;

	export abstract class App extends Component<HTMLBodyElement> {
		readonly menu:Array<Catalogue.Base> = [
			new Scc.CatalogueLink("movie", "Movies", Scc.Api.PATH_MOVIES),
			new Scc.CatalogueLink("series", "Series", Scc.Api.PATH_SERIES),
			new Scc.CatalogueLink("concert", "Concerts", Scc.Api.PATH_CONCERTS),
			new Scc.CatalogueLink("fairyTale", "Fairy Tales", Scc.Api.PATH_FAIRY_TALES),
			new Scc.CatalogueLink("animated", "Animated Movies", Scc.Api.PATH_ANIMATED_MOVIES),
			new Scc.CatalogueLink("animated", "Animated Series", Scc.Api.PATH_ANIMATED_SERIES),
			new Scc.CatalogueLink("movie", "Movies CZ/SK", Scc.Api.PATH_MOVIES_CZSK),
			new Scc.CatalogueLink("series", "Series CZ/SK", Scc.Api.PATH_SERIES_CZSK),
			new Scc.CatalogueLink("popular", "Popular Movies", Scc.Api.PATH_POPULAR_MOVIES),
			new Scc.CatalogueLink("popular", "Popular Series", Scc.Api.PATH_POPULAR_SERIES),
			new Scc.CatalogueLink("movie", "Added Movies", Scc.Api.PATH_MOVIES_ADDED),
			new Scc.CatalogueLink("series", "Added Series", Scc.Api.PATH_SERIES_ADDED)];

		constructor(){
			super(document.body);
		}

		toggleClass(key:string, toggle:boolean){
			this.element.classList.toggle(key, toggle);
		}

		toggleApiClass(key:string, status:Status){
			this.toggleClass(`${key}-ok`, status === "ok");
			this.toggleClass(`${key}-na`, status === "na");
			this.toggleClass(`${key}-defined`, status === "defined");
		}

		onApiWebshareStatus(status:Status){
			this.toggleApiClass("webshare", status);
		}
	}
}