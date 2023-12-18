namespace ymovie.tv.util {
	export class ClassName {
		static updateType(element:HTMLElement, type:string, value:string) {
			const prefix = type + "-";
			for(let i = element.classList.length - 1; i >= 0; i--) {
				const item = element.classList[i]!;
				if(item.startsWith(prefix))
					element.classList.remove(item);
			}
			if(value != null)
				element.classList.add(prefix + value);
		}

		static getType(element:HTMLElement, type:string):string | undefined {
			const prefix = type + "-";
			for(let i = element.classList.length - 1; i >= 0; i--) {
				const item = element.classList[i]!;
				if(item.startsWith(prefix))
					return item.substr(prefix.length);
			}
			return undefined;
		}
	}
}
