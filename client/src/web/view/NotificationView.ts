namespace ymovie.web.view {
	import DOM = ymovie.util.DOM;

	export class NotificationView extends base.Dialogue<Data> {
		title:HTMLHeadingElement;
		message:HTMLParagraphElement;

		constructor(){
			super(false, undefined);
			this.title = DOM.h1();
			this.message = DOM.p();
			DOM.append(this.content, [this.title, this.message, this.closeButton]);
			this.append(this.content);
		}
		
		update(data?:Data) {
			this.show();
			return super.update(data);
		}
		
		render(){
			DOM.clean(this.title);
			DOM.clean(this.message);
			if(this.data?.title)
				DOM.append(this.title, this.data.title);
			if(this.data?.message) {
				if(this.data.html)
					this.message.innerHTML = this.data.message;
				else
					DOM.append(this.message, this.data.message);
			}
			return super.render();
		}

		defaultRender(){
		}
	}

	type Data = undefined | {
		title:string;
		message:string;
		html:boolean;
	}
}
