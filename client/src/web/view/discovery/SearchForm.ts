namespace ymovie.web.view.discovery {
	import Action = type.Action;
	import DOM = ymovie.util.DOM;
	import Timeout = ymovie.util.Timeout;

	export class SearchForm extends base.Form {
		private input:HTMLInputElement;
		private readonly timeout = new Timeout(1000);

		constructor(){
			super();
			this.input = DOM.input(undefined, "query", undefined, "search");
			this.input.addEventListener("keyup", this.onChange.bind(this));
		}
		
		render(){
			this.clean();
			this.append(this.input);
			return super.render();
		}
		
		set searchQuery(value:string) {
			if(this.input.value !== value)
				this.input.value = value;
		}
		
		async process() {
			this.timeout.stop();
			const query = this.input.value;
			this.trigger(new Action.Search({query}));
		}
		
		onChange(){
			this.timeout.start(this.process.bind(this));
		}
		
		async onSubmit(event:Event) {
			await super.onSubmit(event);
			this.input.blur();
		}
	}
}
