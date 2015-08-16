'use strict';

exports.__esModule = true;
exports.configure = configure;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _aureliaBinding = require('aurelia-binding');

var AsyncExpression = (function (_Expression) {
  _inherits(AsyncExpression, _Expression);

  function AsyncExpression(expression, ready) {
    _classCallCheck(this, AsyncExpression);

    _Expression.call(this);
    this.expression = expression;
    this.ready = ready;
  }

  AsyncExpression.prototype.evaluate = function evaluate(scope, valueConverters) {
    var observable = this.expression.evaluate(scope);
    if (observable) {
      return this.ready ? observable.hasOwnProperty('__value') : observable.__value;
    }
    return this.ready ? false : undefined;
  };

  AsyncExpression.prototype.accept = function accept(visitor) {
    this.expression.accept(visitor);
    visitor.write('..');
  };

  AsyncExpression.prototype.connect = function connect(binding, scope) {
    var info = this.expression.connect(binding, scope);
    return {
      value: info.value ? info.value.__value : undefined,
      observer: new AsyncObserver(info.value, info.observer, this.ready)
    };
  };

  return AsyncExpression;
})(_aureliaBinding.Expression);

exports.AsyncExpression = AsyncExpression;

function configure(frameworkConfig) {
  frameworkConfig.container.autoRegister(Parser, _aureliaBinding.Parser);
}

var Parser = (function (_StandardParser) {
  _inherits(Parser, _StandardParser);

  function Parser() {
    _classCallCheck(this, Parser);

    _StandardParser.apply(this, arguments);
  }

  Parser.prototype.parse = function parse(input) {
    input = input || '';

    return this.cache[input] || (this.cache[input] = new ParserImplementation(this.lexer, input).parseChain());
  };

  return Parser;
})(_aureliaBinding.Parser);

exports.Parser = Parser;

var ParserImplementation = (function (_StandardParserImplementation) {
  _inherits(ParserImplementation, _StandardParserImplementation);

  function ParserImplementation() {
    _classCallCheck(this, ParserImplementation);

    _StandardParserImplementation.apply(this, arguments);
  }

  ParserImplementation.prototype.parseAccessOrCallMember = function parseAccessOrCallMember(result) {
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
          result = new _aureliaBinding.CallMember(result, name, args);
        } else {
          result = new _aureliaBinding.AccessMember(result, name);
        }
      } else if (this.optional('[')) {
        var key = this.parseExpression();
        this.expect(']');
        result = new _aureliaBinding.AccessKeyed(result, key);
      } else if (this.optional('(')) {
        args = this.parseExpressionList(')');
        this.expect(')');
        result = new _aureliaBinding.CallFunction(result, args);
      } else {
        return result;
      }
    }
  };

  return ParserImplementation;
})(_aureliaBinding.ParserImplementation);

exports.ParserImplementation = ParserImplementation;

var AsyncObserver = (function () {
  function AsyncObserver(observable, observer, ready) {
    var _this = this;

    _classCallCheck(this, AsyncObserver);

    this.observable = observable;
    this.ready = ready;
    this.lastValue = this.getCurrent();

    if (observer) {
      observer.subscribe(function (observable) {
        if (observable === _this.observable) {
          return;
        }
        _this.observable = observable;
        _this.attach();
        _this.notify();
      });
    }

    this.attach();
  }

  AsyncObserver.prototype.attach = function attach() {
    var _this2 = this;

    var observable = this.observable;
    if (!observable) {
      return;
    }
    var subscribe = observable.subscribeOnNext || observable.then;
    if (subscribe) {
      subscribe.call(observable, function (value) {
        if (observable !== _this2.observable) {
          return;
        }
        observable.__value = value;
        _this2.notify();
      });
      return;
    }
    throw new Error('Object is not "promise-like" or "observable-like".');
  };

  AsyncObserver.prototype.getCurrent = function getCurrent() {
    if (this.observable) {
      return this.ready ? this.observable.hasOwnProperty('__value') : this.observable.__value;
    }
    return this.ready ? false : undefined;
  };

  AsyncObserver.prototype.notify = function notify() {
    var value = this.getCurrent();

    if (!this.callback || value === this.lastValue) {
      return;
    }

    this.lastValue = value;
    this.callback(value);
  };

  AsyncObserver.prototype.subscribe = function subscribe(callback) {
    var _this3 = this;

    this.callback = callback;
    return function () {
      return _this3.callback = null;
    };
  };

  AsyncObserver.prototype.dispose = function dispose() {
    this.callback = null;
    this.observable = null;
    this.lastValue = null;
  };

  return AsyncObserver;
})();

exports.AsyncObserver = AsyncObserver;