namespace ymovie.tv.view.search {
	import Action = ymovie.tv.type.Action;
	import Catalogue = ymovie.type.Catalogue;
	import Context = ymovie.tv.type.Context;
	import DOM = ymovie.util.DOM;
	import Timeout = ymovie.util.Timeout;

	export class SearchScreen extends media.MediaScreenBase {
		private readonly osk = new OSK();
		private readonly input = DOM.input(undefined, "q", "", "Search query");
		private readonly searchTimeout = new Timeout(1000);
		private lastSearch = "";
		private _onGlobalKeyDown = this.onGlobalKeyDown.bind(this);
		private _onSearchCatalogueLoaded = this.onSearchCatalogueLoaded.bind(this);

		constructor(context:Context) {
			super(context);
			this.updateActiveFocus("osk");
			
			this.osk.listen(Action.OSKKeySubmit, this.onOSKKeySubmit.bind(this));
			this.osk.listen(Action.Focused, this.onOSKKeyFocused.bind(this));
			this.input.addEventListener("input", this.resetSearchTimeout.bind(this));
			this.input.addEventListener("change", this.resetSearchTimeout.bind(this));
		}

		activate(focus:boolean) {
			super.activate(focus);
			this.listenGlobal(Action.GlobalKeyDown, this._onGlobalKeyDown);
			this.listenGlobal(Action.SearchCatalogueLoaded, this._onSearchCatalogueLoaded);
		}

		deactivate() {
			this.searchTimeout.stop();
			this.unlistenGlobal(Action.GlobalKeyDown, this._onGlobalKeyDown);
			this.unlistenGlobal(Action.SearchCatalogueLoaded, this._onSearchCatalogueLoaded);
			super.deactivate();
		}

		render() {
			this.append([this.osk.render(), this.input]);
			return super.render();
		}

		private resetSearchTimeout() {
			this.searchTimeout.stop();
			if(this.input.value.length && this.input.value != this.lastSearch)
				this.searchTimeout.start(this.onSearch.bind(this));
		}

		private delaySearchTimeout() {
			if(this.searchTimeout.running)
				this.resetSearchTimeout();
		}

		private applyInsert(value:string) {
			this.input.value += value;
			this.resetSearchTimeout();
		}

		private applyDel() {
			const input = this.input;
			input.value = input.value.substr(0, Math.max(input.value.length - 1, 0));
			this.resetSearchTimeout();
		}

		private onGlobalKeyDown(event:CustomEvent<KeyboardEvent>) {
			if(this.getActiveFocus() !== "osk")
				return;
			const source = event.detail;
			const char = source.key || String.fromCharCode(source.which || source.keyCode);
			if(char && char.match(/^[a-z]$/i)) {
				source.preventDefault();
				this.applyInsert(char);
			} else if(char === " ") {
				source.preventDefault();
				this.applyInsert(" ");
			} else if(this.input.value && (source.key === "Backspace" || source.key === "Delete" 
				|| source.which === 8 || source.which === 46)) {
				source.preventDefault();
				this.applyDel();
			}
			this.delaySearchTimeout();
		}

		private onOSKKeyFocused() {
			this.updateActiveFocus("osk");
		}

		private onOSKKeySubmit(event:CustomEvent<Action.OSKKeyData>) {
			const {type, value} = event.detail;
			if(type === "del")
				this.applyDel();
			else if(type === "space")
				this.applyInsert(" ");
			else
				this.applyInsert(value);
		}

		private onSearch() {
			this.removeCatalogues();
			this.lastSearch = this.input.value;
			this.loading = true;
			this.trigger(new Action.Search(this.input.value));
		}

		private onSearchCatalogueLoaded(event:CustomEvent<Array<Catalogue.AnyItem>>) {
			this.loading = false;
			this.appendCatalogue(event.detail, false);
		}
	}
}
