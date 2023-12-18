namespace ymovie.tv.view {
	import Action = ymovie.tv.type.Action;
	import Component = ymovie.view.Component;
	import Context = ymovie.tv.type.Context;

	export abstract class Screen extends Component<HTMLDivElement> {
		protected readonly context:Context;
		protected lastFocus:Action.FocusData | undefined;
		private active:boolean = false;

		constructor(context:Context) {
			super("div");
			this.context = context;
			this.element.classList.add("Screen");
			this.listen(Action.Focused, this.onFocused.bind(this));
		}

		get isActive() {
			return this.active;
		}

		activate(focus:boolean) {
			this.active = true;
			if(focus)
				this.trigger(new Action.RequestFocus(this.lastFocus));
		}

		deactivate() {
			this.active = false;
		}

		onFocused(event:CustomEvent<Action.FocusData>) {
			this.lastFocus = event.detail;
		}
	}
}