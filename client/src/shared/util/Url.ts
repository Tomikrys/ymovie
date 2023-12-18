namespace ymovie.util.Url {
	export function setParam(url:string, name:string, value:string):string {
		const keyVal = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
		const urlChunks = url.split("?");
		if(urlChunks.length < 2)
			return `${url}?${keyVal}`; 
		
		let match = false;
		let newUrl = `${urlChunks[0]}?`;
		const queryChunks = urlChunks[1]?.split("&")!;
		for (const queryChunk of queryChunks) {
			if(decodeURIComponent(queryChunk.split("=")[0]!) === name) {
				match = true;
				newUrl += `&${keyVal}`;	
			} else {
				newUrl += `&${queryChunk}`;
			}
		}
		if(!match)
			newUrl += `&${keyVal}`;
		return newUrl.replace("?&", "?");
	}

	export function getParam(url:string, name:string):string | undefined {
		const queryChunks = url.split("?")[1]?.split("&")!;
		for (const queryChunk of queryChunks) {
			const keyVal = queryChunk.split("=");
			if(decodeURIComponent(keyVal[0]!) === name)
				return decodeURIComponent(keyVal[1]!);
		}
		return;
	}

	export function ensureProtocol(url:string):string {
		if (url.startsWith("//"))
			return `${location.protocol}${url}`;
		if (url.startsWith("http") === false)
			return `${location.protocol}//${url}`;
		return url;
	}

	export function mkUrlArgs(dict:Record<string,string | number | boolean | undefined>): string {
		const attrs = [];
		for (const key in dict) {
			const val = dict[key];
			if (val === undefined) {
				continue;
			}
			attrs.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`);
		}
	
		return attrs.join('&');
	}
}
