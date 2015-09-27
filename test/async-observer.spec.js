import {AsyncObserver} from '../src/async-observer';

describe('AsyncObserver', () => {
  it('Observes promises', done => {
    let resolvePromise;
    let observable = new Promise((resolve, reject) => resolvePromise = resolve);
    let observer = {
        getValue: () => observable,
        subscribe: (context, callable) => {},
        unsubscribe: (context, callable) => {}
      };
    let ready = false;
    let callable = { call: jasmine.createSpy('call') };
    let context = 'test';
    observer = new AsyncObserver(observable, observer, ready);
    observer.subscribe(context, callable);
    resolvePromise('foo');
    setTimeout(() => {
      expect(callable.call).toHaveBeenCalledWith(context, 'foo', undefined);
      observer.unsubscribe(context, callable);
      done();
    }, 100);
  });

  it('Stops observing promises after disposing', done => {
    let resolvePromise;
    let observable = new Promise((resolve, reject) => resolvePromise = resolve);
    let observer = {
        getValue: () => observable,
        subscribe: (context, callable) => {},
        unsubscribe: (context, callable) => {}
      };
    let ready = false;
    let callable = { call: jasmine.createSpy('call') };
    let context = 'test';
    observer = new AsyncObserver(observable, observer, ready);
    observer.subscribe(context, callable);
    observer.unsubscribe(context, callable);
    resolvePromise('foo');
    setTimeout(() => {
      expect(callable.call.calls.any()).toBe(false);
      done();
    }, 100);
  });

  it('Observes Rx observables', done => {
    let resolvePromise;
    let next;
    let observable = { subscribeOnNext: cb => next = cb };
    let observer = {
        getValue: () => observable,
        subscribe: (context, callable) => {},
        unsubscribe: (context, callable) => {}
      };
    let ready = false;
    let callable = { call: jasmine.createSpy('call') };
    let context = 'test';
    observer = new AsyncObserver(observable, observer, ready);
    observer.subscribe(context, callable);
    next('foo');
    setTimeout(() => {
      expect(callable.call).toHaveBeenCalledWith(context, 'foo', undefined);
      next('bar');
      setTimeout(() => {
        expect(callable.call).toHaveBeenCalledWith(context, 'bar', 'foo');
        observer.unsubscribe(context, callable);
        callable.call.calls.reset();
        next('baz');
        setTimeout(() => {
          expect(callable.call.calls.any()).toBe(false);
          observer.subscribe(context, callable);
          next('xup');
          setTimeout(() => {
            expect(callable.call).toHaveBeenCalledWith(context, 'xup', 'baz');
            observer.unsubscribe(context, callable);
            done();
          }, 100);
        }, 100);
      }, 100);
    }, 100);
  });

  it('Handles observable instance changes', done => {
    let resolvePromise;
    let notifyObservableChanged;
    let observable = undefined;
    let observer = {
        getValue: () => observable,
        subscribe: (context, callable) => {
          notifyObservableChanged = o => callable.call(context, o);
        },
        unsubscribe: (context, callable) => {}
      };
    let ready = false;
    let callable = { call: jasmine.createSpy('call') };
    let context = 'test';
    observer = new AsyncObserver(observable, observer, ready);
    observer.subscribe(context, callable);
    observable = new Promise((resolve, reject) => resolvePromise = resolve);
    notifyObservableChanged(observable);
    resolvePromise('foo');
    setTimeout(() => {
      expect(callable.call).toHaveBeenCalledWith(context, 'foo', undefined);
      observer.unsubscribe(context, callable);
      done();
    }, 100);
  });
});
