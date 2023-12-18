const fs = require("fs");
const path = require("path");

const copyFile = (path) => {
	fs.copyFileSync(___dirname + "/" + path, dst + "/" + path);
}

const ___dirname = path.resolve();
const dst = ___dirname + "/dist";

fs.mkdirSync(dst, {recursive:true});
copyFile("ecosystem.config.js");
copyFile("package-lock.json");
copyFile("package.json");
