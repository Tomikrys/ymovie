/// <reference path="Component.ts"/>

namespace ymovie.view {
	export class DataComponent<TElement extends HTMLElement, TData> extends Component<TElement> {
		data:TData;

		constructor(element:HTMLElement | string, data:TData) {
			super(element);
			this.data = data;
		}

		update(data:TData):HTMLElement {
			this.data = data;
			return this.render();
		}
	}
}
