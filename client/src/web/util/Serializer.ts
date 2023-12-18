namespace ymovie.web.util {
	export class Serializer {
		private readonly constructorField = "$ctor";
		private readonly constructors:Array<Function> = [];
		private readonly ignoredConstructors:Array<Function> = [({}).constructor];

		constructor() {}

		serialize(data:any):any {
			if(data !== Object(data))
				return data;
			if(data instanceof Array)
				return (<Array<any>>data).map(this.serialize.bind(this));
			if(data.constructor instanceof Function)
				return this.serializeObject(data);
			return data;
		}

		deserialize(data:any):any {
			if(data !== Object(data))
				return data;
			if(data instanceof Array)
				return (<Array<any>>data).map(this.deserialize.bind(this));
			if(data.constructor instanceof Function)
				return this.deserializeObject(data);
			return data;
		}

		private serializeObject(data:any):any {
			const result:any = {};
			if(this.ignoredConstructors.indexOf(data.constructor) == -1)
				result[this.constructorField] = this.storeConstructor(data.constructor);
			for(let key in data)
				result[key] = this.serialize(data[key]);
			return result;
		}

		private deserializeObject(data:any) {
			const constructor = this.constructors[data[this.constructorField]];
			const result = constructor ? new (<any>constructor)() : data;
			for(let key in data)
				if(key !== this.constructorField)
					result[key] = this.deserialize(data[key]);
			return result;
		}

		private storeConstructor(constructor:Function):number {
			const index = this.constructors.indexOf(constructor);
			return (index !== -1) ? index : (this.constructors.push(constructor) - 1);
		}
	}
}
