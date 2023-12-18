namespace ymovie.view {
	import DOM = util.DOM;
	import Action = type.Action;

	export class Component<TElement extends HTMLElement> {
		element:TElement;

		constructor(element:HTMLElement | string) {
			this.element = util.Util.isString(element) ? <TElement>DOM.create(<string>element) : <TElement>element;
			// @ts-ignore
			this.element.classList.add(this.constructor.name);
		}

		set loading(value:boolean) {
			this.element.classList.toggle("loading", value);
		}

		get loading():boolean {
			return this.element.classList.contains("loading");
		}
		
		trigger<T>(action:Action.Base<T>):T {
			return this.triggerOn(this.element, action);
		}

		triggerGlobal<T>(action:Action.Base<T>):T {
			return this.triggerOn(document.body, action);
		}

		private triggerOn<T>(element:HTMLElement, action:Action.Base<T>):T {
			element.dispatchEvent(new CustomEvent(action.type, {bubbles:true, detail:action.data}));
			return action.data;
		}
		
		listen<T>(type:Action.Class<T>, listener:(event:CustomEvent<T>) => void) {
			this.listenOn(this.element, type, listener);
		}

		listenGlobal<T>(type:Action.Class<T>, listener:(event:CustomEvent<T>) => void) {
			this.listenOn(document.body, type, listener);
		}

		private listenOn<T>(element:HTMLElement, type:Action.Class<T>, listener:(event:CustomEvent<T>) => void) {
			element.addEventListener(Action.Base.getType(type), listener);
		}

		unlisten<T>(type:Action.Class<T>, listener:(event:CustomEvent<T>) => void) {
			this.unlistenOn(this.element, type, listener);
		}

		unlistenGlobal<T>(type:Action.Class<T>, listener:(event:CustomEvent<T>) => void) {
			this.unlistenOn(document.body, type, listener);
		}

		private unlistenOn<T>(element:HTMLElement, type:Action.Class<T>, listener:(event:CustomEvent<T>) => void) {
			element.removeEventListener(Action.Base.getType(type), listener);
		}

		append(content:DOM.Content) {
			DOM.append(this.element, content);
		}
		
		clean() {
			DOM.clean(this.element);
		}
		
		remove() {
			DOM.remove(this.element);
		}

		render():TElement {
			return this.element;
		}
	}
}
