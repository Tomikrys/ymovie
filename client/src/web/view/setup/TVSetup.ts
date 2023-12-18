namespace ymovie.web.view.setup {
	import Action = type.Action;
	import DOM = ymovie.util.DOM;

	export class TVSetup extends base.Form {
		api:api.Api;
		input:HTMLInputElement;
		instructions:HTMLParagraphElement;

		constructor(api:api.Api) {
			super();
			this.api = api;
			this.api.webshareStatusChanged.add(this.render.bind(this));

			this.input = DOM.input("id", "id", undefined, "TV id");
			this.input.maxLength = 4;

			this.instructions = DOM.p();
			this.instructions.innerHTML = "Share Webshare authentication with TV. Provide <strong>TV id</strong> as requested by TV app.";
		}

		render() {
			this.clean();

			const disabled = !this.api.webshareToken;
			this.element.disabled = disabled
			this.element.classList.toggle("disabled", disabled);
			this.append([
				DOM.h1("Pair TV"),
				this.input,
				DOM.submit(undefined, "Submit"),
				this.instructions]);

			return super.render();
		}

		async process() {
			const deviceId = this.input.value;
			if(!deviceId)
				return;

			if(!await this.api.checkWebshareStatus()) {
				this.trigger(new Action.ShowNotification({title:"Pair TV Failed", message:"Webshare authentication is invalid, reauthenticate!", html:true}));
				return;
			}

			await this.api.pairPut(deviceId);
			const title = `Pair TV Success`;
			const message = `Webshare authentication is now available for TV <strong>${deviceId}</strong>.`;
			this.trigger(new Action.ShowNotification({title, message, html:true}));
		}
	}
}
