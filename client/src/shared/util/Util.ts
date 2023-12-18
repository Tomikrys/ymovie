namespace ymovie.util.Util {
	export function isArray(value:any):boolean {
		return value && typeof value === 'object' && value.constructor === Array;
	}
	
	export function isObject(value:any):boolean {
		return value && typeof value === 'object' && value.constructor === Object;
	}
	
	export function isString(value:any):boolean {
		return typeof value === 'string';
	}
	
	export function isNumber(value:any):boolean {
		return typeof value === 'number';
	}
	
	export function isError(value:any):boolean {
		return value instanceof Error;
	}
	
	export function getAndroidVersion():string | undefined {
		const match = navigator.userAgent.match(/Android\s([0-9\.]+)/);
		return match ? match[1] : undefined;
	}
	
	export function removeDiacritics(source:string):string {
		// @ts-ignore
		return source.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
	}
	
	export function unshiftAndLimit<T>(source:Array<T>, item:T, length:number):Array<T> {
		const list = source.filter(i => i !== item)
		list.unshift(item);
		return list.splice(0, length);
	}
	
	// https://stackoverflow.com/questions/105034/how-to-create-guid-uuid
	export function uuidv4():string {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
			var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}
	
	// variable to be provided by build script
	export function getCommitDate(){
		try {
			return new Date(parseFloat("${COMMIT_DATE}") || 0);
		} catch(error){
			return new Date;
		}
	}

	export function formatSize(value:number | undefined):string | undefined {
		if(!value)
			return undefined;
		const mb = value / 1024 / 1024;
		return mb > 100 ? (mb / 1024).toFixed(1) + "G" : mb.toFixed(1) + "M";
	}

	export function formatDuration(value:number | undefined):string | undefined {
		let seconds = value ? value | 0 : 0;
		let minutes = (seconds / 60) | 0;
		seconds %= 60;
		let hours = (minutes / 60) | 0;
		minutes %= 60;
		return `${hours}:${pad(minutes)}:${pad(seconds)}`;
	}

	function pad(value:number):string {
		return value < 10 ? `0${value}` : value + "";
	}

	export function containsExtension(url:string):boolean {
		var chunks = url.split(".");
		var extension = chunks[chunks.length - 1];
		return extension ? extension.length < 5 : false;
	}
}
