const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const StaticHandler = require("./StaticHandler.js");

module.exports = class CacheHandler extends StaticHandler {
	constructor(){
		super();
		this.cache = {};
	}
	
	init(){
		console.log("Building cache:");
		fs.readdirSync(this.base).forEach(file => {
			if(path.extname(file) === ".html" && this.isFile(path.join(this.base, file)))
				this.cacheFile(file);
		});
	}
	
	cacheFile(file){
		const filePath = path.join(this.base, file);
		const content = fs.readFileSync(filePath);
		const data = {
			raw: content,
			deflate: zlib.deflateSync(content),
			gzip: zlib.gzipSync(content),
			br: zlib.brotliCompressSync(content)};
		this.cache[filePath] = data;
		console.log(`  ${file} raw:${data.raw.length} deflate:${data.deflate.length} gzip:${data.gzip.length} br:${data.br.length}`)
	}
	
	handlePath(request, response, path){
		const data = this.cache[path];
		if(data)
			return this.serveCachedContent(request, response, path, data)
		return super.handlePath(request, response, path);
	}
	
	serveCachedContent(request, response, path, data){
		const acceptEncoding = request.headers['accept-encoding'];
		if(/\bbr\b/.test(acceptEncoding))
			return this.write(path, response, data.br, 'br');
		if(/\bdeflate\b/.test(acceptEncoding))
			return this.write(path, response, data.deflate, 'deflate');
		if(/\bgzip\b/.test(acceptEncoding))
			return this.write(path, response, data.gzip, 'gzip');
		return this.write(path, response, data.raw);
	}
	
	write(path, response, content, contentEncoding){
		const contentType = this.getContentType(path);
		const headers = this.getDefaultHeaders(contentType);
		if(contentEncoding)
			headers['Content-Encoding'] = contentEncoding;
		response.writeHead(this.getStatusCode(path), headers);
		response.end(content);
		return true;
	}
}
