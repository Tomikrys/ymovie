namespace ymovie.tv.util {
	export class Polyfill {
		static init() {
			Polyfill.stringStartsWith();
			Polyfill.arrayMap();
			Polyfill.arrayFilter();
			Polyfill.arrayFind();
		}

		/** Chrome 33 */
		static stringStartsWith() {
			if (!String.prototype.startsWith) {
				Object.defineProperty(String.prototype, 'startsWith', {
					value: function(search:string, rawPos:number) {
						var pos = rawPos > 0 ? rawPos|0 : 0;
						return this.substring(pos, pos + search.length) === search;
					}
				});
			}
		}

		static arrayMap() {
			if (!Array.prototype.map) {
				Array.prototype.map = function(callback:Function) {
					let newArray = [];
					for(let item of this)
						newArray.push(callback(item));
					return newArray;
				}
			}
		}

		static arrayFilter() {
			if (!Array.prototype.filter){
				Array.prototype.filter = function(func:any, thisArg:any) {
				  'use strict';
				  // @ts-ignore 
				  if ( ! ((typeof func === 'Function' || typeof func === 'function') && this) )
					  throw new TypeError();
			  
				  var len = this.length >>> 0,
					  res = new Array(len), // preallocate array
					  t = this, c = 0, i = -1;
			  
				  var kValue;
				  if (thisArg === undefined){
					while (++i !== len){
					  // checks to see if the key was set
					  if (i in this){
						kValue = t[i]; // in case t is changed in callback
						if (func(t[i], i, t)){
						  res[c++] = kValue;
						}
					  }
					}
				  }
				  else{
					while (++i !== len){
					  // checks to see if the key was set
					  if (i in this){
						kValue = t[i];
						if (func.call(thisArg, t[i], i, t)){
						  res[c++] = kValue;
						}
					  }
					}
				  }
			  
				  res.length = c; // shrink down array to proper size
				  return res;
				};
			  }
		}

		static arrayFind() {
			if (!Array.prototype.find) {
				Object.defineProperty(Array.prototype, 'find', {
				  value: function(predicate:any) {
					// 1. Let O be ? ToObject(this value).
					if (this == null) {
					  throw TypeError('"this" is null or not defined');
					}
			  
					var o = Object(this);
			  
					// 2. Let len be ? ToLength(? Get(O, "length")).
					var len = o.length >>> 0;
			  
					// 3. If IsCallable(predicate) is false, throw a TypeError exception.
					if (typeof predicate !== 'function') {
					  throw TypeError('predicate must be a function');
					}
			  
					// 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
					var thisArg = arguments[1];
			  
					// 5. Let k be 0.
					var k = 0;
			  
					// 6. Repeat, while k < len
					while (k < len) {
					  // a. Let Pk be ! ToString(k).
					  // b. Let kValue be ? Get(O, Pk).
					  // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
					  // d. If testResult is true, return kValue.
					  var kValue = o[k];
					  if (predicate.call(thisArg, kValue, k, o)) {
						return kValue;
					  }
					  // e. Increase k by 1.
					  k++;
					}
			  
					// 7. Return undefined.
					return undefined;
				  },
				  configurable: true,
				  writable: true
				});
			  }
		}
	}
}
