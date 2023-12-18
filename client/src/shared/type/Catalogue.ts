namespace ymovie.type.Catalogue {
	export abstract class Base {
		readonly label:string;
		readonly group:ItemType;

		constructor(group:ItemType, label:string) {
			this.group = group;
			this.label = label;
		}
	}

	export type AnyItem = Base | Media.Base;

	export type ItemType = "movie" | "series" | "folder" | "concert" | "fairyTale" | "animated" | "popular" | "watched";
}
