const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'mocktale.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.all("SELECT id, name, method, endpoint FROM apis WHERE project_id = 4", (err, rows) => {
        if (err) console.error(err);
        else {
            console.log(`Found ${rows.length} APIs for project 4:`);
            rows.forEach(api => {
                console.log(`  - ${api.method} ${api.endpoint} (${api.name})`);
            });
        }
    });
});

db.close();
