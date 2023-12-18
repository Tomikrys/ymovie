namespace ymovie.tv.view {
	import Action = type.Action;
	import Catalogue = type.Catalogue;
	import Focus = util.Focus;
	import GA = ymovie.util.GA;
	import Keyboard = util.Keyboard;
	import Media = ymovie.type.Media;
	import Nav = util.Nav;
	import Scc = ymovie.api.Scc;
	import ScreenId = type.ScreenId;
	import Timeout = ymovie.util.Timeout;
	import Watched = ymovie.util.Watched;

	export class App extends ymovie.view.App {
		private readonly api = new api.Api();
		private readonly nav = new Nav.Manager();
		private readonly ga = new GA();
		private readonly focus = new Focus.Manager();
		private readonly header = new Header();
		private readonly notification = new Notification();
		private readonly context:type.Context = {deviceId:this.api.deviceId, menu:this.menu};
		private readonly mediaScreen = new media.MediaScreen(this.context);
		private readonly searchScreen = new search.SearchScreen(this.context);
		private readonly setupScreen = new setup.SetupScreen(this.context);
		private readonly aboutScreen = new about.AboutScreen(this.context);
		private readonly playerScreen = new player.PlayerScreen(this.context);
		private readonly help = new Help();
		private readonly mouseActivityTimeout = new Timeout(1000);

		static async init(){
			util.Polyfill.init();
			await new App().init();
		}

		private async init():Promise<any> {
			this.menu.push(new Catalogue.Callback("watched", "Watched Movies", this.loadWatchedMovies.bind(this)));
			this.menu.push(new Catalogue.Callback("watched", "Watched Series", this.loadWatchedSeries.bind(this)));

			this.api.webshareStatusChanged.add(this.onApiWebshareStatus.bind(this));

			this.listen(Action.CatalogueItemSelected, this.onCatalogueItemSelected.bind(this));
			this.listen(Action.RequestFocus, event => this.requestFocus(event.detail?.component));
			this.listen(Action.ShowScreen, event => this.showScreen(event.detail));
			this.listen(Action.Play, this.onPlay.bind(this));
			this.listen(Action.EmulateFocusAction, event => this.executeFocusAction(event.detail));
			this.listen(Action.Search, this.onSearch.bind(this));
			this.listen(Action.ShowNotification, event => this.showNotification(event.detail));
			this.listen(Action.RequestMoreItems, this.onRequestMoreItems.bind(this));
			this.listen(Action.GoBack, () => this.nav.goBack());
			this.listen(Action.Log, event => this.help.logMessage(event.detail));

			this.ga.init();

			await this.api.init();

			this.nav.changed.add(this.onNavChange.bind(this));
			this.nav.init();

			this.render();
			this.initDeeplink();
			this.element.classList.toggle("initializing", false);

			document.addEventListener("keydown", this.onDocumentKeyDown.bind(this));
			document.addEventListener("mousemove", this.onDocumentMouseMove.bind(this));
		}

		private initDeeplink(){
			const nav = this.nav;
			const path = nav.current;
			if(nav.isAbout(path))
				return nav.goAbout();
			if(nav.isSearch(path))
				return nav.goSearch();
			if(nav.isSetup(path))
				return nav.goSetup();
			this.nav.goHome();
		}

		render(){
			this.append([this.mediaScreen.render(), 
				this.searchScreen.render(),
				this.setupScreen.render(),
				this.aboutScreen.render(),
				this.playerScreen.render(),
				this.header.render(),
				this.notification.render(),
				this.help.render()]);
			return super.render();
		}

		private ensureFocus(component:Focus.IFocusable) {
			if(!this.focus.focusedComponent)
				this.requestFocus(component);
		}

		private requestFocus(component:Focus.IFocusable | undefined) {
			this.focus.focusedComponent = component;
		}

		private showScreen(id:ScreenId) {
			const nav = this.nav;
			if(id === "about")
				return nav.goAbout();
			if(id === "player")
				return nav.goPlayer();
			if(id === "search")
				return nav.goSearch();
			if(id === "setup")
				return nav.goSetup();
			return nav.goHome();
		}

		private showNotification(data:Action.ShowNotificationData) {
			this.notification.update(data);
		}

		private activateScreen(screenId:ScreenId, screen:Screen, defaultFocus?:Focus.IFocusable) {
			util.ClassName.updateType(this.element, "screen", screenId);
			this.header.current = screenId;
			const screens:Array<Screen> = [this.aboutScreen, this.mediaScreen, this.playerScreen, this.searchScreen, this.setupScreen];
			for(const item of screens)
				if(item != screen && item.isActive)
					item.deactivate();
			screen.activate(this.focus.focusedComponent !== defaultFocus);
			if(defaultFocus)
				this.ensureFocus(defaultFocus);
		}

		private executeFocusAction(action:Focus.Action) {
			const components = this.trigger(new Action.RegisterFocusable());
			const result = this.focus.executeEvent(components, {action});
			if(!result && action === "back")
				this.nav.goBack();
		}

		private async loadWatchedMovies() {
			return this.api.loadIds(Watched.movies, "more");
		}

		private async loadWatchedSeries() {
			return this.api.loadIds(Watched.series, "more");
		}

		private async onCatalogueItemSelected(event:CustomEvent<Action.CatalogueItemSelectedData>) {
			const {data} = event.detail;
			if(data instanceof Scc.CatalogueLink)
				return this.trigger(new Action.CatalogueLoaded({item:data, newRow:true, catalogue:await this.api.loadPath(data.url, "more")}));
			if(data instanceof Catalogue.Callback)
				return this.trigger(new Action.CatalogueLoaded({item:data, newRow:true, catalogue:await data.callback()}));
			if(data instanceof Media.Series)
				return this.trigger(new Action.CatalogueLoaded({item:data, newRow:true, catalogue:await this.api.loadSeasons(data.id, "more")}));
			if(data instanceof Media.Season)
				return this.trigger(new Action.CatalogueLoaded({item:data, newRow:true, catalogue:await this.api.loadEpisodes(data.id, "more")}));
			if(data instanceof Media.PlayableScc)
				return this.trigger(new Action.StreamsLoaded({media:data, streams:await this.api.loadStreams(data)}));
			return;
		}

		private async onRequestMoreItems(event:CustomEvent<Scc.CatalogueLink>) {
			const data = event.detail;
			return this.trigger(new Action.CatalogueLoaded({item:data, newRow:false, catalogue:await this.api.loadPath(data.url, "more")}));
		}

		private async onSearch(event:CustomEvent<string>) {
			return this.trigger(new Action.SearchCatalogueLoaded(await this.api.searchScc(event.detail, "more")));
		}

		private async onPlay(event:CustomEvent<Action.PlayData>) {
			const {stream, media} = event.detail;
			const url = this.api.webshareToken ? await this.api.resolveStreamUrl(stream) : undefined;
			this.trigger(new Action.StreamUrlResolved({media, stream, url}));
			if(url) {
				this.playerScreen.update({media:event.detail.media, stream:event.detail.stream, url});
				this.showScreen("player");
			}

			if(media instanceof Media.Movie)
				Watched.addMovie(media.id);
			if(media instanceof Media.Episode) {
				if(media.seriesId)
					Watched.addSeries(media.seriesId);
				Watched.addEpisode(media.id);
			}
		}

		private onNavChange(data:Nav.ChangeData) {
			const nav = this.nav;
			const path = data;
			this.ga.pageview(document.location.pathname, document.title);
			if(nav.isAbout(path))
				this.activateScreen("about", this.aboutScreen, this.header);
			else if(nav.isPlayer(path))
				this.activateScreen("player", this.playerScreen);
			else if(nav.isSearch(path))
				this.activateScreen("search", this.searchScreen, this.header);
			else if(nav.isSetup(path))
				this.activateScreen("setup", this.setupScreen, this.header);
			else
				this.activateScreen("media", this.mediaScreen, this.header);
		}

		private onDocumentKeyDown(event:KeyboardEvent) {
			this.trigger(new Action.GlobalKeyDown(event));
			if(event.defaultPrevented)
				return;

			const action = Keyboard.eventToAction(event);
			if(action) {
				event.preventDefault();
				this.executeFocusAction(action);
			} else {
				this.help.logKey(event);
			}
		}

		private onDocumentMouseMove() {
			this.element.classList.toggle("mouseActive", true);
			this.mouseActivityTimeout.start(() => this.element.classList.toggle("mouseActive", false));
		}
	}
}
