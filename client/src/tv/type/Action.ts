namespace ymovie.tv.type.Action {
	import Base = ymovie.type.Action.Base;
	import Catalogue = ymovie.type.Catalogue;
	import Focus = util.Focus;
	import Media = ymovie.type.Media;
	import Scc = ymovie.api.Scc;
	import ScreenId = type.ScreenId;

	export class CatalogueItemSelected extends Base<CatalogueItemSelectedData> {}
	export class RequestMoreItems extends Base<Scc.CatalogueLink> {}
	export class CatalogueItemFocused extends Base<CatalogueItemFocusedData> {}
	export class RequestFocus extends Base<FocusData | undefined> {}
	export class Focused extends Base<FocusData> {}
	export class ShowScreen extends Base<ScreenId> {}
	export class CatalogueLoaded extends Base<CatalogueLoadedData> {}
	export class SearchCatalogueLoaded extends Base<Array<Catalogue.AnyItem>> {}
	export class StreamsLoaded extends Base<StreamsLoadedData> {}
	export class Play extends Base<PlayData> {}
	export class EmulateFocusAction extends Base<Focus.Action> {}
	export class OSKKeySubmit extends Base<OSKKeyData> {}
	export class GlobalKeyDown extends Base<KeyboardEvent> {}
	export class Search extends Base<string> {}
	export class ShowNotification extends Base<ShowNotificationData> {}
	export class StreamUrlResolved extends Base<StreamUrlResolvedData> {}
	export class Log extends Base<string> {}
	export class AudioTrackSelected extends Base<AudioTrack> {}
	export class TextTrackSelected extends Base<TextTrack | undefined> {}

	export class RegisterFocusable extends Base<Array<Focus.IFocusable>> {
		constructor() {super([]);}
	}


	
	export class BlurStreams extends Base<undefined> {
		constructor() {super(undefined);}
	}

	export class GoBack extends Base<undefined> {
		constructor() {super(undefined);}
	}

	export type FocusData = {
		readonly component:Focus.IFocusable;
		readonly element:HTMLElement;
	}


	export type PlayData = {
		readonly media:Media.Playable;
		readonly stream:Media.Stream;
	}

	export type CatalogueItemSelectedData = {
		readonly data:Catalogue.AnyItem;
		readonly component:Focus.IFocusable;
		readonly element:HTMLElement;
	}

	export type CatalogueItemFocusedData = {
		readonly data:Catalogue.AnyItem;
		readonly component:Focus.IFocusable;
		readonly element:HTMLElement;
	}

	export type CatalogueLoadedData = {
		readonly item:Catalogue.AnyItem;
		readonly catalogue:Array<Catalogue.AnyItem>;
		readonly newRow:boolean;
	}

	export type StreamsLoadedData = {
		readonly media:Media.PlayableScc;
		readonly streams:Array<Media.Stream>;
	}

	export type OSKKeyData = {
		readonly type:OSKAction;
		readonly value:string;
	}

	export type ShowNotificationData = {
		readonly title:string;
		readonly message:string;
		readonly html:boolean;
	}

	export type StreamUrlResolvedData = PlayData & {
		readonly url:string | undefined;
	}
}
