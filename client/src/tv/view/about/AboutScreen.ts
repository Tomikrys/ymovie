namespace ymovie.tv.view.about {
	import DOM = ymovie.util.DOM;

	export class AboutScreen extends Screen {
		render() {
			this.append(DOM.h1("About"));
			return super.render();
		}
	}
}
