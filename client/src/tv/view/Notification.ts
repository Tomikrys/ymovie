namespace ymovie.tv.view {
	import Action = ymovie.tv.type.Action;
	import DataComponent = ymovie.view.DataComponent;
	import DOM = ymovie.util.DOM;
	import Timeout = ymovie.util.Timeout;

	export class Notification extends DataComponent<HTMLDivElement, Data> {
		private readonly hideTimeout = new Timeout(3000);

		constructor() {
			super("div", undefined);
		}

		private set visible(value:boolean) {
			this.element.classList.toggle("visible", value);
		}

		update(data:Data) {
			this.hideTimeout.stop();
			if(data)
				this.hideTimeout.start(() => this.visible = false);
			return super.update(data);
		}

		render() {
			this.clean();
			this.visible = !!this.data;
			if(this.data) {
				const p = DOM.p(undefined);
				if(this.data.html)
					p.innerHTML = this.data.message;
				else
					p.textContent = this.data.message;
				this.append([DOM.h1(this.data.title), p]);
			}
			return super.render();
		}
	}

	type Data = Action.ShowNotificationData | undefined;
}
