namespace ymovie.tv.view {
	import Action = type.Action;
	import DOM = ymovie.util.DOM;
	import DOMUtil = util.DOMUtil;
	import Focus = util.Focus;
	import ScreenId = type.ScreenId;

	export class Header extends FocusableComponent<HTMLDivElement> {
		current:ScreenId = "media";

		private readonly list:Array<ScreenId> = ["media", "search", "setup", "about"];

		constructor() {
			super("div");

			this.append([
				this.createDiv("media", "Media"),
				this.createDiv("search", "Search"),
				this.createDiv("setup", "Setup"),
				this.createDiv("about", "About")]);
		}

		private createDiv(id:ScreenId, label:string) {
			const result = DOM.div(id, label);
			result.addEventListener("click", () => this.showScreen(id));
			return result;
		}

		private showScreen(id:ScreenId):boolean {
			this.trigger(new Action.ShowScreen(id));
			return true;
		}

		executeFocusEvent(event:Focus.Event):boolean {
			const index = this.list.indexOf(this.current);
			if(event.action === "left" && index > 0)
				return this.showScreen(this.list[index - 1]!);
			if(event.action === "right" && index < this.list.length - 1)
				return this.showScreen(this.list[index + 1]!);
			return super.executeFocusEvent(event);
		}

		getBoundingRect():Focus.Rect | undefined {
			const rect = super.getBoundingRect();
			if(!rect)
				return undefined;

			const index = this.list.indexOf(this.current);
			if(!this.focused || index === -1) {
				return new Focus.Rect(0, rect.y, document.body.clientWidth, rect.height);
			}

			const itemRect = DOMUtil.getGlobalRect(this.element.children[index]!);
			return itemRect ? new Focus.Rect(itemRect.left, itemRect.top, itemRect.width, itemRect.height) : undefined;
		}
	}
}
