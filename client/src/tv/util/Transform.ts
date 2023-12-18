namespace ymovie.tv.util.Transform {
	export function on(element:HTMLElement, value:string) {
		element.style.transform = value;
		element.style.webkitTransform = value;
	}
}
