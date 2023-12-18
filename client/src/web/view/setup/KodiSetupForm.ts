namespace ymovie.web.view.setup {
	import DOM = ymovie.util.DOM;
	import Position = type.Player.KodiPosition;

	export class KodiSetupForm extends base.Form {
		api:api.Api;
		position:Position;
		data:Data | undefined;
		endpointInput:HTMLInputElement;

		constructor(api:api.Api, position:Position){
			super();
			this.api = api;
			this.api.kodiStatusChanged.add(this.render.bind(this));
			this.position = position;
			this.element.classList.add(`position${position}`);
			const endpoint = this.api.getKodiEndpoint(this.position);
			this.endpointInput = DOM.input(undefined, "endpoint", endpoint || undefined, `Endpoint #${this.position}`)
		}

		update(data?:Data):HTMLElement {
			this.data = data;
			return this.render();
		}
		
		render(){
			this.clean();
			this.append([
				this.endpointInput,
				DOM.submit(undefined, "Submit")]);
			if(this.data && this.data.error)
				this.append(DOM.span("error", this.data.error));
			return super.render();
		}
		
		async process(){
			const endpoint = this.endpointInput.value;
			try {
				await this.api.connectKodi(this.position, endpoint);
				this.update();
			} catch(error:any) {
				this.update({error});
			}
		}
	}

	type Data = {
		error?:string;
	}
}
