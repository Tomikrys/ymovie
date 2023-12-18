namespace ymovie.tv.util.DOMUtil {
	export function getGlobalRect(element:Element):Rect | undefined {
		const result = element.getBoundingClientRect();
		return result.width ? result : undefined;
	}

	/** Chrome 33 only contains following properties: */
	type Rect = {
		readonly top:number;
		readonly right:number;
		readonly bottom:number;
		readonly left:number;
		readonly width:number;
		readonly height:number;
	}
}
