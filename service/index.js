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
const Ajv = require('ajv');
const ajv = new Ajv();

app.all('/mock/:projectId/*', (req, res) => {
    const projectId = req.params.projectId;
    const apiPath = '/' + req.params[0];
    const method = req.method;
    const requestBody = req.body;

    console.log(`Mocking request: Project ${projectId}, Method ${method}, Path ${apiPath}`);

    db.all(
        'SELECT * FROM apis WHERE project_id = ? AND endpoint = ? AND method = ?',
        [projectId, apiPath, method],
        (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (!rows || rows.length === 0) {
                res.status(404).json({ error: 'Mock API not found' });
                return;
            }

            // Find the best matching API
            let matchedApi = null;

            for (const api of rows) {
                if (api.request_match_type === 'NONE' || !api.request_match_type) {
                    matchedApi = api;
                    break; // Default match if no specific match required
                } else if (api.request_match_type === 'EXACT') {
                    try {
                        const expectedBody = JSON.parse(api.request_body_match);
                        // Simple deep equal check (naive implementation for JSON)
                        if (JSON.stringify(requestBody) === JSON.stringify(expectedBody)) {
                            matchedApi = api;
                            break;
                        }
                    } catch (e) {
                        console.error('Invalid JSON in request_body_match for EXACT match');
                    }
                } else if (api.request_match_type === 'SCHEMA') {
                    try {
                        const schema = JSON.parse(api.request_body_match);
                        const validate = ajv.compile(schema);
                        if (validate(requestBody)) {
                            matchedApi = api;
                            break;
                        }
                    } catch (e) {
                        console.error('Invalid JSON Schema or validation error');
                    }
                }
            }

            if (!matchedApi) {
                // If we found candidates but none matched the request body criteria
                res.status(400).json({ error: 'No matching API found for the provided request body' });
                return;
            }

            try {
                const responseBody = JSON.parse(matchedApi.response_body);
                res.status(matchedApi.response_status).json(responseBody);
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
