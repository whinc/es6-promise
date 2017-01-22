import {ES6Promise} from './es6-promise'


let p1 = new ES6Promise((resolve, reject) => {
    resolve(1);
});

let p2 = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve(2);
    }, 1000);
});

p1.then((value) => {
    console.log(value);
    return p2;
}, (reason) => {
    console.log(reason);
    return ;
}).then(value => {
    console.log(value);
});




