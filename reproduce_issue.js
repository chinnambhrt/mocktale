const axios = require('axios');

async function testEndpoint() {
    try {
        // Assuming project ID 4 is E-commerce API based on previous logs (seeded 10 APIs for project 4)
        // If project IDs shifted, this might need adjustment.
        // The user said /mock/4/..., so let's try that.
        const url = 'http://localhost:3000/mock/4/products/category/1';
        console.log(`Requesting: ${url}`);
        const response = await axios.get(url);
        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        console.error('Status:', error.response ? error.response.status : 'Unknown');
    }
}

testEndpoint();
