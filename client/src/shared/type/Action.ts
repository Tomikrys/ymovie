namespace ymovie.type.Action {
	export abstract class Base<T = any> {
		readonly data:T;

		private static typeId:number = 0;

		constructor(data:T) {
			this.data = data;
		}

		get type():string {
			return Base.getType(<Class>this.constructor);
		}

		static getType(constructor:Class) {
			// @ts-ignore
			return constructor.$type || (constructor.$type = "$Action" + Base.typeId++);
		}
	}

	export type Class<T = any> = {new (...args:any[]):Base<T>};
}
