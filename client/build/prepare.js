const fs = require("fs");
const path = require("path");

const copyDir = (src, dst) => {
	fs.mkdirSync(dst, {recursive:true});
	const entries = fs.readdirSync(src, {withFileTypes:true});

	for (const entry of entries) {
		const srcPath = path.join(src, entry.name);
		const destPath = path.join(dst, entry.name);
		entry.isDirectory() ?
			copyDir(srcPath, destPath) :
			fs.copyFileSync(srcPath, destPath);
	}
}

const ___dirname = path.resolve();
const src = ___dirname + "/client/static";
const dst = ___dirname + "/dist/client";
copyDir(src, dst);
