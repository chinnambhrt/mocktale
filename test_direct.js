async function testEndpoint() {
    try {
        const url = 'http://localhost:3000/mock/4/products/category/1';
        console.log(`Testing: ${url}`);

        const response = await fetch(url);
        const text = await response.text();

        console.log(`Status: ${response.status}`);
        console.log(`Response: ${text}`);

        if (response.ok) {
            console.log('✅ SUCCESS');
        } else {
            console.log('❌ FAILED');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testEndpoint();
