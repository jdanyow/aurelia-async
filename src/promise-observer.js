export class PromiseObserver {
	constructor(promise, observer, ready) {
		this.promise = promise;
    this.ready = ready;
    this.lastValue = this.getCurrent();

		if (observer) {
			observer.subscribe(promise => {
        if (promise === this.promise) {
					return;
				}
				this.promise = promise;        
				this.attach();
        this.notify();
			});
		}

		this.attach();
	}
	
	attach() {
		var promise = this.promise;
		if (!promise) {
			return;
		}    
    if (!promise.then) {
      throw new Error('Promise object has no "then" method.');
    }    
		promise.then(value => {
			if (promise !== this.promise) {
				return;
			}      
      promise.__value = value;
			this.notify();
		});
	}
	
	getCurrent() {
		if (this.promise) {
			return this.ready ? this.promise.hasOwnProperty('__value') : this.promise.__value;
		}
		return this.ready ? false : undefined;
	}
  
  notify() {
		var value = this.getCurrent();		
		
    if (!this.callback || value === this.lastValue) {
      return;
    }

    this.lastValue = value;
		console.log(`notifying ${value === null ? 'null' : value === undefined ? 'undefined' : JSON.stringify(value)}`);
    this.callback(value);
  }

	subscribe(callback) {
		this.callback = callback;
    return () => this.callback = null;
	}
	
	dispose() {
		this.callback = null;
		this.promise = null;
    this.scope = null;
    this.lastValue = null;
	}
}
