namespace ymovie.tv.view {
	import Action = ymovie.tv.type.Action;
	import Component = ymovie.view.Component;
	import Focus = util.Focus;
	import FocusableComponent = ymovie.tv.view.FocusableComponent;
	import OSKAction = ymovie.tv.type.OSKAction;

	export class OSK extends Component<HTMLDivElement> {
		constructor() {
			super("div");

			const keys = [
				"0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
				"a", "b", "c", "d", "e", "f", "g", "h", "i", "j",
				"k", "l", "m", "n", "o", "p", "q", "r", "s", "t", 
				"u", "v", "w", "x", "y", "z", "SPACE", "DEL"]
			this.append(keys.map(key => new Key(key).render()));
		}
	}

	class Key extends FocusableComponent<HTMLButtonElement> {
		readonly action:string;
		readonly type:OSKAction;

		constructor(action:string) {
			super("button");

			this.action = action;
			this.type = "insert";
			if(this.action === "SPACE")
				this.type = "space";
			if(this.action === "DEL")
				this.type = "del";

			this.element.textContent = action;
			this.element.classList.add(`action-${action}`);
			this.element.addEventListener("click", this.onClick.bind(this));
		}

		executeFocusEvent(event:Focus.Event):boolean {
			if(event.action === "submit") {
				this.submit();
				return true;
			}
			return super.executeFocusEvent(event);
		}

		allowHorizontalCirculation(_event:Focus.Event):boolean {
			return true;
		}

		private submit() {
			this.trigger(new Action.OSKKeySubmit({value:this.action, type:this.type}));
		}

		private onClick() {
			this.trigger(new Action.RequestFocus({component:this, element:this.element}));
			this.submit();
		}
	}
}
