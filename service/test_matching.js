const pathToRegexp = require('path-to-regexp');

const endpoint = '/products/category/:catId';
const apiPath = '/products/category/1';

console.log(`Endpoint: ${endpoint}`);
console.log(`ApiPath: ${apiPath}`);

const keys = [];
const regexp = pathToRegexp(endpoint, keys);
const match = regexp.exec(apiPath);

console.log('Match Result:', match);

if (match) {
    const params = {};
    keys.forEach((key, index) => {
        params[key.name] = match[index + 1];
    });
    console.log('Params:', params);
} else {
    console.log('No match');
}
