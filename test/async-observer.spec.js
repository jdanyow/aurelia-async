import {AsyncObserver} from '../src/async-observer';

describe('AsyncObserver', () => {
  it('Observes promises', done => {
    let resolvePromise,
        observable = new Promise((resolve, reject) => resolvePromise = resolve),
        observer = {
          getValue: () => observable,
          subscribe: cb => (() => {})
        },
        ready = false,
        callback = jasmine.createSpy('callback');
    observer = new AsyncObserver(observable, observer, ready);
    observer.subscribe(callback);
    resolvePromise('foo');
    setTimeout(() => {
      expect(callback).toHaveBeenCalledWith('foo');
      observer.dispose();
      done();
    }, 100);
  });

  it('Stops observing promises after disposing', done => {
    let resolvePromise,
        observable = new Promise((resolve, reject) => resolvePromise = resolve),
        observer = {
          getValue: () => observable,
          subscribe: cb => (() => {})
        },
        ready = false,
        callback = jasmine.createSpy('callback');
    observer = new AsyncObserver(observable, observer, ready);
    observer.subscribe(callback);
    observer.dispose();
    resolvePromise('foo');
    setTimeout(() => {
      expect(callback.calls.any()).toBe(false);
      done();
    }, 100);
  });

  it('Observes Rx observables', done => {
    let next,
        observable = { subscribeOnNext: cb => next = cb },
        observer = {
          getValue: () => observable,
          subscribe: cb => (() => {})
        },
        ready = false,
        callback = jasmine.createSpy('callback');
    observer = new AsyncObserver(observable, observer, ready);
    observer.subscribe(callback);
    next('foo');
    setTimeout(() => {
      expect(callback).toHaveBeenCalledWith('foo');
      next('bar');
      setTimeout(() => {
        expect(callback).toHaveBeenCalledWith('bar');
        callback.calls.reset();
        observer.dispose();
        next('baz');
        setTimeout(() => {
          expect(callback.calls.any()).toBe(false);
          done();
        }, 100);
      }, 100);
    }, 100);
  });

  it('Handles observable instance changes', done => {
    let resolvePromise,
        notifyObservableChanged,
        observable = undefined,
        observer = {
          getValue: () => observable,
          subscribe: cb => {
            notifyObservableChanged = cb;
            return () => null;
          }
        },
        ready = false,
        callback = jasmine.createSpy('callback');
    observer = new AsyncObserver(observable, observer, ready);
    observer.subscribe(callback);
    observable = new Promise((resolve, reject) => resolvePromise = resolve);
    notifyObservableChanged(observable);
    resolvePromise('foo');
    setTimeout(() => {
      expect(callback).toHaveBeenCalledWith('foo');
      observer.dispose();
      done();
    }, 100);
  });
});
