module.exports = {
  apps : [{
    name        : "ymovie",
    script      : "./server/index.js",
   	watch: true,
  	ignore_watch: ["node_modules"],
    exec_mode   : 'fork',
    instances   : 1
  }]
}
