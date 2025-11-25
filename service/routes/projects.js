const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all projects
router.get('/', (req, res) => {
    db.all('SELECT * FROM projects ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get a single project
router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM projects WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }
        res.json(row);
    });
});

// Create a project
router.post('/', (req, res) => {
    const { name, description } = req.body;
    if (!name) {
        res.status(400).json({ error: 'Name is required' });
        return;
    }
    const sql = 'INSERT INTO projects (name, description) VALUES (?, ?)';
    db.run(sql, [name, description], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, name, description });
    });
});

// Delete a project
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM projects WHERE id = ?', id, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Project deleted', changes: this.changes });
    });
});

module.exports = router;
