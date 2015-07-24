# aurelia-async

[![Join the chat at https://gitter.im/aurelia/discuss](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/aurelia/discuss?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

This library is an **experimental** plugin for the [Aurelia](http://www.aurelia.io/) platform enabling asynchronous data-binding.  The current version supports binding to Promises only.  Other async patterns are planned for future releases.

## Usage:

Binding to a promised value:
```html
Hello ${worldPromise..value}
```

Binding to a promise's state:
```html
<span show.bind="worldPromise..ready">Hello ${worldPromise..value}</span>
```

Binding to promised objects:
```html
<div if.bind="orderPromise..ready">
  ${orderPromise..value.orderDate | dateFormat:'MM/dd/yyyy'}
  ${orderPromise..value.shipping}
  ${orderPromise..value.total}
</div>
```

Binding to methods that return promises:
```html
The foo is ${getFoo()..ready ? getFoo()..value : '(resolving...)'}
```
*Note:  the binding system will invoke the `getFoo` function multiple times.  It should return the same promise instance.*

> To keep up to date on [Aurelia](http://www.aurelia.io/), please visit and subscribe to [the official blog](http://blog.durandal.io/). If you have questions, we invite you to [join us on Gitter](https://gitter.im/aurelia/discuss). If you would like to have deeper insight into our development process, please install the [ZenHub](https://zenhub.io) Chrome Extension and visit any of our repository's boards. You can get an overview of all Aurelia work by visiting [the framework board](https://github.com/aurelia/framework#boards).

## Dependencies

* [aurelia-binding](https://github.com/aurelia/binding)

## Platform Support

This library can be used in the **browser** only.

## Building The Code

To build the code, follow these steps.

1. Ensure that [NodeJS](http://nodejs.org/) is installed. This provides the platform on which the build tooling runs.
2. From the project folder, execute the following command:

  ```shell
  npm install
  ```
3. Ensure that [Gulp](http://gulpjs.com/) is installed. If you need to install it, use the following command:

  ```shell
  npm install -g gulp
  ```
4. To build the code, you can now run:

  ```shell
  gulp build
  ```
5. You will find the compiled code in the `dist` folder, available in three module formats: AMD, CommonJS and ES6.

6. See `gulpfile.js` for other tasks related to generating the docs and linting.

## Running The Tests

To run the unit tests, first ensure that you have followed the steps above in order to install all dependencies and successfully build the library. Once you have done that, proceed with these additional steps:

1. Ensure that the [Karma](http://karma-runner.github.io/) CLI is installed. If you need to install it, use the following command:

  ```shell
  npm install -g karma-cli
  ```
2. Ensure that [jspm](http://jspm.io/) is installed. If you need to install it, use the following commnand:

  ```shell
  npm install -g jspm
  ```
3. Install the client-side dependencies with jspm:

  ```shell
  jspm install
  ```

4. You can now run the tests with this command:

  ```shell
  karma start
  ```
  To test in Internet Explorer use this command:
  ```shell
  karma start --browsers IE
  ```
