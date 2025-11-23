async function testBasicEndpoint() {
    // Test a simple endpoint without path params first
    const tests = [
        'http://localhost:3000/mock/4/products',
        'http://localhost:3000/mock/4/categories',
        'http://localhost:3000/projects'
    ];

    for (const url of tests) {
        try {
            console.log(`\nTesting: ${url}`);
            const response = await fetch(url);
            const text = await response.text();
            console.log(`Status: ${response.status}`);
            if (response.ok) {
                console.log(`✅ Response: ${text.substring(0, 100)}`);
            } else {
                console.log(`❌ Error: ${text}`);
            }
        } catch (error) {
            console.error(`Error: ${error.message}`);
        }
    }
}

testBasicEndpoint();
