import {ES6Promise} from './es6-promise'


let p1 = new ES6Promise((resolve, reject) => {
    resolve(1);
});

let p2 = new Promise((resolve, reject) => {
    setTimeout(() => {
        reject(8888);
        // resolve(999);
    }, 1000);
});

ES6Promise.resolve(1)
.then(value => value + 1, reason => reason)
.then(value => ES6Promise.reject(p2), reason => reason)
.catch((value) => console.log(value));
// .then(value => console.log('resolve:' + value), reason => console.log('reject:' + reason));




