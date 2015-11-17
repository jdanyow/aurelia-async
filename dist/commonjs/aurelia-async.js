'use strict';

exports.__esModule = true;
exports.configure = configure;

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _aureliaBinding = require('aurelia-binding');

var AsyncObserver = (function () {
  function AsyncObserver(observable, observer, ready) {
    _classCallCheck(this, AsyncObserver);

    this.observable = observable;
    this.observer = observer;
    this.ready = ready;
  }

  AsyncObserver.prototype.attach = function attach() {
    var _this = this;

    var observable = this.observable = this.observer ? this.observer.getValue() : this.observable;
    if (!observable) {
      return;
    }
    var subscribe = observable.subscribeOnNext || observable.then;
    if (subscribe) {
      subscribe.call(observable, function (value) {
        if (observable !== _this.observable) {
          return;
        }
        observable.__value = value;
        _this.notify();
      });
      return;
    }
    throw new Error('Object is not "promise-like" or "observable-like".');
  };

  AsyncObserver.prototype.getCurrent = function getCurrent() {
    var observable = this.observable = this.observer ? this.observer.getValue() : this.observable;
    if (observable) {
      return this.ready ? observable.hasOwnProperty('__value') : observable.__value;
    }
    return this.ready ? false : undefined;
  };

  AsyncObserver.prototype.notify = function notify() {
    var newValue = this.getCurrent();
    var oldValue = this.lastValue;

    if (!this.context || newValue === oldValue) {
      return;
    }

    this.lastValue = newValue;
    this.callable.call(this.context, newValue, oldValue);
  };

  AsyncObserver.prototype.call = function call(context, newValue, oldValue) {
    if (newValue === this.observable) {
      return;
    }
    this.observable = newValue;
    this.attach();
    this.notify();
  };

  AsyncObserver.prototype.subscribe = function subscribe(context, callable) {
    this.context = context;
    this.callable = callable;

    if (this.observer) {
      this.lastValue = this.getCurrent();
      this.observer.subscribe('AsyncObserver', this);
    }

    this.attach();
  };

  AsyncObserver.prototype.unsubscribe = function unsubscribe(context, callable) {
    this.context = null;
    this.callable = null;

    if (this.observer) {
      this.lastValue = undefined;
      this.observer.unsubscribe('AsyncObserver', this);
    }
  };

  return AsyncObserver;
})();

exports.AsyncObserver = AsyncObserver;

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

function parse(input) {
  input = input || '';

  return this.cache[input] || (this.cache[input] = new ParserImplementation(this.lexer, input).parseChain());
}

function configure(frameworkConfig) {
  var parser = frameworkConfig.container.get(_aureliaBinding.Parser);
  parser.parse = parse;
}