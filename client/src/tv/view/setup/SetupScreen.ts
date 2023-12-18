namespace ymovie.tv.view.setup {
	export class SetupScreen extends Screen {
		render() {
			this.clean();
			this.append(new Pair(this.context.deviceId).render());
			return super.render();
		}
	}
}
