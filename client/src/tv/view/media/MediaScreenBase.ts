namespace ymovie.tv.view.media {
	import Action = type.Action;
	import ClassName = util.ClassName;
	import Context = ymovie.tv.type.Context;
	import DOM = ymovie.util.DOM;
	import Media = ymovie.type.Media;

	export abstract class MediaScreenBase extends Screen {
		protected readonly rowContainer:HTMLDivElement;
		private readonly detail:Detail;
		private lastFocusedCatalogue:Action.CatalogueItemFocusedData | undefined;
		private readonly _onCatalogueLoaded = this.onCatalogueLoaded.bind(this);
		private readonly _onStreamsLoaded = this.onStreamsLoaded.bind(this);

		constructor(context:Context) {
			super(context);
			this.element.classList.add("MediaScreenBase");
			this.detail = new Detail(context);
			this.rowContainer = DOM.div("rows");
			this.updateActiveFocus("rows");

			this.listen(Action.CatalogueItemFocused, this.onCatalogueItemFocused.bind(this));
			this.detail.listen(Action.Focused, this.onDetailFocused.bind(this));
			this.listen(Action.BlurStreams, this.onBlurStreams.bind(this));
			this.listen(Action.CatalogueItemSelected, this.onCatalogueItemSelected.bind(this));
		}

		activate(focus:boolean) {
			super.activate(focus);
			this.listenGlobal(Action.CatalogueLoaded, this._onCatalogueLoaded);
			this.listenGlobal(Action.StreamsLoaded, this._onStreamsLoaded);
		}

		deactivate() {
			this.unlistenGlobal(Action.CatalogueLoaded, this._onCatalogueLoaded);
			this.unlistenGlobal(Action.StreamsLoaded, this._onStreamsLoaded);
			super.deactivate();
		}

		render() {
			this.append([this.detail.render(), this.rowContainer, new Navigation().render()]);
			return super.render();
		}

		protected appendCatalogue(data:RowData, requestFocus:boolean) {
			if(!data.length)
				return;
			const row = new Row(data);
			DOM.append(this.rowContainer, row.render());
			if(requestFocus)
				this.trigger(new Action.RequestFocus({component:row, element:row.element}));
		}

		protected removeCatalogues() {
			DOM.clean(this.rowContainer);
		}

		protected updateActiveFocus(value:string) {
			ClassName.updateType(this.element, "focus", value);
		}

		protected getActiveFocus() {
			return ClassName.getType(this.element, "focus");
		}

		private onCatalogueItemSelected(event:CustomEvent<Action.CatalogueItemSelectedData>) {
			const element = event.detail.element;
			const container = this.rowContainer;
			while(container.lastChild && !container.lastChild.contains(element))
				DOM.remove(container.lastChild);
		}

		private onCatalogueItemFocused(event:CustomEvent<Action.CatalogueItemFocusedData>) {
			const {data, element} = event.detail;
			this.lastFocusedCatalogue = event.detail;
			this.updateActiveFocus("rows");
			this.detail.update(data instanceof Media.Base ? data : undefined);
			const container = this.rowContainer;
			let className = "up";
			for(let child = container.firstElementChild; child; child = child.nextElementSibling) {
				if(child.contains(element)) {
					className = "down";
					child.classList.remove("up");
					child.classList.remove("down");
					util.Transform.on(container, `translateY(${-(<HTMLElement>child).offsetTop}px)`);
				} else {
					child.classList.add(className);
					child.classList.remove(className == "down" ? "up" : "down");
				}
			}
		}

		private onDetailFocused() {
			this.updateActiveFocus("detail");
		}

		private onBlurStreams() {
			const item = this.lastFocusedCatalogue;
			if(item)
				this.trigger(new Action.RequestFocus({component:item.component, element:item.element}));
		}

		private onCatalogueLoaded(event:CustomEvent<Action.CatalogueLoadedData>) {
			if(event.detail.newRow)
				this.appendCatalogue(event.detail.catalogue, true);
		}

		private onStreamsLoaded(event:CustomEvent<Action.StreamsLoadedData>) {
			this.detail.updateStreams(event.detail);
		}
	}
}
