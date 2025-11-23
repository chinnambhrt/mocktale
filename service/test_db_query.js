const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'mocktale.db');
const db = new sqlite3.Database(dbPath);

// Exact query from index.js
const projectId = 4;
const method = 'GET';

db.all(
    'SELECT * FROM apis WHERE project_id = ? AND method = ?',
    [projectId, method],
    (err, rows) => {
        if (err) {
            console.error(err);
        } else {
            console.log(`Found ${rows.length} APIs for project ${projectId}, method ${method}`);
            rows.forEach(api => {
                console.log(`\nAPI: ${api.name}`);
                console.log(`  Endpoint: ${api.endpoint}`);
                console.log(`  Method: ${api.method}`);
                console.log(`  Required Path Params: ${api.required_path_params}`);
            });
        }
        db.close();
    }
);
