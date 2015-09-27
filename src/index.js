import {Parser} from 'aurelia-binding';

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
