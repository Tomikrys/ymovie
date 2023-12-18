namespace ymovie.util.Thumbnail {
	export function smallPoster(source:string | undefined):string | undefined {
		if(!source)
			return undefined;
			
		let url = source.replace("http://", "https://");

		// https://www.themoviedb.org/talk/53c11d4ec3a3684cf4006400
		// http://image.tmdb.org/t/p/original/4W24saRPKCJIwsvrf76zmV6FlsD.jpg
		if(url.indexOf("image.tmdb.org") > -1)
			return url.replace("/original/", "/w342/");

		// https://img.csfd.cz/files/images/film/posters/158/066/158066908_cf9118.jpg
		// to https://image.pmgstatic.com/cache/resized/w180/files/images/film/posters/158/066/158066908_cf9118.jpg
		if(url.indexOf("img.csfd.cz") > -1)
			return url.replace("//img.csfd.cz", "//image.pmgstatic.com/cache/resized/w180");

		// https://image.pmgstatic.com/files/images/film/posters/167/107/167107831_b01ee4.jpg
		// to https://image.pmgstatic.com/cache/resized/w180/files/images/film/posters/167/107/167107831_b01ee4.jpg
		if(url.indexOf("//image.pmgstatic.com/files") > -1)
			return url.replace("//image.pmgstatic.com/files", "//image.pmgstatic.com/cache/resized/w180/files");

		// https://thetvdb.com/banners/series/375903/posters/5e86c5d2a7fcb.jpg
		// to https://thetvdb.com/banners/series/375903/posters/5e86c5d2a7fcb_t.jpg
		// https://thetvdb.com/banners/posters/71470-2.jpg
		// to // https://thetvdb.com/banners/posters/71470-2_t.jpg
		if(url.indexOf("thetvdb.com") > -1)
			return url.replace(/^(?!.+_t)(.+)(\.[a-z]+)$/, "$1_t$2");

		// https://assets.fanart.tv/fanart/movies/13475/movieposter/star-trek-54d39f41a8ab8.jpg
		// to https://fanart.tv/detailpreview/fanart/movies/13475/movieposter/star-trek-54d39f41a8ab8.jpg
		if(url.indexOf("assets.fanart.tv") > -1)
			return url.replace("assets.fanart.tv", "fanart.tv/detailpreview");
		return url;
	}

	export function largeBackground(source:string | undefined):string | undefined {
		if(!source)
			return undefined;
		
		let url = source.replace("http://", "https://");

		// https://image.tmdb.org/t/p/original//z8TvnEVRenMSTemxYZwLGqFofgF.jpg
		// to https://image.tmdb.org/t/p//w1280/z8TvnEVRenMSTemxYZwLGqFofgF.jpg
		if(url.indexOf("image.tmdb.org") > -1)
			return url.replace("/original/", "/w1280/");
		return url;
	}
}
