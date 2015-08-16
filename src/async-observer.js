export class AsyncObserver {
	constructor(observable, observer, ready) {
		this.observable = observable;
    this.ready = ready;
    this.lastValue = this.getCurrent();

		if (observer) {
			observer.subscribe(observable => {
        if (observable === this.observable) {
					return;
				}
				this.observable = observable;
				this.attach();
        this.notify();
			});
		}

		this.attach();
	}

	attach() {
		var observable = this.observable;
		if (!observable) {
			return;
		}
		var subscribe = observable.subscribeOnNext || observable.then;
    if (subscribe) {
			subscribe.call(observable, value => {
				if (observable !== this.observable) {
					return;
				}
	      observable.__value = value;
				this.notify();
			});
			return;
		}
		throw new Error('Object is not "promise-like" or "observable-like".');
	}

	getCurrent() {
		if (this.observable) {
			return this.ready ? this.observable.hasOwnProperty('__value') : this.observable.__value;
		}
		return this.ready ? false : undefined;
	}

  notify() {
		var value = this.getCurrent();

    if (!this.callback || value === this.lastValue) {
      return;
    }

    this.lastValue = value;
		this.callback(value);
  }

	subscribe(callback) {
		this.callback = callback;
    return () => this.callback = null;
	}

	dispose() {
		this.callback = null;
		this.observable = null;
    this.lastValue = null;
	}
}
