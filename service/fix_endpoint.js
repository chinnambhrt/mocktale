const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'mocktale.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Update 'Products by Category' to remove required_path_params
    db.run(`UPDATE apis SET required_path_params = '{}' WHERE name = 'Products by Category'`, function (err) {
        if (err) {
            console.error(err.message);
        } else {
            console.log(`Row(s) updated: ${this.changes}`);
        }
    });
});

db.close();
