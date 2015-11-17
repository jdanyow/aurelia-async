import {Expression,ParserImplementation as StandardParserImplementation,CallMember,AccessMember,AccessKeyed,CallFunction,Parser} from 'aurelia-binding';

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

export class AsyncExpression extends Expression {
  constructor(expression, ready) {
    super();
    this.expression = expression;
    this.ready = ready;
  }

  evaluate(scope, valueConverters) {
    let observable = this.expression.evaluate(scope);
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
    let info = this.expression.connect(binding, scope);
    return {
      value: info.value ? info.value.__value : undefined,
      observer: new AsyncObserver(info.value, info.observer, this.ready)
    };
  }
}

/*
* Overrides the standard ParserImplementation's parseAccessOrCallMember method.
*/
export class ParserImplementation extends StandardParserImplementation {	
	parseAccessOrCallMember(result) {
    result = result || this.parsePrimary();

    while (true) {
      var async, args;
      if (this.optional('.')) {
        async = this.optional('.');
        var name = this.peek.text;
        this.advance();
        if (async) {
          if (name !== 'value' && name !== 'ready') {
            throw new Error('Expected "..value" or "..ready".');
          }
          result = new AsyncExpression(result, name === 'ready');
          return this.parseAccessOrCallMember(result);
        }
        if (this.optional('(')) {
          args = this.parseExpressionList(')');
          this.expect(')');
          result = new CallMember(result, name, args);
        } else {
          result = new AccessMember(result, name);
        }
      } else if (this.optional('[')) {
        var key = this.parseExpression();
        this.expect(']');
        result = new AccessKeyed(result, key);
      } else if (this.optional('(')) {
        args = this.parseExpressionList(')');
        this.expect(')');
        result = new CallFunction(result, args);
      } else {
        return result;
      }
    }
  }
}
function parse(input) {
  input = input || '';

  return this.cache[input]
    || (this.cache[input] = new ParserImplementation(this.lexer, input).parseChain());
}

export function configure(frameworkConfig) {
  // override the parse method.
  let parser = frameworkConfig.container.get(Parser);
  parser.parse = parse;
}
