export class AsyncObserver {
	constructor(observable, observer, ready) {
		this.observable = observable;
		this.observer = observer;
    this.ready = ready;
	}

	attach() {
		let observable = this.observable = (this.observer ? this.observer.getValue() : this.observable);
		if (!observable) {
			return;
		}
		let subscribe = observable.subscribeOnNext || observable.then;
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
		let observable = this.observable = (this.observer ? this.observer.getValue() : this.observable);
		if (observable) {
			return this.ready ? observable.hasOwnProperty('__value') : observable.__value;
		}
		return this.ready ? false : undefined;
	}

  notify() {
		let newValue = this.getCurrent();
		let oldValue = this.lastValue;

    if (!this.context || newValue === oldValue) {
      return;
    }

		this.lastValue = newValue;
		this.callable.call(this.context, newValue, oldValue);
  }

	call(context, newValue, oldValue) {
		if (newValue === this.observable) {
			return;
		}
		this.observable = newValue;
		this.attach();
		this.notify();
	}

	subscribe(context, callable) {
		this.context = context;
		this.callable = callable;

		if (this.observer) {
	    this.lastValue = this.getCurrent();
			this.observer.subscribe('AsyncObserver', this);
		}

		this.attach();
	}

	unsubscribe(context, callable) {
		this.context = null;
		this.callable = null;

		if (this.observer) {
			this.lastValue = undefined;
			this.observer.unsubscribe('AsyncObserver', this);
		}
	}
}
