const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'mocktale.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.all("SELECT id, project_id, name, endpoint, required_path_params FROM apis WHERE name = 'Products by Category'", (err, rows) => {
        if (err) console.error(err);
        else console.log(JSON.stringify(rows, null, 2));
    });
});

db.close();
