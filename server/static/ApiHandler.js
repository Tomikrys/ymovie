module.exports = class ApiHandler {
	cleanupInterval = 60 * 60 * 1000;
	pairExpiration = 5 * 60 * 1000;
	pendingPairing = {};

	constructor() {
		setInterval(this.cleanup.bind(this), this.cleanupInterval);
	}

	cleanup() {
		const time = new Date().getTime() - this.pairExpiration;
		for(const key in this.pendingPairing)
			if(this.pendingPairing[key].date.getTime() < time)
				delete this.pendingPairing[key];
	}

	async handle(request, response) {
		const url = request.url.split("/");
		if(url.length < 3 || url[1] !== "api" || url[2] !== "v1")
			return false;

		if(url.length === 5 && url[3] === "pair") {
			if(request.method === "GET")
				return this.handleGetPair(url[4], request, response);
			if(request.method === "PUT")
				return await this.handlePutPair(url[4], request, response);
		}
		return false;
	}

	handleGetPair(deviceId, request, response) {
		const entry = this.pendingPairing[deviceId];
		if(!entry)
			return false;
		
		delete this.pendingPairing[deviceId];
		response.writeHead(200);
		response.end(JSON.stringify({token:entry.token}));
		return true;
	}

	async handlePutPair(deviceId, request, response) {
		return new Promise((resolve, reject) => {
			if(!deviceId)
				resolve(false);

			request.on("data", chunk => {
				const token = Buffer.from(chunk).toString();
				if(!token)
					return resolve(false);

				this.pendingPairing[deviceId] = {token, date:new Date()};
				response.writeHead(200);
				response.end();
				resolve(true);
			});
		})
	}
}
