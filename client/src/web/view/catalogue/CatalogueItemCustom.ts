namespace ymovie.web.view.catalogue {
	import Catalogue = ymovie.type.Catalogue;
	import DOM = ymovie.util.DOM;

	export class CatalogueItemCustom<T extends Catalogue.Base> extends CatalogueItem<T> {
		constructor(data:T){
			super(data);
			this.element.classList.add("CatalogueItemCustom");
		}
		
		render(){
			const data = this.data;
			this.element.classList.add(<string>data?.group);
			const name = DOM.span("name", data?.label);
			const subtitle = (data instanceof ymovie.api.Scc.CatalogueLink 
					|| data instanceof ymovie.api.Webshare.CatalogueSearch) && data.subtitle 
				? DOM.span("subtitle", data.subtitle) : null;
			this.append(DOM.span("title", [name, subtitle]));
			return super.render();
		}
	}
}
