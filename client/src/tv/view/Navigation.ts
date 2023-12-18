namespace ymovie.tv.view {
	import Action = type.Action;
	import Component = ymovie.view.Component;
	import DOM = ymovie.util.DOM;
	import Focus = util.Focus;

	export class Navigation extends Component<HTMLDivElement> {
		private readonly left = DOM.span("left");
		private readonly right = DOM.span("right");
		private readonly up = DOM.span("up");
		private readonly down = DOM.span("down");

		constructor() {
			super("div");

			this.append([this.left, this.right, this.up, this.down]);

			this.left.addEventListener("click", () => this.triggerAction("left"));
			this.right.addEventListener("click", () => this.triggerAction("right"));
			this.up.addEventListener("click", () => this.triggerAction("up"));
			this.down.addEventListener("click", () => this.triggerAction("down"));
		}

		triggerAction(action:Focus.Action) {
			this.trigger(new Action.EmulateFocusAction(action));
		}
	}
}
