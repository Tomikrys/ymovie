namespace ymovie.web.type.Catalogue {
	import TCatalogue = ymovie.type.Catalogue;

	export class Callback extends TCatalogue.Base {
		readonly callback:(replace?:boolean) => void;

		constructor(group:TCatalogue.ItemType, label:string, callback:(replace?:boolean) => void) {
			super(group, label);
			this.callback = callback;
		}
	}
}
