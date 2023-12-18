namespace ymovie.web.view.base {
	import DataComponent = ymovie.view.DataComponent
	import DOM = ymovie.util.DOM;

	export class Dialogue<TData> extends DataComponent<HTMLDivElement, TData> {
		protected readonly content:HTMLDivElement;
		protected readonly closeButton:HTMLButtonElement;
		protected translateX = 0;
		protected translateY = 0;

		private scrollable:boolean;
		private _onDocumentKeyDown = this.onDocumentKeyDown.bind(this);

		constructor(scrollable:boolean, data:TData) {
			super("div", data);

			this.scrollable = scrollable;

			this.element.classList.add("Dialogue");
			this.element.classList.toggle("scrollable", scrollable);
			this.element.addEventListener("transitionend", this.onTransitionEnd.bind(this));
			
			this.content = DOM.div("content");
			this.closeButton = DOM.button("close", "close");
			this.closeButton.addEventListener("click", this.onCloseClick.bind(this));
		}
		
		get isVisible() {
			return this.element.classList.contains("visible");
		}
		
		show() {
			this.element.classList.toggle("visible", true);
			this.element.classList.toggle("transition", true);
			if(this.scrollable) {
				this.translateY = window.scrollY;
				this.transformContent();
			}
			document.addEventListener("keydown", this._onDocumentKeyDown);
		}
		
		hide() {
			this.element.classList.toggle("visible", false);
			this.element.classList.toggle("transition", true);
			document.removeEventListener("keydown", this._onDocumentKeyDown);
		}

		transformContent() {
			this.content.style.transform = `translate(${this.translateX}px, ${this.translateY}px)`;
		}

		render() {
			this.defaultRender();
			return super.render();
		}
		
		defaultRender() {
			this.clean();
			DOM.clean(this.content);
			DOM.append(this.content, this.renderContent());
			this.append([this.content, this.closeButton]);
		}
		
		renderContent():DOM.Content {
			return undefined;
		}

		close() {
			this.hide();
		}
		
		onTransitionEnd() {
			this.element.classList.toggle("transition", false);
		}
		
		onCloseClick() {
			this.close();
		}

		onDocumentKeyDown(event:KeyboardEvent) {
			if(event.key == "Escape")
				return this.close();
		}
	}
}
