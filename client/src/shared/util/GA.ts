namespace ymovie.util {
	export class GA {
		static readonly ID = "UA-183634-10";
		static readonly URL = "https://www.google-analytics.com/analytics.js";

		constructor(){}
		
		init():void {
			// @ts-ignore
			window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
			this.ga('create', GA.ID, 'auto');
			this.ga('send', 'pageview');
		}

		static pageviewScript(path:string):string {
			// breaking <script> into something else so minifiactor will ignore it
			return `<`+`script>
				window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
				ga('create', '${GA.ID}', 'auto');
				ga('send', 'pageview', '${path}');
				</`+`script>
				<`+`script async src="${GA.URL}"></`+`script>`;
		}
		
		pageview(page:string, title:string):void {
			this.ga('set', 'page', page);
			this.ga('set', 'title', title);
			this.ga('send', 'pageview');
		}

		private ga(a:string, b:string, c?:string) {
			// @ts-ignore
			window.ga(a, b, c);
		}
	}
}
