async function testEndpoint() {
    try {
        // We need to find the project ID first, or just guess. 
        // The user said /mock/4/... but in my previous logs it was project 4 or 5.
        // I'll try a few IDs or just fetch the project list first if I could.
        // But let's assume the user's URL was correct for their instance: /mock/4/...
        // If I reset the DB, the IDs might have incremented.
        // Let's try to find the correct URL dynamically or just try 1, 2, 3, 4, 5, 6.

        // Actually, I can query the DB to find the project ID for 'E-commerce API'.
        // But for this script, I'll just try the URL the user gave, and if it 404s on project not found, I'll try others.

        const projectIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        let success = false;

        for (const id of projectIds) {
            const url = `http://localhost:3000/mock/${id}/products/category/1`;
            try {
                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    console.log(`Success with Project ID ${id}:`, data);
                    success = true;
                    break;
                }
            } catch (e) {
                // ignore connection errors
            }
        }

        if (!success) console.log("Failed to find working endpoint.");

    } catch (error) {
        console.error('Error:', error);
    }
}

testEndpoint();
