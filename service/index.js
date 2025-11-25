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

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'static')));

// Routes
const projectsRouter = require('./routes/projects');
const apisRouter = require('./routes/apis');

app.use('/projects', projectsRouter);
app.use('/apis', apisRouter);

// Mocking Endpoint
const Ajv = require('ajv');
const ajv = new Ajv();
let pathToRegexp = require('path-to-regexp');
if (typeof pathToRegexp !== 'function' && pathToRegexp.pathToRegexp) {
    pathToRegexp = pathToRegexp.pathToRegexp;
}

// Helper function to match paths using v6 API
function matchPath(pattern, path) {
    const keys = [];
    const regexp = pathToRegexp(pattern, keys);
    const result = regexp.exec(path);

    if (!result) return null;

    const params = {};
    keys.forEach((key, index) => {
        params[key.name] = result[index + 1];
    });

    return { params };
}

app.all('/mock/:projectId/*', (req, res) => {
    const projectId = req.params.projectId;
    const apiPath = '/' + req.params[0];
    const method = req.method;
    const requestBody = req.body;
    const requestHeaders = req.headers;

    console.log(`Mocking request: Project ${projectId}, Method ${method}, Path ${apiPath}`);

    // Fetch ALL APIs for this project and method (we can't filter by endpoint in SQL anymore due to patterns)
    db.all(
        'SELECT * FROM apis WHERE project_id = ? AND method = ?',
        [projectId, method],
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
            let capturedParams = {};

            for (const api of rows) {
                // 1. Path Matching
                const result = matchPath(api.endpoint, apiPath);

                console.log(`Checking API: ${api.endpoint} against ${apiPath}`);
                console.log(`Match Result:`, result);

                if (!result) continue; // Path doesn't match

                // 2. Header Validation
                let headersValid = true;
                try {
                    const requiredHeaders = JSON.parse(api.required_headers || '{}');
                    for (const [key, value] of Object.entries(requiredHeaders)) {
                        if (!requestHeaders[key.toLowerCase()] || requestHeaders[key.toLowerCase()] !== value) {
                            headersValid = false;
                            break;
                        }
                    }
                } catch (e) {
                    console.error('Error parsing required_headers', e);
                }
                if (!headersValid) continue;

                // 4. Request Body Matching
                let bodyValid = true;
                if (api.request_match_type === 'EXACT') {
                    try {
                        const expectedBody = JSON.parse(api.request_body_match);
                        if (JSON.stringify(requestBody) !== JSON.stringify(expectedBody)) {
                            bodyValid = false;
                        }
                    } catch (e) {
                        console.error('Invalid JSON in request_body_match for EXACT match');
                        bodyValid = false;
                    }
                } else if (api.request_match_type === 'SCHEMA') {
                    try {
                        const schema = JSON.parse(api.request_body_match);
                        const validate = ajv.compile(schema);
                        if (!validate(requestBody)) {
                            bodyValid = false;
                        }
                    } catch (e) {
                        console.error('Invalid JSON Schema or validation error');
                        bodyValid = false;
                    }
                }

                if (bodyValid) {
                    matchedApi = api;
                    capturedParams = result.params;
                    break; // Found a match!
                }
            }

            if (!matchedApi) {
                res.status(404).json({ error: 'No matching API found for the provided request criteria' });
                return;
            }

            try {
                // TODO: We could potentially inject capturedParams into the response body here if needed
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

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
