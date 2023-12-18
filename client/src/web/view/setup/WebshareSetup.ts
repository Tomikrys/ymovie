namespace ymovie.web.view.setup {
	import DOM = ymovie.util.DOM;

	export class WebshareSetup extends base.Form {
		api:api.Api;
		clear:HTMLButtonElement;
		instructions:HTMLParagraphElement;
		tokenInput:HTMLInputElement;
		usernameInput:HTMLInputElement;
		passwordInput:HTMLInputElement;
		data:Data | undefined;

		constructor(api:api.Api){
			super();
			this.api = api;
			this.api.webshareStatusChanged.add(this.render.bind(this));
			
			this.clear = DOM.button("clear", "Clear token");
			this.clear.addEventListener("click", this.onClearClick.bind(this));
			
			this.instructions = DOM.p();
			this.instructions.innerHTML = `Provide your Webshare credentials to resolve available streams. Only access token is stored in a cookie.`;

			this.tokenInput = DOM.input("token", "token");
			this.usernameInput = DOM.input(undefined, "username", undefined, "username");
			this.passwordInput = DOM.password(undefined, "password", undefined, "password");
		}
		
		render(){
			this.clean();
			this.append(DOM.h1("Webshare"));
			
			const data = this.data;
			const token = this.api.webshareToken;
			if(token){
				this.tokenInput.value = token;
				this.tokenInput.setAttribute("readonly", "");
				this.append([this.tokenInput, this.clear]);
			}else{
				this.usernameInput.value = data?.username || "";
				this.passwordInput.value = data?.password || "";
				this.append([this.usernameInput, this.passwordInput]);
			}
			
			this.append(DOM.submit(undefined, "Submit"));
			if(this.data && this.data.error)
				this.append(DOM.span("error", this.data.error));
			this.append(this.instructions);
			return super.render();
		}

		update(data?:Data):HTMLElement {
			this.data = data;
			return this.render();
		}
		
		async process():Promise<any> {
			if(this.tokenInput.parentElement)
				return this.update(await this.api.checkWebshareStatus() ? undefined : {error:"Invalid token."});
			
			const username = this.usernameInput.value;
			const password = this.passwordInput.value;
			const result = await this.api.loginWebshare(username, password);
			return this.update(result ? undefined : {error:"Invalid username or password.", username, password});
		}
		
		onClearClick(event:Event){
			event.preventDefault();
			this.api.logoutWebshare();
			this.update();
		}
	}

	type Data = {
		error?:string;
		username?:string;
		password?:string;
	}
}
