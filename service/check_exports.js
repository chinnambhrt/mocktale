const ptr = require('path-to-regexp');
console.log('Type:', typeof ptr);
console.log('Exports:', ptr);
try {
    console.log('match:', ptr.match);
} catch (e) { }
