namespace ymovie.tv.view {
	import Component = ymovie.view.Component;
	import DOM = ymovie.util.DOM;
	import Timeout = ymovie.util.Timeout;

	export class Help extends Component<HTMLElement> {
		private readonly hideTimeout = new Timeout(3000);
		private readonly log = DOM.div("log");
		private readonly instructions = DOM.div("instructions");

		constructor() {
			super("div");
		}

		private set visible(value:boolean) {
			this.element.classList.toggle("visible", value);
		}

		render() {
			this.clean();
			const b = (label:string) => DOM.button(undefined, label);
			const row = (label:string) => DOM.p(undefined, DOM.span(undefined, label));

			const left = row("left");
			DOM.append(left, [b("Left"), b("4")]);

			const right = row("right");
			DOM.append(right, [b("Right"), b("6")]);

			const up = row("up");
			DOM.append(up, [b("Up"), b("2")]);

			const down = row("down");
			DOM.append(down, [b("Down"), b("8")]);

			const submit = row("submit");
			DOM.append(submit, [b("Enter"), b("5")]);

			const back = row("back");
			DOM.append(back, [b("Back"), b("Esc"), b("0")]);

			DOM.append(this.instructions, [DOM.h1("Navigation"), left, right, up, down, submit, back]);
			this.append([this.instructions, this.log]);
			return super.render();
		}

		logKey(event:KeyboardEvent) {
			this.logMessage(`Unexpected key <code>${event.key}</code> code <code>${event.code}</code> keyCode <code>${event.keyCode}</code>`);
		}

		logMessage(value:string) {
			this.visible = true;
			this.hideTimeout.start(() => this.visible = false);
			const p = DOM.p(undefined);
			p.innerHTML = value;
			DOM.append(this.log, p);
			if(this.log.children.length > 30)
				this.log.removeChild(this.log.firstChild!);
			this.log.scrollTop = this.log.scrollHeight;
		}
	}
}