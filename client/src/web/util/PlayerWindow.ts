namespace ymovie.web.util.PlayerWindow {
	import GA = ymovie.util.GA;

	export function getURL(url:string) {
		// breaking <script> into something else so minifiactor will ignore it
		const content = `<!DOCTYPE html>
			<html lang="en">
			<head>
				<title>YMovie Player</title>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<meta name="theme-color" content="#fec401">
				<style>
				html, body {
					margin: 0;
					padding: 0;
					height: 100%;
					background: black;
				}
				video {
					position: absolute;
					left: 0;
					width: 100%;
					max-height: 100%;
					top: 50%;
					transform: translateY(-50%);
				}
				video:focus {
					outline: none;
				}
				</style>
			</head>
			<body></body>
			<`+`script>
				(() => {
					URL.revokeObjectURL(document.location.href);

					const video = document.createElement("video");
					video.controls = true;
					video.src = "${url}";
					video.addEventListener("error", onError, true);
					document.body.appendChild(video);
					
					function onError(event){
						let detail = "";
						const error = event.target.error;
						if(error)
							detail = "\\n\\n" + error.constructor.name + ": " + error.code;
						alert("Browser can't play this video." + detail);
					}
				})();
			</`+`script>
			${GA.pageviewScript("play.html")}
			</html>`;
		
		return URL.createObjectURL(new Blob([content], {type:"text/html"}));
	}
}