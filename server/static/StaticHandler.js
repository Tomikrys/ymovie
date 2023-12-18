const fs = require('fs');
const path = require("path");

module.exports = class StaticHandler {
	constructor(){
		this.base = path.join(__dirname, '..', 'client');
		this.path404 = path.join(this.base, '/404.html');
	}

	isFile(path){
		try {
			return fs.lstatSync(path).isFile();
		} catch (e) {
			return false;
		}
	}
	
	handle(request, response){
		const url = request.url.split("?")[0];
		if(this.handlePath(request, response, path.join(this.base, url)))
			return true;
		if(this.handlePath(request, response, path.join(this.base, url, 'index.html')))
			return true;
		return false;
	}
	
	handle404(request, response){
		this.handlePath(request, response, this.path404);
	}
	
	handlePath(request, response, path){
		if(!this.isFile(path))
			return false;
		
		this.writeFile(path, response);
		return true;
	}
	
	getContentType(file){
		const mime = {
			'.css': 'text/css',
			'.html': 'text/html',
			'.jpeg': 'image/jpeg',
			'.jpg': 'image/jpeg',
			'.js': 'text/javascript',
			'.png': 'image/png'}
		return mime[path.extname(file)];
	}
	
	getDefaultHeaders(contentType){
		const result = {'Cache-Control': 'no-store'};
		if(contentType)
			result['Content-Type'] = contentType;
		return result;
	}
	
	getStatusCode(path){
		return (path === this.path404) ? 404 : 200;
	}
	
	writeFile(path, response){
		this.writeHead(response, this.getStatusCode(path), this.getContentType(path));
		response.end(fs.readFileSync(path));
	}
	
	writeHead(response, status, contentType){
		const headers = this.getDefaultHeaders(contentType)
		response.writeHead(status, headers);
	}
}
