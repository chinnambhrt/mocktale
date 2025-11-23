const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all APIs for a project
router.get('/project/:projectId', (req, res) => {
    const { projectId } = req.params;
    db.all('SELECT * FROM apis WHERE project_id = ? ORDER BY created_at DESC', [projectId], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get a single API
router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM apis WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'API not found' });
            return;
        }
        res.json(row);
    });
});

// Create an API
router.post('/', (req, res) => {
    const { project_id, name, method, endpoint, response_body, response_status, request_match_type, request_body_match } = req.body;
    if (!project_id || !name || !method || !endpoint) {
        res.status(400).json({ error: 'Project ID, Name, Method, and Endpoint are required' });
        return;
    }

    // Ensure endpoint starts with /
    const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    const sql = 'INSERT INTO apis (project_id, name, method, endpoint, response_body, response_status, request_match_type, request_body_match) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    db.run(sql, [project_id, name, method, formattedEndpoint, JSON.stringify(response_body), response_status || 200, request_match_type || 'NONE', request_body_match], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, project_id, name, method, endpoint: formattedEndpoint, response_body, response_status, request_match_type, request_body_match });
    });
});

// Update an API
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, method, endpoint, response_body, response_status, request_match_type, request_body_match } = req.body;

    const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    const sql = `UPDATE apis SET name = ?, method = ?, endpoint = ?, response_body = ?, response_status = ?, request_match_type = ?, request_body_match = ? WHERE id = ?`;
    db.run(sql, [name, method, formattedEndpoint, JSON.stringify(response_body), response_status, request_match_type, request_body_match, id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'API updated', changes: this.changes });
    });
});

// Delete an API
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM apis WHERE id = ?', id, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'API deleted', changes: this.changes });
    });
});

module.exports = router;
