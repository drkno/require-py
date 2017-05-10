const python = require('./python.js')();
python.register();

const bar = require('./bar.py');
console.log(bar.runTest(1, 'hello world'));

//setTimeout(() => python.unregister(), 5000);
