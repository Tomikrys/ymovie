namespace ymovie.tv.util {
	import Focus = util.Focus;

	export class Keyboard {
		static eventToAction(event:KeyboardEvent):Focus.Action | undefined {
			if(this.isLeft(event)) return "left";
			if(this.isRight(event)) return "right";
			if(this.isUp(event)) return "up";
			if(this.isDown(event)) return "down";
			if(this.isSubmit(event)) return "submit";
			if(this.isBack(event)) return "back";
			return undefined;
		}

		static isLeft(event:KeyboardEvent):boolean {
			return event.key == "ArrowLeft"
				|| event.key == "MediaRewind"
				|| event.code == "Digit4"
				|| event.keyCode == 37
				|| event.keyCode == 52;
		}

		static isRight(event:KeyboardEvent):boolean {
			return event.key == "ArrowRight"
				|| event.key == "MediaFastForward"
				|| event.code == "Digit6"
				|| event.keyCode == 39
				|| event.keyCode == 54;
		}

		static isUp(event:KeyboardEvent):boolean {
			return event.key == "ArrowUp"
				|| event.code == "Digit2"
				|| event.keyCode == 38
				|| event.keyCode == 50;
		}

		static isDown(event:KeyboardEvent):boolean {
			return event.key == "ArrowDown"
				|| event.code == "Digit8"
				|| event.keyCode == 40
				|| event.keyCode == 56;
		}

		static isSubmit(event:KeyboardEvent):boolean {
			return event.key == "Enter"
				|| event.code == "Digit5"
				|| event.keyCode == 13
				|| event.keyCode == 53;
		}

		static isBack(event:KeyboardEvent):boolean {
			return event.key == "Escape"
				|| event.key == "Backspace"
				|| event.code == "Digit0"
				|| event.keyCode == 8
				|| event.keyCode == 27
				|| event.keyCode == 48
				|| event.keyCode == 10009;
		}

		static isPlay(event:KeyboardEvent):boolean {
			return event.key === "MediaPlay";
		}

		static isPlayPause(event:KeyboardEvent):boolean {
			return event.key === "MediaPlayPause"
				|| event.keyCode == 10252;
		}

		static isStop(event:KeyboardEvent):boolean {
			return event.key === "MediaStop";
		}
	}
}