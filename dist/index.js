import {Expression,Parser as StandardParser,ParserImplementation as StandardParserImplementation,CallMember,AccessMember,AccessKeyed,CallFunction} from 'aurelia-binding';

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

export function configure(frameworkConfig) {
  frameworkConfig.container.autoRegister(Parser, StandardParser);
}

/*
* Overrides the standard parser's parse method to use our custom ParserImplementation.
*/
export class Parser extends StandardParser {
  parse(input) {
    input = input || '';

    return this.cache[input]
      || (this.cache[input] = new ParserImplementation(this.lexer, input).parseChain());
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
