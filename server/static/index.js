const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 8080;
const http = require('http');
const ApiHandler = require("./ApiHandler.js");
const CacheHandler = require("./CacheHandler.js");
const ProxyHandler = require("./ProxyHandler.js");

const apiHandler = new ApiHandler();
const cacheHandler = new CacheHandler();
const proxyHandler = new ProxyHandler();
const debug = process.argv.indexOf("debug") > -1;

if(!debug)
	cacheHandler.init();

const onRequest = async (request, response) => {
	if(cacheHandler.handle(request, response))
		return;
	if(await apiHandler.handle(request, response))
		return;
	if(proxyHandler.handle(request, response))
		return;
	cacheHandler.handle404(request, response);
}

http.createServer(onRequest).listen(port, host, () => {
	console.log(`Server running at http://${host}:${port}/`);
});
