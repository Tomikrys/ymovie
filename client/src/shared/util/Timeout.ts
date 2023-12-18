namespace ymovie.util {
	export class Timeout {
		private readonly interval:number;
		private id:number | undefined;

		constructor(interval:number) {
			this.interval = interval;
		}

		get running():boolean {
			return this.id !== undefined;
		}

		start(handler:Function) {
			this.stop();
			this.id = setTimeout(() => {this.stop(); handler()}, this.interval);
		}

		stop() {
			clearTimeout(this.id);
			this.id = undefined;
		}
	}
}