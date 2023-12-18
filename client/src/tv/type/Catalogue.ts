namespace ymovie.tv.type.Catalogue {
	import TCatalogue = ymovie.type.Catalogue;

	export class Callback extends TCatalogue.Base {
		readonly callback:() => Promise<Array<TCatalogue.AnyItem>>;

		constructor(group:TCatalogue.ItemType, label:string, callback:() => Promise<Array<TCatalogue.AnyItem>>) {
			super(group, label);
			this.callback = callback;
		}
	}
}
