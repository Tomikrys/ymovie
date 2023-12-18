namespace ymovie.tv.util.Focus {
	export class Manager {
		focusedComponentChanged:((component:IFocusable | undefined) => void) | undefined;

		private _focusedComponent:IFocusable | undefined;
		private virtualXOffset:number = 0;
		private virtualYOffset:number = 0;

		constructor() {}

		get focusedComponent():IFocusable | undefined {
			return this._focusedComponent;
		}

		set focusedComponent(value:IFocusable | undefined) {
			if(this._focusedComponent == value)
				return;
			
			if(this._focusedComponent != null)
				this._focusedComponent.blur();

			this._focusedComponent = value;

			if(this._focusedComponent != null)
				this._focusedComponent.focus();

			this.virtualXOffset = 0;
			this.virtualYOffset = 0;

			this.focusedComponentChanged?.(this._focusedComponent);
		}

		private get virtualX():number {
			return this._focusedComponent ? this._focusedComponent.getBoundingRect()?.centerX || 0 + this.virtualXOffset : 0;
		}

		private get virtualY():number {
			return this._focusedComponent ? this._focusedComponent.getBoundingRect()?.centerY || 0 + this.virtualYOffset : 0;
		}

		executeEvent(components:Array<IFocusable>, event:Event):boolean {
			const focusedComponent = this._focusedComponent;
			if(!focusedComponent)
				return false;

			var	customEvent = focusedComponent.modifyFocusEvent(event);
			if(focusedComponent.executeFocusEvent(customEvent))
				return true;
			
			if(!this.isDirection(customEvent.action))
				return false;

			var nearest = this.getNearest(components, focusedComponent, customEvent);
			if(nearest != null) {
				var x = this.virtualX;
				var y = this.virtualY;
				this.focusedComponent = nearest;
				this.optimizeVirtualPosition(customEvent.action, x, y, this.focusedComponent.getBoundingRect()!);
				return true;
			}

			return false;
		}

		getNearest(components:Array<IFocusable>, component:IFocusable, event:Event):IFocusable | undefined {
			const action = event.action;
			const virtualX = this.virtualX;
			const virtualY = this.virtualY;
			const componentRect = component.getBoundingRect()!;

			const result = this.getNearestForRect(components, component, componentRect, virtualX, virtualY, action);
			if(result)
				return result;

			if(action == "left" && component.allowHorizontalCirculation(event)) {
				const rect = new Rect(Number.MAX_SAFE_INTEGER, componentRect.y, componentRect.width, componentRect.height);
				return this.getNearestForRect(components, component, rect, Number.MAX_SAFE_INTEGER, virtualY, action);
			}

			if(action == "right" && component.allowHorizontalCirculation(event)) {
				const rect = new Rect(Number.MIN_SAFE_INTEGER, componentRect.y, componentRect.width, componentRect.height);
				return this.getNearestForRect(components, component, rect, Number.MIN_SAFE_INTEGER, virtualY, action);
			}

			return undefined;
		}

		private getNearestForRect(components:Array<IFocusable>, component:IFocusable, componentRect:Rect, virtualX:number, virtualY:number,
			action:Action):IFocusable | undefined {
			let result:IFocusable | undefined;
			var resultDistanceX = Number.POSITIVE_INFINITY;
			var resultDistanceY = Number.POSITIVE_INFINITY;
			for(let item of components) {
				if(component == item || component.getFocusLayer() != item.getFocusLayer())
					continue;

				var itemRect = item.getBoundingRect();
				if(itemRect && this.inDirection(action, itemRect, componentRect) && this.overlaps(action, itemRect, componentRect)) {
					var itemDistanceX = this.calculateDistance(virtualX, itemRect.x, itemRect.right);
					var itemDistanceY = this.calculateDistance(virtualY, itemRect.y, itemRect.bottom);
					if(this.isCloser(action, itemDistanceX, itemDistanceY, resultDistanceX, resultDistanceY)) {
						result = item;
						resultDistanceX = itemDistanceX;
						resultDistanceY = itemDistanceY;
					}
				}
			}
			return result;
		}

		private isDirection(action:Action):boolean {
			return action == "left" || action == "right" || action == "up" || action == "down";
		}

		private isHorizontal(action:Action):boolean {
			return action == "left" || action == "right";
		}

		private calculateDistance(position:number, left:number, right:number):number {
			return Math.min(Math.abs(position - left), Math.abs(position - right));
		}

		private isCloser(action:Action, itemDistanceX:number, itemDistanceY:number, distanceX:number, distanceY:number):boolean {
			if(action == "up" || action == "down")
				return itemDistanceY < distanceY || (itemDistanceY == distanceY && itemDistanceX < distanceX);
			if(action == "left" || action == "right")
				return itemDistanceX < distanceX || (itemDistanceX == distanceX && itemDistanceY < distanceY);
			return false;
		}

		private optimizeVirtualPosition(action:Action, previousX:number, previousY:number, rect:Rect) {
			if(action == "left" || action == "right")
				this.virtualYOffset = (previousY >= rect.y && previousY <= rect.bottom) ? previousY - rect.centerY : 0;
			else if(action == "up" || action == "down")
				this.virtualXOffset = (previousX >= rect.x && previousX <= rect.right) ? previousX - rect.centerX : 0;
		}

		private inDirection(action:Action, r1:Rect, r2:Rect):boolean {
			return (action == "left" && r1.centerX < r2.centerX)
				|| (action == "right" && r1.centerX > r2.centerX)
				|| (action == "up" && r1.centerY < r2.centerY)
				|| (action == "down" && r1.centerY > r2.centerY);
		}

		private overlaps(action:Action, r1:Rect, r2:Rect):boolean {
			var horizontal = this.isHorizontal(action);
			return (horizontal && this.overlapsHorizontal(r1, r2))
				|| (!horizontal && this.overlapsVertical(r1, r2));
		}

		private overlapsHorizontal(r1:Rect, r2:Rect):boolean {
			return (r1.centerY > r2.y && r1.centerY < r2.y + r2.height)
				|| (r2.centerY > r1.y && r2.centerY < r1.y + r1.height);
		}

		private overlapsVertical(r1:Rect, r2:Rect):boolean {
			return (r1.centerX > r2.x && r1.centerX < r2.x + r2.width)
				|| (r2.centerX > r1.x && r2.centerX < r1.x + r1.width);
		}
	}

	export type Action = "left" | "right" | "up" | "down" | "submit" | "back";

	export type Event = {
		readonly action:Action;
		readonly repeated?:boolean;
	}

	export interface IFocusable {
		focus():void;
		blur():void;
		getBoundingRect():Rect | undefined;
		getFocusLayer():string;
		executeFocusEvent(event:Event):boolean;
		modifyFocusEvent(event:Event):Event;
		allowHorizontalCirculation(event:Event):boolean;
	}

	export class Rect {
		readonly x:number;
		readonly y:number;
		readonly width:number;
		readonly height:number;
		readonly centerX:number;
		readonly centerY:number;
		readonly right:number;
		readonly bottom:number;

		constructor(x:number, y:number, width:number, height:number) {
			this.x = x;
			this.y = y;
			this.width = width;
			this.height = height;
			this.centerX = x + (width / 2);
			this.centerY = y + (height / 2);
			this.right = x + width;
			this.bottom = y + height;
		}
	}
}
