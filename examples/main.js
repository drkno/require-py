const python = require('../src/pythonServer.js')();
python.register();

const bar = require('./required.py');
console.log(bar.runTest(1, 'hello world'));
