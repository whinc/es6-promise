## es6-promise

An implementation of [ES6 Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
) follow strictly [Promise/A+](https://promisesaplus.com/) specification.

## How to use

Install package with command below:
```bash
$ npm install --save @whinc/es6-promise
```

Example:
```javascript
let ES6Promise = require('@whinc/es6-promise').ES6Promise;

ES6Promise.resolve(3).then((data) => {
    console.log(data);
});

new ES6Promise((resolve, reject) => {
    setTimeout(() => {
        console.log(new Date());
        resolve(1000);
    }, 1000);
}).then(() => {
    console.log(new Date());
});
```

## Others

Gihubu: <https://github.com/whinc/es6-promise>

npm: <https://www.npmjs.com/package/@whinc/es6-promise>