namespace ymovie.tv.view {
	import Action = ymovie.tv.type.Action;
	import Component = ymovie.view.Component;
	import DOMUtil = util.DOMUtil;
	import Focus = util.Focus;

	export class FocusableComponent<TElement extends HTMLElement> 
		extends Component<TElement> implements Focus.IFocusable {
		
		constructor(element:HTMLElement | string) {
			super(element);

			this.listenGlobal(type.Action.RegisterFocusable, this.onRegister.bind(this));
		}

		get focused():boolean {
			return this.element.classList.contains("focused");
		}

		focus():void {
			this.element.classList.add("focused");
			this.trigger(new Action.Focused({component:this, element:this.element}));
		}

		blur():void {
			this.element.classList.remove("focused");
		}

		getBoundingRect():Focus.Rect | undefined {
			const rect = DOMUtil.getGlobalRect(this.element);
			return rect ? new Focus.Rect(rect.left, rect.top, rect.width, rect.height) : undefined;
		}

		getFocusLayer():string {
			return "main";
		}

		executeFocusEvent(_event:Focus.Event):boolean {
			return false;
		}

		modifyFocusEvent(event:Focus.Event):Focus.Event {
			return event;
		}

		allowHorizontalCirculation(_event:Focus.Event):boolean {
			return false;
		}

		onRegister(event:CustomEvent<Array<Focus.IFocusable>>) {
			if ((<HTMLElement>event.target).contains(this.element))
				if(this.getBoundingRect())
					event.detail.push(this);
		}
	}
}