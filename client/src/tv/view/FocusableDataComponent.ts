namespace ymovie.tv.view {
	export class FocusableDataComponent<TElement extends HTMLElement, TData> extends FocusableComponent<TElement> {
		data:TData;

		constructor(element:HTMLElement | string, data:TData) {
			super(element);
			this.data = data;
		}

		update(data:TData):TElement {
			this.data = data;
			return this.render();
		}
	}
}
