namespace ymovie.util {
	export class Watched {
		private static KEY_WATCHED_MOVIES = "KEY_WATCHED_MOVIES";
		private static KEY_WATCHED_SERIES = "KEY_WATCHED_SERIES";
		private static KEY_WATCHED_EPISODES = "KEY_WATCHED_EPISODES";
		private static MAX_WATCHED_LENGTH = 100;
		
		static addMovie(id:string):void {
			this.add(this.KEY_WATCHED_MOVIES, id);
		}
		
		static get movies():Array<string> {
			return this.get(this.KEY_WATCHED_MOVIES);
		}
		
		static addSeries(id:string):void {
			this.add(this.KEY_WATCHED_SERIES, id);
		}
		
		static get series():Array<string> {
			return this.get(this.KEY_WATCHED_SERIES);
		}
		
		static addEpisode(id:string):void {
			this.add(this.KEY_WATCHED_EPISODES, id);
		}
		
		static get episodes():Array<string> {
			return this.get(this.KEY_WATCHED_EPISODES);
		}
		
		private static add(key:string, id:string):void {
			const max = this.MAX_WATCHED_LENGTH;
			Storage.set(key, Util.unshiftAndLimit(this.get(key), id, max).join(","));
		}
		
		private static get(key:string):Array<string> {
			const data = Storage.get(key);
			return data ? data.split(",") : [];
		}
		
		static getMap():WatchedMap {
			return {
				movies: new Set(this.movies),
				series: new Set(this.series),
				episodes: new Set(this.episodes)
			}
		}
	}

	export type WatchedMap = {
		movies:Set<string>;
		series:Set<string>;
		episodes:Set<string>;
	}
}
