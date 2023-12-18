namespace ymovie.web.util.Nav {
	import Catalogue = ymovie.type.Catalogue;
	import Media = ymovie.type.Media;
	import Scc = ymovie.api.Scc;
	import Util = ymovie.util.Util;

	export class Manager {
		static PATH_SETUP = "/setup";
		static PATH_ABOUT = "/about";
		
		static PATH_SCC_SEARCH = "/scc/search";
		static PATH_SCC_BROWSE = "/scc/browse";
		static PATH_SCC_MOVIE = "/scc/movie";
		static PATH_SCC_SERIES = "/scc/series";
		static PATH_SCC_SEASON = "/scc/season";
		static PATH_SCC_EPISODE = "/scc/episode";
		static PATH_SCC_WATCHED_MOVIES = "/watched/movies";
		static PATH_SCC_WATCHED_SERIES = "/watched/series";
		
		static PATH_WEBSHARE_SEARCH = "/webshare/search";
		static PATH_WEBSHARE_VIDEO = "/webshare/video";

		static PROTOCOL_HTTP = location.protocol === "http:";
		static PROTOCOL_HTTPS = location.protocol === "https:";

		readonly changed = new ymovie.util.Signal.Signal1<ChangeData>();
		
		private initialHistoryLength = 0;
		private currentState:State | undefined;
		private readonly serializer:Serializer = new Serializer();

		constructor() {}
		
		init(){
			this.initialHistoryLength = history.length;
			window.addEventListener("popstate", this.onWindowPopState.bind(this));
		}
		
		set title(value:string) {
			document.title = value ? `${value} | YMovie` : "YMovie";
		}
		
		get locationData():LocationData {
			const path = location.hash.substr(1);
			const regexp = /^\/[a-z]+\/[a-z]+\/([^\/]+)(\/|$)/;
			const sccMediaId = (this.isSccSeries(path) 
				|| this.isSccSeason(path) 
				|| this.isSccEpisode(path) 
				|| this.isSccMovie(path))
				? path.match(regexp)?.[1] : undefined;
			const webshareMediaId = this.isWebshareVideo(path)
				? path.match(regexp)?.[1] : undefined;
			const sccLinkLabel = this.isSccBrowse(path)
				? path.match(regexp)?.[1] : undefined;
			return {path, sccMediaId, webshareMediaId, sccLinkLabel};
		}
		
		private pushState(source:StateSourceData, title:string, url:string, replace?:boolean):void {
			const enhancedState = new State(new StateSource(source), title, url);
			const historyUrl = !Manager.PROTOCOL_HTTP && !Manager.PROTOCOL_HTTPS && !url.startsWith("#") ? `#${url}` : url;
			history[replace ? "replaceState" : "pushState"](this.serializer.serialize(enhancedState), title, historyUrl);
			this.title = title;
			this.triggerChange(enhancedState);
			this.currentState = enhancedState;
		}
		
		safePath(source:string):string {
			return source ? Util.removeDiacritics(source).replace(/[^a-z0-9]+/gi, '-') : "";
		}
		
		go(data:StateSourceData, path:string, title:string, replace?:boolean):void {
			const dataPage = data instanceof Scc.CatalogueLink ? data.page : null;
			const page = (dataPage && dataPage > 1) ? `/${dataPage}` : '';
			this.pushState(data, title, `#${path}/${this.safePath(title)}${page}`, replace);
		}
		
		goReplaceMedia(data:Media.Base):void {
			this.pushState(data, <string>data.longTitle, location.hash, true);
		}
		
		goBack():void {
			if(this.initialHistoryLength === history.length)
				this.goHome();
			else
				history.back();
		}
		
		assignCatalogue(value:Array<Catalogue.AnyItem> | undefined):void {
			const enhancedState:State = this.serializer.deserialize(history.state);
			if(enhancedState.state)
				enhancedState.state.catalogue = value;
			history.replaceState(this.serializer.serialize(enhancedState), enhancedState.title, enhancedState.url);
		}
		
		private triggerChange(state:State):void {
			const current = this.currentState;
			const previous = current ? new ChangeData(current.state, current.title, current.url, current?.url.substr(1)) : undefined;
			const data = new ChangeData(state.state, state.title, state.url, state.url.substr(1), previous);
			this.changed.dispatch(data);
		}
		
		goHome(replace?:boolean):void {
			this.pushState(undefined, "", "/", replace);
		}
		
		goSetup(replace?:boolean):void {
			this.pushState(undefined, "Setup", `#${Manager.PATH_SETUP}`, replace);
		}
		
		isSetup(path:string):boolean {
			return path?.startsWith(Manager.PATH_SETUP);
		}
		
		goAbout(replace?:boolean):void {
			this.pushState(undefined, "About", `#${Manager.PATH_ABOUT}`, replace);
		}
		
		isAbout(path:string):boolean {
			return path?.startsWith(Manager.PATH_ABOUT);
		}
		
		goSccSearch(query:string):void {
			this.pushState(new StateSccSearch(query), `Search ${query}`, `#${Manager.PATH_SCC_SEARCH}/${this.safePath(query)}`);
		}
		
		isSccSearch(path:string):boolean {
			return path?.startsWith(Manager.PATH_SCC_SEARCH);
		}
		
		goSccBrowse(data:Scc.CatalogueLink):void {
			this.go(data, Manager.PATH_SCC_BROWSE, data.label);
		}
		
		isSccBrowse(path:string):boolean {
			return path?.startsWith(Manager.PATH_SCC_BROWSE);
		}
		
		goSccMovie(data:Media.Movie, replace?:boolean):void {
			this.go(data, `${Manager.PATH_SCC_MOVIE}/${data.id}`, <string>data.title, replace);
		}
		
		isSccMovie(path:string):boolean {
			return path?.startsWith(Manager.PATH_SCC_MOVIE);
		}
		
		goSccSeries(data:Media.Series):void {
			this.go(data, `${Manager.PATH_SCC_SERIES}/${data.id}`, <string>data.title);
		}
		
		isSccSeries(path:string):boolean {
			return path?.startsWith(Manager.PATH_SCC_SERIES);
		}
		
		goSccSeason(data:Media.Season):void {
			this.go(data, `${Manager.PATH_SCC_SEASON}/${data.id}`, <string>data.longTitle);
		}
		
		isSccSeason(path:string):boolean {
			return path?.startsWith(Manager.PATH_SCC_SEASON);
		}
		
		goSccEpisode(data:Media.Episode, replace?:boolean):void {
			this.go(data, `${Manager.PATH_SCC_EPISODE}/${data.id}`, <string>data.longTitle, replace);
		}
		
		isSccEpisode(path:string):boolean {
			return path?.startsWith(Manager.PATH_SCC_EPISODE);
		}
		
		goSccWatchedMovies(relpace?:boolean){
			this.pushState(undefined, "Watched Movies", `#${Manager.PATH_SCC_WATCHED_MOVIES}`, relpace);
		}
		
		isSccWatchedMovies(path:string):boolean {
			return path?.startsWith(Manager.PATH_SCC_WATCHED_MOVIES);
		}
		
		goSccWatchedSeries(relpace?:boolean):void {
			this.pushState(undefined, "Watched Series", `#${Manager.PATH_SCC_WATCHED_SERIES}`, relpace);
		}
		
		isSccWatchedSeries(path:string):boolean {
			return path?.startsWith(Manager.PATH_SCC_WATCHED_SERIES);
		}
		
		goWebshareSearch(query:string, page:number):void {
			this.pushState(new StateWebshareSearch(query, page), `Search ${query}`, 
				`#${Manager.PATH_WEBSHARE_SEARCH}/${this.safePath(query)}` + (page ? `/${page + 1}` : ""));
		}
		
		isWebshareSearch(path:string):boolean {
			return path?.startsWith(Manager.PATH_WEBSHARE_SEARCH);
		}
		
		goWebshareVideo(data:Media.Webshare, replace?:boolean):void {
			this.go(data, `${Manager.PATH_WEBSHARE_VIDEO}/${data.id}`, <string>data.title, replace);
		}
		
		isWebshareVideo(path:string):boolean {
			return path?.startsWith(Manager.PATH_WEBSHARE_VIDEO);
		}
		
		onWindowPopState(event:PopStateEvent):void {
			const state = event.state;
			
			// ignore url entered by user
			if(!state)
				return;
			
			this.title = state?.title;
			const enhancedState = this.serializer.deserialize(state);
			this.triggerChange(enhancedState);
			this.currentState = enhancedState;
		}
	}

	export class State {
		readonly state:StateSource;
		readonly title:string;
		readonly url:string;

		constructor(state:StateSource, title:string, url:string) {
			this.state = state;
			this.title = title;
			this.url = url;
		}
	}

	export abstract class StateSearch {
		readonly query:string;
		readonly page:number;

		constructor(query:string, page:number=0) {
			this.query = query;
			this.page = page;
		}
	}

	export class StateSccSearch extends StateSearch {}
	export class StateWebshareSearch extends StateSearch {}

	export class StateSource {
		source:StateSourceData;
		catalogue:Array<Catalogue.AnyItem> | undefined;

		constructor(source:StateSourceData) {
			this.source = source;
		}
	}

	export type StateSourceData = Catalogue.Base | Media.Base | StateSearch | undefined;

	export class ChangeData extends State {
		path:string;
		previous?:ChangeData;

		constructor(state:StateSource, title:string, url:string, path:string, previous?:ChangeData) {
			super(state, title, url);
			this.path = path;
			this.previous = previous;
		}
	}

	type LocationData = {
		path:string;
		sccMediaId?:string;
		webshareMediaId?:string;
		sccLinkLabel?:string;
	}
}
