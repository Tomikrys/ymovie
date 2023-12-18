namespace ymovie.util.Signal {
	export abstract class Signal<T> {
		private listAlways:Array<T> = [];
		private listOnce:Array<T> = [];
	
		protected getList():Array<T> {
			return this.listAlways.concat(this.listOnce);
		}
	
		add(callback:T):()=>void {
			this.listAlways.push(callback);
			return () => this.arrayRemove(this.listAlways, callback);
		}
	
		addOnce(callback:T):()=>void {
			this.listOnce.push(callback);
			return () => this.arrayRemove(this.listOnce, callback);
		}
	
		removeAll():void {
			this.listAlways = [];
			this.listOnce = [];
		}
	
		remove(callback:T) {
			this.arrayRemove(this.listAlways, callback);
			this.arrayRemove(this.listOnce, callback);
		}
	
		protected afterDispatch(){
			this.listOnce = [];
		}

		private arrayRemove<T>(source:Array<T>, item:T):void {
			const index = source.indexOf(item, 0);
			if (index > -1)
				source.splice(index, 1);
		}
	}
	
	export class Signal0 extends Signal<()=>void> {
		dispatch():void {
			for(let callback of this.getList())
				callback();
			this.afterDispatch();
		}
	}
	
	export class Signal1<V> extends Signal<(v:V)=>void> {
		dispatch(value:V):void {
			for(let callback of this.getList())
				callback(value);
			this.afterDispatch();
		}
	}
	
	export class Signal2<V1,V2> extends Signal<(v1:V1, v2:V2)=>void> {
		dispatch(value1:V1, value2:V2):void {
			for(let callback of this.getList())
				callback(value1, value2);
			this.afterDispatch();
		}
	}
}
