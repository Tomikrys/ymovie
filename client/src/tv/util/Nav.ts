namespace ymovie.tv.util.Nav {
	import ScreenId = type.ScreenId;

	export class Manager {
		readonly changed = new ymovie.util.Signal.Signal1<ChangeData>();
		private readonly history:Array<State> = ["media"];
		private historyIndex:number = 0;

		constructor() {}

		init() {
			window.addEventListener("popstate", this.onWindowPopState.bind(this));
		}

		get current():State {
			return this.history[this.historyIndex]!;
		}

		goAbout() {
			this.pushState("about");
		}

		isAbout(path:State):boolean {
			return path === "about";
		}

		goHome() {
			this.pushState("media");
		}

		goPlayer() {
			this.pushState("player");
		}

		isPlayer(path:State):boolean {
			return path === "player";
		}

		goSearch() {
			this.pushState("search");
		}

		isSearch(path:State):boolean {
			return path === "search";
		}

		goSetup() {
			this.pushState("setup");
		}

		isSetup(path:State):boolean {
			return path === "setup";
		}

		goBack():void {
			if(this.historyIndex > 0) {
				this.historyIndex--;
				this.triggerChange();
			}
		}

		private pushState(state:State):void {
			if(state !== this.current) {
				this.history.splice(this.historyIndex + 1);
				this.history.push(state);
				this.historyIndex = this.history.length - 1;
				const apiState:ApiState = {state, index:this.historyIndex};
				history.pushState(apiState, "");
			}
			this.triggerChange();
		}

		private triggerChange():void {
			this.changed.dispatch(this.history[this.historyIndex]!);
		}

		private onWindowPopState(event:PopStateEvent):void {
			const state:ApiState = event.state;
			if(state && state.index >= 0 && state.index < this.history.length) {
				this.historyIndex = state.index;
				this.triggerChange();
			}
		}
	}

	export type State = ScreenId;
	export type ChangeData = State;

	type ApiState = {
		readonly state:State;
		readonly index:number;
	}
}
