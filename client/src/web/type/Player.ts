namespace ymovie.web.type.Player {
	export abstract class Base {}

	export class Cast extends Base {}

	export class Kodi extends Base {
		readonly position:KodiPosition;

		constructor(position:KodiPosition) {
			super();
			this.position = position;
		}
	}

	export type KodiPosition = 1 | 2;
}
