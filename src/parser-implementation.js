import {
	ParserImplementation as StandardParserImplementation,
	CallMember,
	AccessMember,
	AccessKeyed,
	CallFunction
} from 'aurelia-binding';

import {AsyncExpression} from './async-expression';

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