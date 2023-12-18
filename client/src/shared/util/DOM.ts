namespace ymovie.util.DOM {
	export function a(className?:string, content?:Content, href?:string, target?:string):HTMLAnchorElement {
		const result = <HTMLAnchorElement>create("a", className, content);
		if(href)
			result.href = href;
		if(target)
			result.target = target;
		return result;
	}

	export function button(className?:string, content?:Content):HTMLButtonElement {
		return <HTMLButtonElement>create("button", className, content);
	}

	export function div(className?:string, content?:Content):HTMLDivElement {
		return <HTMLDivElement>create("div", className, content);
	}

	export function form(className?:string, content?:Content):HTMLFormElement {
		return <HTMLFormElement>create("form", className, content);
	}

	export function h1(content?:Content):HTMLHeadingElement {
		return <HTMLHeadingElement>create("h1", undefined, content);
	}
	
	export function h2(content?:Content):HTMLHeadingElement {
		return <HTMLHeadingElement>create("h2", undefined, content);
	}

	export function img(className:string | undefined, src:string):HTMLImageElement {
		const result = <HTMLImageElement>create("img", className);
		result.src = src;
		return result;
	}
	
	export function input(className:string | undefined, name:string, value?:string, placeholder?:string):HTMLInputElement {
		const result = <HTMLInputElement>create("input", className);
		result.name = name;
		result.type = "text";
		if(value)
			result.value = value;
		if(placeholder)
			result.placeholder = placeholder;
		return result;
	}
	
	export function p(className?:string, content?:Content):HTMLParagraphElement {
		return <HTMLParagraphElement>create("p", className, content);
	}
	
	export function password(className:string | undefined, name:string, value?:string, placeholder?:string):HTMLInputElement {
		const result = <HTMLInputElement>create("input", className);
		result.name = name;
		result.type = "password";
		if(value)
			result.value = value;
		if(placeholder)
			result.placeholder = placeholder;
		return result;
	}
	
	export function span(className?:string, content?:Content):HTMLSpanElement {
		return <HTMLSpanElement>create("span", className, content);
	}
	
	export function submit(className?:string, value?:string):HTMLInputElement {
		const result = <HTMLInputElement>create("input", className);
		result.type = "submit";
		if(value)
			result.value = value;
		return result;
	}
	
	export function text(value:string):Text {
		return document.createTextNode(value);
	}
	
	export function textarea(className?:string, value?:string):HTMLTextAreaElement {
		const result = <HTMLTextAreaElement>create("textarea", className);
		if(value)
			result.value = value;
		return result;
	}
	
	export function script(src:string):HTMLScriptElement {
		const result = <HTMLScriptElement>create("script");
		result.src = src;
		return result;
	}
	
	export function create(type:string, className?:string, content?:Content):HTMLElement {
		const result = document.createElement(type);
		append(result, content);
		if(className)
			result.className = className;
		return result;
	}
	
	export function clean(container:Node){
		while(container.firstChild)
			container.removeChild(container.firstChild);
	}
	
	export function append(container:HTMLElement, content?:Content){
		if(content && Util.isString(content))
			container.appendChild(text(<string>content));
		else if(Util.isNumber(content))
			container.appendChild(text(content + ""));
		else if(content && Util.isArray(content))
			for(const item of <Array<Content>>content)
				append(container, item);
		else if(content)
			container.appendChild(<Node>content);
	}

	export function remove(container:ChildNode) {
		if(container.parentElement)
			container.parentElement.removeChild(container);
	}

	export type Content = HTMLElement | string | number | undefined | null | Array<Content>;
}
