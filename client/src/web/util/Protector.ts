namespace ymovie.web.util.Protector {
	export function init() {
		try {
			// const isDebug = !!document.querySelector('link[rel="stylesheet"]');
			// if(isDebug)
			return;

			// https://stackoverflow.com/questions/7798748/find-out-whether-chrome-console-is-open/68494829#68494829
			document.addEventListener("contextmenu", event => event.preventDefault(), true);

			// DevTools Opened Script
			const stop = () => { debugger; }

			// Detect DevTools (Chrome/Edge)
			// https://stackoverflow.com/a/67148898/9498503 (SeongJun)
			const devtools = () => { };
			devtools.toString = () => {
				stop();
				return '-';
			}

			setInterval(() => {
				try {
					(<any>console).profile(devtools);
					(<any>console).profileEnd(devtools);
					if (console.clear)
						console.clear();
				} catch (error) { }
			}, 500);

			// Detect DevTools (FireFox)
			if (navigator.userAgent.toLowerCase().indexOf("firefox") > -1)
				// Detect Resize (Chrome/Firefox/Edge Works) but (Triggers on Zoom In Chrome and Zoom Out FireFox)
				window.onresize = () => {
					if ((window.outerHeight - window.innerHeight) > 100 || (window.outerWidth - window.innerWidth) > 100)
						stop()
				}

			// Detect Fire Bug
			if (window.console && (<any>window.console).firebug || (<any>console).assert(1) === '_firebugIgnore')
				stop();
		} catch (error) { }
	}
}