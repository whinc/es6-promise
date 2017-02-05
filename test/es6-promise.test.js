var promisesAplusTests = require("promises-aplus-tests");
var ES6Promise = require('../es5/es6-promise.js');

var adapter = {
    resolve: function () {
        ES6Promise.resolve(arguments[0]);
    },
    reject: function () {
        ES6Promise.reject(arguments[0]);
    },
    deferred: function () {
        var resolve, reject;
        var promise = new ES6Promise(function (_resolve, _reject) {
            resolve = _resolve;
            reject = _reject;
        });
        return {
            promise: promise,
            resolve: resolve,
            reject: reject
        };  
    }
}

promisesAplusTests(adapter, function (err) {
    // All done; output is in the console. Or check `err` for number of failures.
    console.error(err);
});