let ES6Promise = require('../dist/es6-promise').ES6Promise;

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