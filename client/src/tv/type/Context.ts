namespace ymovie.tv.type {
	import Catalogue = ymovie.type.Catalogue;

	export type Context = {
		readonly deviceId:string;
		readonly menu:Array<Catalogue.Base>;
	}
}
