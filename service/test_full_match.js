const pathToRegexp = require('path-to-regexp');

// Helper function from index.js
function matchPath(pattern, path) {
    const keys = [];
    const regexp = pathToRegexp(pattern, keys);
    const result = regexp.exec(path);

    if (!result) return null;

    const params = {};
    keys.forEach((key, index) => {
        params[key.name] = result[index + 1];
    });

    return { params };
}

// Simulate the exact request
const apiPath = '/products/category/1';
const requestHeaders = {};
const requestBody = {};

// This is the API from the DB
const api = {
    name: 'Products by Category',
    endpoint: '/products/category/:catId',
    method: 'GET',
    required_headers: '{}',
    required_path_params: '{}',
    request_match_type: 'NONE'
};

console.log('Testing API:', api.name);
console.log('Endpoint pattern:', api.endpoint);
console.log('Request path:', apiPath);
console.log();

// 1. Path Matching
const result = matchPath(api.endpoint, apiPath);
console.log('1. Path Match Result:', result);

if (!result) {
    console.log('❌ Path did not match');
    process.exit(1);
}
console.log('✅ Path matched');

// 2. Header Validation
let headersValid = true;
try {
    const requiredHeaders = JSON.parse(api.required_headers || '{}');
    console.log('2. Required headers:', requiredHeaders);
    for (const [key, value] of Object.entries(requiredHeaders)) {
        if (!requestHeaders[key.toLowerCase()] || requestHeaders[key.toLowerCase()] !== value) {
            headersValid = false;
            break;
        }
    }
} catch (e) {
    console.error('Error parsing required_headers', e);
}
console.log('Headers valid:', headersValid);

if (!headersValid) {
    console.log('❌ Headers validation failed');
    process.exit(1);
}
console.log('✅ Headers validated');

// 3. Path Param Validation
let paramsValid = true;
try {
    const requiredPathParams = JSON.parse(api.required_path_params || '{}');
    console.log('3. Required path params:', requiredPathParams);
    console.log('   Captured params:', result.params);
    for (const [key, value] of Object.entries(requiredPathParams)) {
        if (result.params[key] !== value) {
            console.log(`   Param ${key}: expected ${value}, got ${result.params[key]}`);
            paramsValid = false;
            break;
        }
    }
} catch (e) {
    console.error('Error parsing required_path_params', e);
}
console.log('Path params valid:', paramsValid);

if (!paramsValid) {
    console.log('❌ Path params validation failed');
    process.exit(1);
}
console.log('✅ Path params validated');

// 4. Request Body Matching
let bodyValid = true;
if (api.request_match_type === 'NONE') {
    console.log('4. Body matching: NONE (skipped)');
    bodyValid = true;
}
console.log('Body valid:', bodyValid);

if (bodyValid) {
    console.log();
    console.log('🎉 ALL VALIDATIONS PASSED - API SHOULD MATCH');
} else {
    console.log('❌ Body validation failed');
}
