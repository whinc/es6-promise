'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * 实现 ES6 Promise 对象的构造函数、resolve、reject、then 方法。
 */

var State = {
    pending: 0,
    fulfilled: 1,
    rejected: 2
};

var ES6Promise = function () {
    function ES6Promise(executor) {
        var _this = this;

        _classCallCheck(this, ES6Promise);

        this._state = State.pending;
        this._value = undefined;
        this._callbacks = [];

        if (typeof executor === 'function') {
            var resolve = function resolve(value) {
                _this._transition(State.fulfilled, value);
            };

            var reject = function reject(value) {
                _this._transition(State.rejected, value);
            };
            executor(resolve, reject);
        }
    }

    _createClass(ES6Promise, [{
        key: '_transition',
        value: function _transition(state, value) {
            // 2.1.1 When pending, a promise:may transition to either the fulfilled or rejected state.
            // 2.1.2 When fulfilled, a promise: must not transition to any other state. must have a value, which must not change.
            // 2.1.3 When rejected, a promise:must not transition to any other state.must have a reason, which must not change.
            if (this._state === State.pending) {
                this._state = state;
                this._value = value;
                this._callbacks.forEach(function (callback) {
                    return callback();
                });
            }
        }
    }, {
        key: 'then',
        value: function then(onFulfilled, onRejected) {
            var _this2 = this;

            var self = this;

            var promise2 = new ES6Promise(function (resolve, reject) {
                var scheduleFn = function scheduleFn() {
                    // 2.2.4 onFulfilled or onRejected must not be called until the execution context stack contains only platform code
                    setTimeout(function () {
                        // 2.2.2.1 it must be called after promise is fulfilled, with promise’s value as its first argument.
                        // 2.2.7.3 If onFulfilled is not a function and promise1 is fulfilled, promise2 must be fulfilled with the same value as promise1.
                        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : function (v) {
                            return v;
                        };
                        // 2.2.3.1 it must be called after promise is rejected, with promise’s reason as its first argument.
                        // 2.2.7.4 If onRejected is not a function and promise1 is rejected, promise2 must be rejected with the same reason as promise1.
                        onRejected = typeof onRejected === 'function' ? onRejected : function (v) {
                            throw v;
                        };
                        try {
                            var x = self._state === State.fulfilled ? onFulfilled(self._value) : onRejected(self._value);
                            // 'x' may be javascript value or thenable or promise, need resolve further
                            resolveProcedure({ resolve: resolve, reject: reject, promise2: promise2 }, x);
                        } catch (e) {
                            reject(e);
                        }
                    });
                };

                if (_this2._state === State.pending) {
                    // 2.2.6 then may be called multiple times on the same promise.
                    // 2.2.6.1 If/when promise is fulfilled, all respective onFulfilled callbacks must execute in the order of their originating calls to then.
                    // 2.2.6.2 If/when promise is rejected, all respective onRejected callbacks must execute in the order of their originating calls to then.
                    _this2._callbacks.push(scheduleFn);
                } else {
                    scheduleFn();
                }
            });

            return promise2;
        }
    }, {
        key: 'catch',
        value: function _catch(onRejected) {
            this.then(undefined, onRejected);
        }
    }], [{
        key: 'resolve',
        value: function resolve(value) {
            return new ES6Promise(function (resolve, reject) {
                return resolveProcedure({ resolve: resolve, reject: resolve }, value);
            });
        }
    }, {
        key: 'reject',
        value: function reject(reason) {
            return new ES6Promise(function (resolve, reject) {
                return resolveProcedure({ resolve: reject, reject: reject }, reason);
            });
        }
    }]);

    return ES6Promise;
}();

function resolveProcedure(_ref, x) {
    var resolve = _ref.resolve,
        reject = _ref.reject,
        promise2 = _ref.promise2;

    // 2.3.1 If promise and x refer to the same object, reject promise with a TypeError as the reason.
    if (promise2 === x) {
        reject(new TypeError(x));
    }

    if (x instanceof ES6Promise) {
        // 2.3.2 If x is a promise, adopt its state
        x.then(function (value) {
            return resolveProcedure({ resolve: resolve, reject: reject, promise2: promise2 }, value);
        }, function (reason) {
            return reject(reason);
        });
    } else if ((typeof x === 'undefined' ? 'undefined' : _typeof(x)) === 'object' && x !== null || typeof x === 'function') {
        (function () {
            // 2.3.3 
            var resolvedOrRejected = false;
            try {
                var then = x.then; // 2.3.3.1 Let then be x.then
                if (typeof then === 'function') {
                    // 2.3.3 If then is a function, call it with x as this, first argument resolvePromise, and second argument rejectPromise, where:
                    then.call(x, function (value) {
                        if (!resolvedOrRejected) {
                            resolveProcedure({ resolve: resolve, reject: reject, promise2: promise2 }, value); // 2.3.3.3.1 If/when resolvePromise is called with a value y, run [[Resolve]](promise, y).
                            resolvedOrRejected = true;
                        }
                        // 2.3.3.3.3 If both resolvePromise and rejectPromise are called, or multiple calls to the same argument are made, the first call takes precedence, and any further calls are ignored.
                    }, function (reason) {
                        if (!resolvedOrRejected) {
                            reject(reason); // 2.3.3.3.2 If/when rejectPromise is called with a reason r, reject promise with r.
                            resolvedOrRejected = true;
                        }
                        // 2.3.3.3.3 If both resolvePromise and rejectPromise are called, or multiple calls to the same argument are made, the first call takes precedence, and any further calls are ignored.
                    });
                } else {
                    // 2.3.3.4 If then is not a function, fulfill promise with x.
                    resolve(x);
                }
            } catch (e) {
                if (!resolvedOrRejected) {
                    // 2.3.3.2 If retrieving the property x.then results in a thrown exception e, reject promise with e as the reason.
                    // 2.3.3.4 If calling then throws an exception e
                    reject(e);
                }
            }
        })();
    } else {
        resolve(x); // 2.3.4 If x is not an object or function, fulfill promise with x.
    }
}

exports.ES6Promise = ES6Promise;