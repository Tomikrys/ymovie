namespace ymovie.tv.view {
	import DataComponent = ymovie.view.DataComponent;
	import DOM = ymovie.util.DOM;

	export class Pair extends DataComponent<HTMLDivElement, string> {
		constructor(data:string) {
			super("div", data);
		}

		render() {
			this.clean();
			const p = DOM.p();
			p.innerHTML = `Visit <a href="https://ymovie.streamcinema.cz/#/setup">ymovie.streamcinema.cz/#/setup</a> and follow instructions for TV pairing.`;
			this.append([DOM.h1(this.data), p]);
			return super.render();
		}
	}
}
