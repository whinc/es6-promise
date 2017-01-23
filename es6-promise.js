
/**
 * 实现 ES6 Promise 对象的构造函数、resolve、reject、then 方法。
 */

const State = {
    pending: 0,
    resolved: 1,
    rejected: 2
}


class ES6Promise {
    constructor(executor) {
        this._state = State.pending;
        this._value = undefined;
        this._callbacks = [];

        if (typeof executor === 'function') {
            let resolve = (value) => {
                this._transition(State.resolved, value);
            };

            let reject = (value) => {
                this._transition(State.rejected, value);
            };
            executor(resolve, reject);
        }
    }

    _transition(state, value) {
        // 2.1.1 When pending, a promise:may transition to either the fulfilled or rejected state.
        // 2.1.2 When fulfilled, a promise: must not transition to any other state. must have a value, which must not change.
        // 2.1.3 When rejected, a promise:must not transition to any other state.must have a reason, which must not change.
        if (this._state === State.pending) {    
            this._state = state;               
            this._value = value;
            this._callbacks.forEach(callback => callback());
        } 
    }

    then(onResolved, onRejected) {
        let self = this;

        let promise2 = new ES6Promise((resolve, reject) => {
            let scheduleFn = () => {
                // 2.2.4 onFulfilled or onRejected must not be called until the execution context stack contains only platform code
                setTimeout(() => {
                    // 2.2.2.1 it must be called after promise is fulfilled, with promise’s value as its first argument.
                    // 2.2.7.3 If onFulfilled is not a function and promise1 is fulfilled, promise2 must be fulfilled with the same value as promise1.
                    onResolved = typeof onResolved === 'function' ? onResolved : v => v;
                    // 2.2.3.1 it must be called after promise is rejected, with promise’s reason as its first argument.
                    // 2.2.7.4 If onRejected is not a function and promise1 is rejected, promise2 must be rejected with the same reason as promise1.
                    onRejected = typeof onRejected === 'function' ? onRejected : v => v;
                    try {
                        let x = self._state === State.resolved ? onResolved(self._value) : onRejected(self._value);
                        // 'x' may be javascript value or thenable or promise, need resolve further
                        resolveProcedure({ resolve, reject }, x);
                    } catch (e) {
                        reject(e);
                    }
                });
            }

            if (this._state === State.pending) {
                // 2.2.6 then may be called multiple times on the same promise.
                // 2.2.6.1 If/when promise is fulfilled, all respective onFulfilled callbacks must execute in the order of their originating calls to then.
                // 2.2.6.2 If/when promise is rejected, all respective onRejected callbacks must execute in the order of their originating calls to then.
                this._callbacks.push(scheduleFn);
            } else {
                scheduleFn();
            }
        });

        return promise2;
    }

    catch(onRejected) {
        this.then(undefined, onRejected);
    }


    static resolve(value) {
        return new ES6Promise((resolve, reject) => resolveProcedure({resolve, reject: resolve}, value));
    }

    static reject(reason) {
        return new ES6Promise((resolve, reject) => resolveProcedure({resolve: reject, reject}, reason));
    }
}

function resolveProcedure({ resolve, reject }, x) {
    // 2.3.1 If promise and x refer to the same object, reject promise with a TypeError as the reason.
    if (arguments[0] === x) {
        throw new TypeError(arguments[0]);
    }

    if (x instanceof ES6Promise) {    // 2.3.2 If x is a promise, adopt its state
        x.then(value => resolve(value), reason => reject(reason));
    } else if ((typeof x === 'object') || (typeof x === 'function')) {  // 2.3.3 
        let resolvedOrRejected = false;
        try {
            let then = x.then;      // 2.3.3.1 Let then be x.then
            if (typeof then === 'function') {   // 2.3.3 If then is a function, call it with x as this, first argument resolvePromise, and second argument rejectPromise, where:
                then.call(x, value => {
                    if (!resolvedOrRejected) {
                        resolveProcedure({ resolve, reject }, value); // 2.3.3.3.1 If/when resolvePromise is called with a value y, run [[Resolve]](promise, y).
                        resolvedOrRejected = true;
                    }
                    // 2.3.3.3.3 If both resolvePromise and rejectPromise are called, or multiple calls to the same argument are made, the first call takes precedence, and any further calls are ignored.
                }, reason => {
                    if (!resolvedOrRejected) {
                        reject(reason);             // 2.3.3.3.2 If/when rejectPromise is called with a reason r, reject promise with r.
                        resolvedOrRejected = true;
                    }
                    // 2.3.3.3.3 If both resolvePromise and rejectPromise are called, or multiple calls to the same argument are made, the first call takes precedence, and any further calls are ignored.
                });
            } else {                // 2.3.3.4 If then is not a function, fulfill promise with x.
                resolve(x);
            }
        } catch (e) {
            if (!resolvedOrRejected) {
                // 2.3.3.2 If retrieving the property x.then results in a thrown exception e, reject promise with e as the reason.
                // 2.3.3.4 If calling then throws an exception e
                reject(e);
            }
        }
    } else {
        resolve(x);     // 2.3.4 If x is not an object or function, fulfill promise with x.
    }
}

export {ES6Promise}