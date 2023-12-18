/// <reference path="MediaScreenBase.ts"/>

namespace ymovie.tv.view.media {
	import Catalogue = ymovie.type.Catalogue;
	import Scc = ymovie.api.Scc;

	export class MediaScreen extends MediaScreenBase {
		getMenu():Array<Catalogue.Base> {
			return this.context.menu.map(item => {
				return item instanceof Scc.CatalogueLink 
					? new Scc.CatalogueLink(item.group, item.label, Scc.Api.setLimit(item.url, 10), item.subtitle, item.page)
					: item});
		}

		activate(focus:boolean) {
			super.activate(focus);
			if(!this.rowContainer.children.length)
				this.appendCatalogue(this.getMenu(), focus);
		}
	}
}
