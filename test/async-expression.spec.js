import {ParserImplementation} from '../src/parser-implementation';
import {AsyncExpression} from '../src/async-expression';
import {AsyncObserver} from '../src/async-observer';
import {Lexer} from 'aurelia-binding';

describe('AsyncExpression', () => {
  let lexer = new Lexer();
  let parser;
  beforeAll(() => {
    parser = {
      parse: (input) => {
        input = input || '';
        return new ParserImplementation(lexer, input).parseChain();
      }
    }
  });

  it('evaluates', () => {
    let expression = parser.parse('foo..value'),
        scope = {};
    expect(expression.evaluate(scope)).toBe(undefined);
    scope.foo = new Promise((resolve, reject) => {});
    expect(expression.evaluate(scope)).toBe(undefined);
    scope.foo.__value = 'bar';
    expect(expression.evaluate(scope)).toBe('bar');

    expression = parser.parse('foo..ready'),
    scope = {};
    expect(expression.evaluate(scope)).toBe(false);
    scope.foo = new Promise((resolve, reject) => {});
    expect(expression.evaluate(scope)).toBe(false);
    scope.foo.__value = 'bar';
    expect(expression.evaluate(scope)).toBe(true);
  });

  it('connects', () => {
    let expression = parser.parse('foo..value'),
        binding = { getObserver: () => ({ getValue: () => undefined, subscribe: () => {} }) },
        scope = { foo: new Promise((resolve, reject) => {}) },
        info = expression.connect(binding, scope);
    expect(info.observer instanceof AsyncObserver).toBe(true);
    expect(info.value).toBe(undefined);
  });
});
