namespace ymovie.web.api {
	/**
	 * Kodi is only available on unsafe ws: protocol which is incompatible with cast api which is 
	 * only available on secured origin. Either the app is loaded over http or https so either 
	 * kodi or cast works.
	 * Decided to use https and this ApiKodi implementation provides connector and messaging between 
	 * parent (https) and child (http) window with kodi api and communication (see kodi.html).
	 */
	export class ApiKodi {
		constructor(){
		}
		
		async isAvailable(endpoint:string):Promise<void> {
			await this.connect(endpoint);
		}
		
		async play(endpoint:string, file:string):Promise<void> {
			const ws = await this.connect(endpoint);
			return new Promise<void>((resolve, reject) => {
				setTimeout(() => {
					reject("Play request timed out.");
					try { ws.close(); } catch(error) {}}, 4000);
				ws.addEventListener("message", event => {
					const response = JSON.parse(event.data);
					if(response.id === id){
						try {
							if(response.result === "OK")
								resolve();
							else
								reject("Unknown play request error");
							ws.close();
						} catch(error) {};
					}
				});

				const id = new Date().getTime();
				const request = {id, method:"Player.Open", params:{item:{file}}, jsonrpc:"2.0"};
				ws.send(JSON.stringify(request));
			})
		}

		private connect(endpoint:string) {
			return new Promise<WebSocket>((resolve, reject) => {
				try {
					const ws = new WebSocket(endpoint);
					ws.addEventListener("open", () => resolve(ws));
					ws.addEventListener("error", () => reject("Connection failed. See instructions below."));
					setTimeout(() => {
						reject("Connection timed out. See instructions below.");
						try { ws.close(); } catch(error) {}}, 4000);
				} catch(error) {
					let message:string = "";
					try { message = (<any>error).message} catch(error) {}
					const origin = endpoint.split("/").slice(0, 3).join("/");
					if(origin) {
						if(message) message += " ";
						message += `Add "${origin}" into chrome://flags/#unsafely-treat-insecure-origin-as-secure .`;
					}
					reject(message);
				}
			})
		}
	}
}
