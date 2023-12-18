/// <reference path="../util/MD5.ts"/>
/// <reference path="../util/Sha.ts"/>
/// <reference path="../util/Url.ts"/>

namespace ymovie.api.Webshare {
	import Catalogue = type.Catalogue;
	import MD5 = util.MD5;
	import Media = type.Media;
	import Sha = util.Sha;
	import Url = ymovie.util.Url;

	export class Api {
		static ENDPOINT = "https://webshare.cz";
		static PATH_SALT = "/api/salt/";
		static PATH_LOGIN = "/api/login/";
		static PATH_USER_DATA = "/api/user_data/";
		static PATH_FILE_LINK = "/api/file_link/";
		static PATH_FILE_PASSWORD_SALT = "/api/file_password_salt/";
		static PATH_FILE_PROTECTED = "/api/file_protected/";
		static PATH_SEARCH = "/api/search/";
		static PATH_FILE_INFO = "/api/file_info/";

		private uuid:string;

		constructor(uuid:string){
			this.uuid = uuid;
		}

		async getToken(username:string, password:string){
			const salt = await this.getSalt(username);
			return await this.getLogin(username, password, salt);
		}
		
		async load(path:string, body:string):Promise<Element> {
			const url = `${Api.ENDPOINT}${path}`;
			const headers = {'Content-Type': 'application/x-www-form-urlencoded'};
			const response = await (await fetch(url, {method:"POST", body, headers})).text();
			const xml = new DOMParser().parseFromString(response, "application/xml");
			try {
				const response = xml.getElementsByTagName("response")[0];
				if(!response)
					throw new Error("Unexpected response");
				if(response.getElementsByTagName("status")?.[0]?.textContent !== "OK")
					throw new Error(response.getElementsByTagName("message")?.[0]?.textContent || undefined);
				return response;
			} catch (error) {
				throw error;
			}
		}
		
		async loadValue(path:string, body:string, param:any):Promise<string> {
			const xml = await this.load(path, body);
			return xml.getElementsByTagName(param)[0].textContent;
		}
		
		async getSalt(username:string){
			const body = Url.mkUrlArgs({
				username_or_email: username,
			});
			return await this.loadValue(Api.PATH_SALT, body, "salt");
		}
		
		async getLogin(username:string, password:string, salt:string){
			const body = Url.mkUrlArgs({
				username_or_email: username,
				keep_logged_in: 1,
				password: Sha.sha1(MD5.md5crypt(password, salt)),
			});
			return await this.loadValue(Api.PATH_LOGIN, body, "token");
		}
		
		async getUsername(token:string){
			const body = Url.mkUrlArgs({
				wst: token,
			});
			return await this.loadValue(Api.PATH_USER_DATA, body, "username");
		}
		
		async getLink(ident:string, token:string, password?:string):Promise<string> {
			// when ymovie served from http: or file:, download button in chrome/ws make some strange redirects and download fails
			// const force_https = (location.protocol === "https:") ? 1 : 0;
			// https works always
			const force_https = 1;
			const body = Url.mkUrlArgs({
				ident,
				wst: token,
				device_uuid: this.uuid,
				force_https,
				download_type: "video_stream",
				device_vendor: "ymovie",
				password: password || undefined
			});
			return await this.loadValue(Api.PATH_FILE_LINK, body, "link");
		}

		async getFilePasswordSalt(ident:string):Promise<string> {
			const body = `ident=${encodeURIComponent(ident)}`;
			return await this.loadValue(Api.PATH_FILE_PASSWORD_SALT, body, "salt");
		}

		async getFileProtected(ident:string):Promise<boolean> {
			const body = `ident=${encodeURIComponent(ident)}`;
			return (await this.loadValue(Api.PATH_FILE_PROTECTED, body, "protected")) === '1';
		}
		
		async search(what:string, page:number){
			const limit = 100;
			const body = Url.mkUrlArgs({
				what,
				sort: "recent",
				limit,
				offset: page * limit,
				category: "video",
			});
			return await this.load(Api.PATH_SEARCH, body);
		}
		
		async fileInfo(ident:string):Promise<Element> {
			const body = Url.mkUrlArgs({
				ident,
			});
			return await this.load(Api.PATH_FILE_INFO, body);
		}
	}

	export class Parser {
		static searchResponseToCatalogue(data:Element, query:string, title:string, page:number):Array<Catalogue.AnyItem> {
			const total = this.getInt(data, "total");
			const result:Array<Catalogue.AnyItem> = this.getElementsByTagNameArray(data, "file")
				.map(item => this.normalizeItem(item));
			const pageCount = Math.ceil(total / 100);
			if(page)
				result.unshift(new CatalogueSearch("folder", title, `${page}/${pageCount}`, query, page - 1));
			if(page + 1 < pageCount)
				result.push(new CatalogueSearch("folder", title, `${page + 2}/${pageCount}`, query, page + 1));
			return result;
		}
		
		static fileInfoToItem(data:Element, ident:string):Media.Webshare {
			return this.normalizeItem(data, ident);
		}
		
		static fileInfoToStreams(ident:string, data:Element):Array<Media.Stream> {
			const video = this.getFirst(data, "video");
			const audio = this.getFirst(data, "audio");
			const stream:Media.Stream = {
				ident,
				name: this.getText(data, 'name'),
				media: this.getText(data, 'media'),
				size: this.getInt(data, "size"),
				duration: this.getInt(data, "length"),
				width: this.getInt(this.getFirst(video, "stream"), "width"),
				height: this.getInt(this.getFirst(video, "stream"), "height"),
				videoCodec: this.getElementsByTagNameArray(video, "stream")
					.map(item => this.getText(item, "format"))
					.join("/"),
				audioCodec: this.getElementsByTagNameArray(audio, "stream")
					.map(item => this.getText(item, "format"))
					.join("/"),
			}
			return [stream];
		}

		private static getFirst(source:Element | undefined, param:string):Element | undefined {
			return source && source.getElementsByTagName(param)?.[0];
		}
		
		private static getText(source:Element, param:string):string | undefined {
			return this.getFirst(source, param)?.textContent || undefined;
		}
		
		private static getInt(source:Element | undefined, param:string):number {
			return parseInt((source && this.getText(source, param)) || "");
		}
		
		// ES5 complains Type 'HTMLCollectionOf<Element>' is not an array type.
		private static getElementsByTagNameArray(data:Element | undefined, qualifiedName:string):Array<Element> {
			if(!data)
				return [];
			const list = data.getElementsByTagName(qualifiedName);
			const result:Array<Element> = [];
			for(let i = 0; i < list.length; i++)
				result.push(<Element>list[i]);
			return result;
		}

		private static normalizeItem(item:Element, id?:string):Media.Webshare {
			const result = new Media.Webshare(id || <string>this.getText(item, "ident"));
			result.poster = this.getText(item, "img");
			result.title = result.longTitle = this.getText(item, "name");
			const ratingPositive = this.getInt(item, "positive_votes");
			const ratingNegative = this.getInt(item, "negative_votes");
			if(ratingPositive || ratingNegative)
				result.rating = `${ratingPositive || 0}:${ratingNegative || 0}`;
			result.size = this.getInt(item, "size");
			return result;
		}
	}

	export class CatalogueSearch extends Catalogue.Base {
		readonly subtitle:string;
		readonly query:string;
		readonly page:number;

		constructor(group:Catalogue.ItemType, label:string, subtitle:string, query:string, page:number) {
			super(group, label);
			this.subtitle = subtitle;
			this.query = query;
			this.page = page;
		}
	}
}
