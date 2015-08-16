declare module 'aurelia-async' {
  import { Expression, Parser as StandardParser, ParserImplementation as StandardParserImplementation, CallMember, AccessMember, AccessKeyed, CallFunction }  from 'aurelia-binding';
  export class AsyncExpression extends Expression {
    constructor(expression: any, ready: any);
    evaluate(scope: any, valueConverters: any): any;
    accept(visitor: any): any;
    connect(binding: any, scope: any): any;
  }
  export function configure(frameworkConfig: any): any;
  
  /*
  * Overrides the standard parser's parse method to use our custom ParserImplementation.
  */
  export class Parser extends StandardParser {
    parse(input: any): any;
  }
  
  /*
  * Overrides the standard ParserImplementation's parseAccessOrCallMember method.
  */
  export class ParserImplementation extends StandardParserImplementation {
    parseAccessOrCallMember(result: any): any;
  }
  export class AsyncObserver {
    constructor(observable: any, observer: any, ready: any);
    attach(): any;
    getCurrent(): any;
    notify(): any;
    subscribe(callback: any): any;
    dispose(): any;
  }
}