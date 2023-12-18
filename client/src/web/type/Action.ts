namespace ymovie.web.type.Action {
	import Catalogue = ymovie.type.Catalogue;
	import Media = ymovie.type.Media;
	import Status = ymovie.type.Status;
	import Base = ymovie.type.Action.Base;

	export class GoBack extends Base<undefined> {
		constructor() {
			super(undefined);
		}
	}

	export class GoHome extends Base<boolean> {}
	export class ShowSetup extends Base<boolean> {}
	export class ShowAbout extends Base<boolean> {}
	export class Search extends Base<SearchData> {}
	export class CastStatusUpdates extends Base<Status> {}
	export class CatalogueItemSelected extends Base<CatalogueItemSelectedData> {}
	export class ResolveStreams extends Base<ResolveStreamsData> {}
	export class ResolveStreamUrl extends Base<ResolveStreamUrlData> {}
	export class Play extends Base<PlayData> {}
	export class ShowNotification extends Base<ShowNotificationData> {}

	export type SearchData = {
		query?:string;
		page?:number;
	}

	export type PlayData = {
		player:Player.Base;
		media:Media.Playable;
		url:string;
	}

	export type ResolveStreamsData = {
		data:Media.Playable;
		callback:(list:Array<Media.Stream>) => void;
	}

	export type ResolveStreamUrlData = {
		stream:Media.Stream; 
		callback:(url:string) => void;
	}

	export type CatalogueItemSelectedData = {
		item:Catalogue.AnyItem;
		replace?:boolean;
	}

	type ShowNotificationData = {
		title:string;
		message:string;
		html:boolean;
	}
}
