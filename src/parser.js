import {Parser as StandardParser} from 'aurelia-binding';
import {ParserImplementation} from './parser-implementation';

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