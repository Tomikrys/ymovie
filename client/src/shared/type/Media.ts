namespace ymovie.type.Media {
	export abstract class Base {
		readonly id:string;

		title?:string;
		longTitle?:string;
		rating?:string;
		poster?:string;
		fanart?:string;

		constructor(id:string) {
			this.id = id;
		}
	}

	export abstract class Scc extends Base {
		isCZSK?:boolean;
		year?:string;
		plot?:string;
	}

	export class Season extends Scc {
		subtitle?:string;
		seriesId?:string;
		seriesTitle?:string;
		seasonNumber?:number;
	}

	export class Series extends Scc {}

	export abstract class PlayableScc extends Scc {
		trailers?:Array<Trailer>;
		mpaa?:number;
		studio?:string;
		services?:Services;
		streamCount?:number;
		originalTitle?:string;
		genres?:string;
		directors?:string;
		cast?:string;
		duration?:number;
	}

	export class Movie extends PlayableScc {}

	export class Episode extends PlayableScc {
		subtitle?:string;
		seriesId?:string;
		seriesTitle?:string;
		seasonNumber?:number;
		episodeNumber?:number;
	}

	export class Webshare extends Base {
		size?:number;
	}

	export type Playable = PlayableScc | Webshare;

	export type Stream = {
		size:number;
		language?:string;
		subtitles?:string;
		subtitleList?:Array<string>;
		width:number;
		height:number;
		videoCodec?:string;
		audioCodec?:string;
		duration:number;
		ident:string;
		name?:string;
		media?:string;
		hdr?:string;
		is3d?:boolean;
	}

	type Services = {
		csfd?:number;
		imdb?:number;
		trakt?:number;
		tmdb?:number;
	}

	export type Trailer = {
		title:string;
		url:string;
		language:string;
	}
}
