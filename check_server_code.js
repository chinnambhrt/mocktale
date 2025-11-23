// This will test if the server is using the old or new matching code
// by hitting an endpoint that would only work with the new code

async function checkServerCode() {
    const url = 'http://localhost:3000/mock/4/products/category/electronics';

    try {
        console.log('Testing with category: electronics');
        const response = await fetch(url);
        const text = await response.text();

        console.log(`Status: ${response.status}`);
        console.log(`Response: ${text}`);

        console.log('\nTesting with category: 1');
        const response2 = await fetch('http://localhost:3000/mock/4/products/category/1');
        const text2 = await response2.text();

        console.log(`Status: ${response2.status}`);
        console.log(`Response: ${text2}`);

        if (response.status === 404 && response2.status === 404) {
            console.log('\n⚠️  SERVER IS RUNNING OLD CODE - both requests failed');
            console.log('The server needs to be restarted for the code changes to take effect.');
        } else if (response.ok && response2.ok) {
            console.log('\n✅ SERVER IS RUNNING NEW CODE - both requests succeeded');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkServerCode();
