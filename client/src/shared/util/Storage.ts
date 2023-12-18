namespace ymovie.util {
	export class Storage {
		private static get storage():globalThis.Storage | undefined {
			try {
				return window.localStorage;
			} catch(error) {
				// not available in "data:" origin/protocol
				return;
			}
		}
		
		static set(key:string, value:string):void {
			this.storage?.setItem(key, value);
		}
		
		static get(key:string):string | null {
			return this.storage?.getItem(key) ?? null;
		}
		
		static remove(key:string):void {
			this.storage?.removeItem(key);
		}
	}
}
