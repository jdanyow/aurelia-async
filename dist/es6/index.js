import {Expression,Parser as StandardParser,ParserImplementation as StandardParserImplementation,CallMember,AccessMember,AccessKeyed,CallFunction} from 'aurelia-binding';

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

export function configure(aurelia) {
  aurelia.container.autoRegister(Parser, StandardParser);
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
      if (this.optional('.')) {
				
				// <modified code>
        if (this.optional('.')) {
          let command = this.peek.text;
          if (command !== 'value' && command !== 'ready') {
            throw new Error('Expected "..value" or "..ready".');
          }
          result = new AsyncExpression(result, command === 'ready');
          this.advance();
          return this.parseAccessOrCallMember(result);
        }
				// </modified code>
				
        var name = this.peek.text;

        this.advance();

        if (this.optional('(')) {
          var args = this.parseExpressionList(')');
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
        var args = this.parseExpressionList(')');
        this.expect(')');
        result = new CallFunction(result, args);
      } else {
        return result;
      }
    }
  }
}
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
