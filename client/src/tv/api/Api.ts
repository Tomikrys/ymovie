namespace ymovie.tv.api {
	import Status = ymovie.type.Status;

	export class Api extends ymovie.api.Api {
		private pairIntervalTimeout = 10000;
		private pairInterval:number | undefined;
		private _deviceId:string | undefined;

		constructor() {
			super();
			this._deviceId = this.ymovie.generateDeviceId();
		}

		async init() {
			this.webshareStatusChanged.add(this.onWebshareStatusChanged.bind(this));
			await super.init();
		}

		get deviceId():string {
			return this._deviceId!;
		}

		onWebshareStatusChanged(status:Status) {
			clearInterval(this.pairInterval);
			if(status !== "ok")
				this.pairInterval = setInterval(this.onPairInterval.bind(this), this.pairIntervalTimeout);
		}

		async onPairInterval() {
			const token = await this.ymovie.pairGet(this.deviceId);
			if(!token)
				return;
			this.webshareToken = token;
			this.checkWebshareStatus();
		}
	}
}
