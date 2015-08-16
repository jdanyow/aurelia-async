import {Expression} from 'aurelia-binding';
import {AsyncObserver} from './async-observer';

export class AsyncExpression extends Expression {
  constructor(expression, ready) {
    super();
    this.expression = expression;
    this.ready = ready;
  }

  evaluate(scope, valueConverters) {
    var observable = this.expression.evaluate(scope);
    if (observable) {
      return this.ready ? observable.hasOwnProperty('__value') : observable.__value;
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
      observer: new AsyncObserver(info.value, info.observer, this.ready)
    };
  }
}
