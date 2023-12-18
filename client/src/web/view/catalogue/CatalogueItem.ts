namespace ymovie.web.view.catalogue {
	import Catalogue = ymovie.type.Catalogue;
	import DataComponent = ymovie.view.DataComponent;

	export class CatalogueItem<TData extends Catalogue.AnyItem> extends DataComponent<HTMLDivElement, TData> {
		constructor(data:TData){
			super("div", data);
			this.element.classList.add("CatalogueItem");
			this.element.addEventListener("click", 
				() => this.trigger(this.selectAction));
		}
		
		get selectAction():ymovie.type.Action.Base {
			return new type.Action.CatalogueItemSelected({item:this.data});
		}
	}
}
