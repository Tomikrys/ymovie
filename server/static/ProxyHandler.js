const http = require('http');
const https = require('https');

module.exports = class ProxyHandler {
	constructor(){
		this.defaultHeaders = {'user-agent': 'Kodi'};
		this.allowedHeaders = ['accept', 'accept-encoding', 'accept-language', 'content-type', 'content-length'];
	}
	
	parseUrl(url){
		const [, proxy, protocol, host, ...path] = url.split('/');
		const [hostname, port] = host.split(':');
		return {valid:proxy === 'proxy', protocol:protocol + ':', hostname, port, path:'/'+path.join('/')};
	}
	
	handle(request, response){
		if(!this.willHandle(request.url))
			return false;

		const proxyHandler = proxyResponse => {
			response.writeHead(proxyResponse.statusCode, proxyResponse.headers);
			proxyResponse.on('data', data => {
				response.write(data);
			});
			proxyResponse.on('end', () => {
				response.end();
			});
		}
		const proxyRequest = this.createRequest(request, proxyHandler);
		proxyRequest.on('error', error => {
			response.writeHead(500);
			response.end();
		});
		
		request.on('data', data => {
			proxyRequest.write(data);
		});
		request.on('end', () => {
			proxyRequest.end();
		});
		
		return true;
	}
	
	willHandle(url){
		try {
			const {valid, protocol} = this.parseUrl(url);
			return valid && (protocol === 'http:' || protocol === 'https:');
		} catch(error){}
		return false;
	}
	
	createRequest(request, handler){
		const {hostname, port, path, protocol} = this.parseUrl(request.url);
		const headers = {...this.defaultHeaders};
		for(const header of this.allowedHeaders)
			if(request.headers.hasOwnProperty(header))
				headers[header] = request.headers[header];
		const options = {hostname, port, headers, path, method: request.method}
		const requester = protocol === 'http:' ? http : https;
		return requester.request(options, handler);
	}
}
