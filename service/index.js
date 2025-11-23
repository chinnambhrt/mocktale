const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Routes
const projectsRouter = require('./routes/projects');
const apisRouter = require('./routes/apis');

app.use('/projects', projectsRouter);
app.use('/apis', apisRouter);

// Mocking Endpoint
app.all('/mock/:projectId/*', (req, res) => {
    const projectId = req.params.projectId;
    const apiPath = '/' + req.params[0];
    const method = req.method;

    console.log(`Mocking request: Project ${projectId}, Method ${method}, Path ${apiPath}`);

    db.get(
        'SELECT * FROM apis WHERE project_id = ? AND endpoint = ? AND method = ?',
        [projectId, apiPath, method],
        (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (!row) {
                res.status(404).json({ error: 'Mock API not found' });
                return;
            }

            try {
                const responseBody = JSON.parse(row.response_body);
                res.status(row.response_status).json(responseBody);
            } catch (e) {
                res.status(500).json({ error: 'Invalid JSON in response body definition' });
            }
        }
    );
});

// Swagger
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
