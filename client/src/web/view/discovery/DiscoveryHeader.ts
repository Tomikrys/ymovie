namespace ymovie.web.view.discovery {
	import Action = type.Action;
	import Component = ymovie.view.Component
	import DOM = ymovie.util.DOM;

	export class DiscoveryHeader extends Component<HTMLDivElement> {
		searchForm:SearchForm;
		menu:HTMLSpanElement;

		constructor(){
			super("div");
			
			this.searchForm = new SearchForm();
			
			const home = DOM.span("home", "home");
			home.addEventListener("click", () => this.trigger(new Action.GoHome(false)));
			
			const menuButton = DOM.button("menuButton", "menu");
			menuButton.addEventListener("click", this.toggleMenu.bind(this));
			
			const setup = DOM.button("setup", "setup");
			setup.addEventListener("click", this.onSetupClick.bind(this));
			
			const about = DOM.button("about", "about");
			about.addEventListener("click", this.onAboutClick.bind(this));
			
			this.menu = DOM.span("menu", [menuButton, DOM.div("container", [setup, about])]);
			this.append([this.searchForm.render(), home, this.menu]);
		}
		
		set searchQuery(value:string){
			this.searchForm.searchQuery = value;
		}
		
		toggleMenu(){
			this.menu.classList.toggle("expanded");
		}
		
		onSetupClick(){
			this.toggleMenu();
			this.trigger(new Action.ShowSetup(false));
		}
		
		onAboutClick(){
			this.toggleMenu();
			this.trigger(new Action.ShowAbout(false));
		}
	}
}
