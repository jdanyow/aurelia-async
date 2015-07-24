import {Expression} from 'aurelia-binding';
import {PromiseObserver} from './promise-observer';

export class AsyncExpression extends Expression {
  constructor(expression, ready) {
    super();
    this.expression = expression;
    this.ready = ready;
  }

  evaluate(scope, valueConverters) {
    var promise = this.expression.evaluate(scope);
    if (promise) {
      return this.ready ? promise.hasOwnProperty('__value') : promise.__value;
    }
    return this.ready ? false : undefined;
  }

  accept(visitor) {
    this.expression.accept(visitor);
		visitor.write('..');
  }

  connect(binding, scope) {
    var info = this.expression.connect(binding, scope);
    return {
      value: info.value ? info.value.__value : undefined,
      observer: new PromiseObserver(info.value, info.observer, this.ready)
    };
  }
}
