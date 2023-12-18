namespace ymovie.web.view {
	import Action = type.Action;
	import Catalogue = ymovie.type.Catalogue;
	import DOM = ymovie.util.DOM;
	import GA = ymovie.util.GA;
	import Media = ymovie.type.Media;
	import Nav = util.Nav;
	import Player = type.Player;
	import Protector = ymovie.web.util.Protector;
	import Status = ymovie.type.Status;
	import Watched = ymovie.util.Watched;
	import WebCatalogue = type.Catalogue;

	export class App extends ymovie.view.App {
		api:api.Api | undefined;
		nav:Nav.Manager | undefined;
		ga:GA | undefined;
		setupView:setup.SetupView | undefined;
		aboutView:AboutView | undefined;
		discoveryView:discovery.DiscoveryView | undefined;
		detailView:detail.DetailView | undefined;
		notificationView:NotificationView | undefined;

		static async init(){
			Protector.init();
			const result = new App();
			await result.init();
		}
		
		async init():Promise<any> {
			// cast only works on filesystem, localhost or https (for real domains)
			// also do not redirect on IP, as there is no https alternative
			if(location.protocol === "http:" 
				&& location.hostname !== "localhost" 
				&& location.hostname !== "localhost.charlesproxy.com"
				&& !location.hostname.match(/^[\.0-9]+$/))
				return location.protocol = "https:";
			
			this.initPWA();
			this.api = new api.Api();
			this.nav = new Nav.Manager();
			this.ga = new GA();
			this.menu.push(new WebCatalogue.Callback("watched", "Watched Movies", this.nav.goSccWatchedMovies.bind(this.nav)));
			this.menu.push(new WebCatalogue.Callback("watched", "Watched Series", this.nav.goSccWatchedSeries.bind(this.nav)));
			
			this.setupView = new setup.SetupView(this.api);
			this.aboutView = new AboutView();
			this.discoveryView = new discovery.DiscoveryView();
			this.detailView = new detail.DetailView(this.api);
			this.notificationView = new NotificationView();

			this.listen(Action.GoBack, this.nav.goBack.bind(this.nav));
			this.listen(Action.Search, event => this.search(event.detail));
			this.listen(Action.CatalogueItemSelected, event => this.selectCatalogueItem(event.detail));
			this.listen(Action.ResolveStreams, event => this.resolveStreams(event.detail));
			this.listen(Action.ResolveStreamUrl, event => this.resolveStreamUrl(event.detail));
			this.listen(Action.GoHome, event => this.nav?.goHome(event.detail));
			this.listen(Action.ShowSetup, event => this.nav?.goSetup(event.detail));
			this.listen(Action.ShowAbout, event => this.nav?.goAbout(event.detail));
			this.listen(Action.ShowNotification, event => this.showNotification(event.detail.title, event.detail.message, event.detail.html));
			this.listen(Action.Play, event => this.play(event.detail));
			
			this.ga.init();
			
			this.nav.changed.add(this.onNavChange.bind(this));
			this.nav.init();
			
			this.api.castStatusChanged.add(this.onApiCastStatus.bind(this));
			this.api.kodiStatusChanged.add(this.onApiKodiStatus.bind(this));
			this.api.webshareStatusChanged.add(this.onApiWebshareStatus.bind(this));
			await this.api.init();
			
			this.render();
			await this.initDeeplink();
			this.element.classList.toggle("initializing", false);
			
			this.initCast();
			this.initAnalytics();
		}
		
		async initPWA(){
			try {
				if(Nav.Manager.PROTOCOL_HTTPS)
					navigator.serviceWorker.register("/manifest-worker.js");
			} catch(error) {}
		}
		
		async initDeeplink(){
			if(!this.api || !this.nav)
				return;

			const {path, sccMediaId, webshareMediaId, sccLinkLabel} = this.nav.locationData;
			const sccLink = sccLinkLabel && this.menu.find(item => sccLinkLabel == this.nav?.safePath(item.label));
			if(sccMediaId)
				return this.nav.goReplaceMedia(<Media.Base>await this.api.loadMedia(sccMediaId));
			if(webshareMediaId)
				return this.nav.goReplaceMedia(await this.api.loadWebshareMedia(webshareMediaId));
			if(sccLink && sccLink instanceof ymovie.api.Scc.CatalogueLink)
				return this.nav.goSccBrowse(sccLink);
			
			if(this.nav.isAbout(path))
				return this.nav.goAbout(true);
			if(this.nav.isSetup(path))
				return this.nav.goSetup(true);
			if(this.nav.isSccWatchedMovies(path))
				return this.nav.goSccWatchedMovies(true);
			if(this.nav.isSccWatchedSeries(path))
				return this.nav.goSccWatchedSeries(true);
			this.nav.goHome(true);
		}
		
		initCast(){
			DOM.append(document.body, DOM.script("https://www.gstatic.com/cv/js/sender/v1/cast_sender.js"));
		}
		
		initAnalytics(){
			DOM.append(document.body, DOM.script(GA.URL));
		}
		
		render(){
			this.append([
				this.updateCatalogue(this.menu, "home"),
				this.detailView?.render(),
				this.setupView?.render(),
				this.aboutView?.render(),
				this.notificationView?.render()]);
			return super.render();
		}
		
		showNotification(title:string, message:string, html:boolean=false) {
			this.notificationView?.update({title, message, html});
		}

		async loadCatalogue(data:Array<Catalogue.AnyItem> | undefined, command:() => Promise<Array<Catalogue.AnyItem> | undefined>, type?:string):Promise<any> {
			if(data)
				return this.updateCatalogue(data, type);
			
			this.scrollTop();
			this.loading = true;
			try {
				const catalogue = await command();
				this.updateCatalogue(catalogue || [], type);
				this.nav?.assignCatalogue(catalogue);
			} catch(error:any){
				this.updateCatalogue(error, type);
			}
			this.loading = false;
		}
		
		scrollTop(){
			window.scrollTo(0, 0);
		}
		
		updateCatalogue(catalogue:Array<Catalogue.AnyItem> | Error | undefined, type?:string){
			return this.discoveryView?.update({type, catalogue});
		}
		
		search(data:Action.SearchData) {
			if(!data.query)
				return this.nav?.goHome();
			if(this.api?.isWebshareSearchQuery(data.query))
				return this.nav?.goWebshareSearch(data.query, data.page || 0);
			this.nav?.goSccSearch(data.query);
		}
		
		selectCatalogueItem(data:Action.CatalogueItemSelectedData){
			const item = data.item;
			if(item instanceof ymovie.api.Scc.CatalogueLink) {
				this.nav?.goSccBrowse(item);
			} else if(item instanceof ymovie.api.Webshare.CatalogueSearch) {
				this.search({query:item.query, page:item.page});
			} else if(item instanceof WebCatalogue.Callback) {
				item.callback();
			} else if(item instanceof Media.Episode) {
				this.nav?.goSccEpisode(item, data.replace);
			} else if(item instanceof Media.Movie) {
				this.nav?.goSccMovie(item, data.replace);
			} else if(item instanceof Media.Season) {
				this.nav?.goSccSeason(item);
				this.scrollTop();
			} else if(item instanceof Media.Series) {
				this.nav?.goSccSeries(item);
				this.scrollTop();
			} else if(item instanceof Media.Webshare) {
				this.nav?.goWebshareVideo(item, data.replace);
			}
		}
		
		async resolveStreams(data:Action.ResolveStreamsData){
			if(!this.api)
				return;
			if(data.data instanceof Media.Webshare)
				data.callback(await this.api.loadWebshareStreams(data.data));
			else
				data.callback(await this.api.loadStreams(data.data));
		}
		
		async resolveStreamUrl(data:Action.ResolveStreamUrlData){
			try {
				if(this.api)
					data.callback(await this.api.resolveStreamUrl(data.stream));
			} catch (error:any) {
				this.showNotification("Webshare error", error.message);
			}
		}
		
		async play(data:Action.PlayData){
			const {player, media, url} = data;
			const notificationTitle = player instanceof Player.Cast ? "Cast" : "Kodi";
			try {
				if(this.api && player instanceof Player.Cast) {
					await this.api.playOnCast(media, url);
				} else if(this.api && player instanceof Player.Kodi) {
					await this.api.playOnKodi(player.position, url);
					this.ga?.pageview("kodi.html", "YMovie Kodi connector");
				}
				this.showNotification(`${notificationTitle} Success`, `Playing ${media.title}`);
			} catch(error:any) {
				this.showNotification(`${notificationTitle} Error`, error);
			}
		}
		
		onApiCastStatus(status:Status){
			this.toggleApiClass("cast", status);
		}
		
		onApiKodiStatus(position:Player.KodiPosition, status:Status){
			const key = "kodi" + (position === 1 ? "" : "2");
			this.toggleApiClass(key, status);
		}
		
		async onNavChange(data:Nav.ChangeData){
			if(!this.api || !this.nav || !this.detailView || !this.setupView || !this.aboutView || !this.discoveryView)
				return;

			this.ga?.pageview(data.url, data.title);
			const nav = this.nav;
			const previousPath = data.previous?.path || "";
			const path = data.path || "";
			const state = data.state;
			const isDetail = (path:string) => nav.isSccMovie(path) || nav.isSccEpisode(path) || nav.isWebshareVideo(path);
			
			/** Short circuit here on popup closing to avoid flickering catalogue. 
			 * Flickering is caused by catalogue data is replaced by the very same 
			 * coming from history state, which recreates it from serialized data. */
			if(isDetail(previousPath) && !isDetail(path))
				return this.detailView.hide();
			if(nav.isSetup(previousPath))
				return this.setupView.hide();
			if(nav.isAbout(previousPath))
				return this.aboutView.hide();
			
			if(nav.isSetup(path))
				return this.setupView.show();
			if(nav.isAbout(path))
				return this.aboutView.show();
			if(nav.isSccWatchedMovies(path))
				return await this.loadCatalogue(undefined,
					async () => await this.api?.loadIds(Watched.movies, data.title));
			if(nav.isSccWatchedSeries(path))
				return await this.loadCatalogue(undefined,
					async () => await this.api?.loadIds(Watched.series, data.title));
			if(isDetail(path))
				return this.detailView.update({detail:<Media.Playable>state.source, list:<Array<Catalogue.AnyItem>>this.discoveryView.data?.catalogue});
			if(nav.isSccSeries(path))
				return await this.loadCatalogue(state?.catalogue,
					async () => await this.api?.loadSeasons((<Media.Series>state.source).id, data.title));
			if(nav.isSccSeason(path))
				return await this.loadCatalogue(state?.catalogue,
					async () => await this.api?.loadEpisodes((<Media.Episode>state.source).id, data.title));
			if(nav.isSccBrowse(path))
				return await this.loadCatalogue(state?.catalogue,
					async () => await this.api?.loadPath(<string>(<ymovie.api.Scc.CatalogueLink>state.source).url, data.title));
			
			this.discoveryView.searchQuery = (<Nav.StateSearch>state.source)?.query || "";
			if(nav.isSccSearch(path))
				return await this.loadCatalogue(state?.catalogue,
					async () => await this.api?.searchScc((<Nav.StateSearch>state.source).query, data.title));
			if(nav.isWebshareSearch(path))
				return await this.loadCatalogue(state?.catalogue,
					async () => await this.api?.searchWebshare((<Nav.StateSearch>state.source).query, data.title, <number>(<Nav.StateSearch>state.source).page), "webshare");
			
			this.updateCatalogue(this.menu, "home");
		}
	}
}
