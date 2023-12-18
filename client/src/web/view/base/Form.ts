namespace ymovie.web.view.base {
	import Component = ymovie.view.Component
	
	export class Form extends Component<HTMLFormElement> {
		constructor(){
			super("form");
			this.element.addEventListener("submit", this.onSubmit.bind(this));
		}
		
		async process() {}
		
		async onSubmit(event:Event) {
			event.preventDefault();
			this.loading = true;
			await this.process();
			this.loading = false;
		}
	}
}
