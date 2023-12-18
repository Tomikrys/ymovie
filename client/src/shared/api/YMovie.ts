namespace ymovie.api.YMovie {
	export class Api {
		static readonly ENDPOINT = "";

		constructor() {}

		async pairPut(token:string, deviceId:string):Promise<boolean> {
			const url = `/api/v1/pair/${deviceId}`;
			const response = await fetch(url, {method:"PUT", body:token});
			return response.ok;
		}

		async pairGet(deviceId:string):Promise<string | undefined> {
			const url = `/api/v1/pair/${deviceId}`;
			const response = await fetch(url);
			if(!response.ok)
				return;

			const json = await response.json();
			return json && json.token;
		}

		generateDeviceId():string {
			const characters = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ123456789";
			let result = "";
			while(result.length < 4)
				result += characters[Math.floor(Math.random() * characters.length)];
			return result;
		}
	}
}
