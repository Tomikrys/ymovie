namespace ymovie.web.view.setup {
	export class SetupView extends base.Dialogue<any> {
		webshareSetup:WebshareSetup;
		tvSetup:TVSetup;
		kodiSetup:KodiSetup;

		constructor(api:api.Api){
			super(true, undefined);
			this.webshareSetup = new WebshareSetup(api);
			this.tvSetup = new TVSetup(api);
			this.kodiSetup = new KodiSetup(api);
		}
		
		renderContent(){
			return [this.webshareSetup.render(), this.tvSetup.render(), this.kodiSetup.render()];
		}
		
		close() {
			this.trigger(new type.Action.GoBack());
		}
	}
}
