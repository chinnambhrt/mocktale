const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'mocktale.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database ' + dbPath + ': ' + err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS apis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    method TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    response_body TEXT,
    response_status INTEGER DEFAULT 200,
    request_match_type TEXT DEFAULT 'NONE', -- NONE, EXACT, SCHEMA
    request_body_match TEXT,
    required_headers TEXT, -- JSON string of key-value pairs
    required_path_params TEXT, -- JSON string of key-value pairs
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
  )`);

  migrate();
});

function migrate() {
  const columns = [
    "ALTER TABLE apis ADD COLUMN request_match_type TEXT DEFAULT 'NONE'",
    "ALTER TABLE apis ADD COLUMN request_body_match TEXT",
    "ALTER TABLE apis ADD COLUMN required_headers TEXT",
    "ALTER TABLE apis ADD COLUMN required_path_params TEXT"
  ];

  let completed = 0;
  columns.forEach(sql => {
    db.run(sql, (err) => {
      // Ignore errors (column likely exists)
      completed++;
      if (completed === columns.length) {
        seedData();
      }
    });
  });
}

function seedData() {
  const seedProjects = [
    { name: 'E-commerce API', seeder: seedEcommerceProject },
    { name: 'User Management Service', seeder: seedUserProject }
  ];

  seedProjects.forEach(({ name, seeder }) => {
    db.get("SELECT id FROM projects WHERE name = ?", [name], (err, row) => {
      if (err) console.error(err);
      else if (!row) {
        console.log(`Seeding ${name}...`);
        seeder();
      }
    });
  });
}

function seedEcommerceProject() {
  db.run(`INSERT INTO projects (name, description) VALUES ('E-commerce API', 'Mock API for an online store')`, function (err) {
    if (err) {
      console.error("Error creating E-commerce project:", err);
      return;
    }
    const projectId = this.lastID;
    const apis = [
      {
        name: 'List Products', method: 'GET', endpoint: '/products',
        response_body: JSON.stringify([{ id: 1, name: "Laptop", price: 999 }, { id: 2, name: "Phone", price: 699 }]),
        response_status: 200
      },
      {
        name: 'Get Product Details', method: 'GET', endpoint: '/products/:id',
        response_body: JSON.stringify({ id: "1", name: "Laptop", description: "High performance", stock: 50 }),
        response_status: 200
      },
      {
        name: 'Add to Cart', method: 'POST', endpoint: '/cart',
        request_match_type: 'SCHEMA',
        request_body_match: JSON.stringify({ type: "object", required: ["productId", "quantity"], properties: { productId: { type: "integer" }, quantity: { type: "integer" } } }),
        response_body: JSON.stringify({ success: true, message: "Item added to cart", cartId: 101 }),
        response_status: 201
      },
      {
        name: 'View Cart', method: 'GET', endpoint: '/cart',
        response_body: JSON.stringify({ items: [{ productId: 1, quantity: 2 }], total: 1998 }),
        response_status: 200
      },
      {
        name: 'Remove Item', method: 'DELETE', endpoint: '/cart/:itemId',
        response_body: JSON.stringify({ success: true, message: "Item removed" }),
        response_status: 200
      },
      {
        name: 'Checkout', method: 'POST', endpoint: '/orders',
        required_headers: JSON.stringify({ "Authorization": "Bearer token" }),
        response_body: JSON.stringify({ orderId: "ORD-555", status: "Processing" }),
        response_status: 201
      },
      {
        name: 'Order Details', method: 'GET', endpoint: '/orders/:id',
        response_body: JSON.stringify({ id: "ORD-555", items: [{ name: "Laptop", price: 999 }], total: 999, status: "Shipped" }),
        response_status: 200
      },
      {
        name: 'Update Product', method: 'PUT', endpoint: '/products/:id',
        required_headers: JSON.stringify({ "X-Admin-Key": "secret" }),
        response_body: JSON.stringify({ success: true, message: "Product updated" }),
        response_status: 200
      },
      {
        name: 'List Categories', method: 'GET', endpoint: '/categories',
        response_body: JSON.stringify(["Electronics", "Books", "Clothing", "Home"]),
        response_status: 200
      },
      {
        name: 'Products by Category', method: 'GET', endpoint: '/products/category/:catId',
        // Removed required_path_params to allow any category ID
        response_body: JSON.stringify([{ id: 1, name: "Laptop" }, { id: 3, name: "Tablet" }]),
        response_status: 200
      }
    ];
    insertApis(projectId, apis);
  });
}

function seedUserProject() {
  db.run(`INSERT INTO projects (name, description) VALUES ('User Management Service', 'API for user auth and profiles')`, function (err) {
    if (err) {
      console.error("Error creating User project:", err);
      return;
    }
    const projectId = this.lastID;
    const apis = [
      {
        name: 'Login', method: 'POST', endpoint: '/login',
        request_match_type: 'EXACT',
        request_body_match: JSON.stringify({ username: "admin", password: "password" }),
        response_body: JSON.stringify({ token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", expiresIn: 3600 }),
        response_status: 200
      },
      {
        name: 'Register', method: 'POST', endpoint: '/register',
        request_match_type: 'SCHEMA',
        request_body_match: JSON.stringify({ type: "object", required: ["email", "password"], properties: { email: { type: "string" }, password: { type: "string", minLength: 8 } } }),
        response_body: JSON.stringify({ id: 501, message: "User registered successfully" }),
        response_status: 201
      },
      {
        name: 'Get Profile', method: 'GET', endpoint: '/profile',
        required_headers: JSON.stringify({ "Authorization": "Bearer valid-token" }),
        response_body: JSON.stringify({ id: 1, username: "admin", email: "admin@example.com", role: "admin" }),
        response_status: 200
      },
      {
        name: 'Get Profile (Unauthorized)', method: 'GET', endpoint: '/profile',
        response_body: JSON.stringify({ error: "Unauthorized" }),
        response_status: 401
      },
      {
        name: 'Update Profile', method: 'PUT', endpoint: '/profile',
        required_headers: JSON.stringify({ "Authorization": "Bearer valid-token" }),
        response_body: JSON.stringify({ success: true, message: "Profile updated" }),
        response_status: 200
      },
      {
        name: 'List Users', method: 'GET', endpoint: '/users',
        required_headers: JSON.stringify({ "Role": "Admin" }),
        response_body: JSON.stringify([{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }]),
        response_status: 200
      },
      {
        name: 'Delete User', method: 'DELETE', endpoint: '/users/:id',
        required_headers: JSON.stringify({ "Role": "Admin" }),
        response_body: JSON.stringify({ success: true, message: "User deleted" }),
        response_status: 200
      },
      {
        name: 'Ban User', method: 'POST', endpoint: '/users/:id/ban',
        response_body: JSON.stringify({ success: true, message: "User banned" }),
        response_status: 200
      },
      {
        name: 'Notifications', method: 'GET', endpoint: '/notifications',
        response_body: JSON.stringify([{ id: 1, text: "Welcome!" }, { id: 2, text: "Password expiring soon" }]),
        response_status: 200
      },
      {
        name: 'Logout', method: 'POST', endpoint: '/logout',
        response_body: JSON.stringify({ message: "Logged out" }),
        response_status: 200
      }
    ];
    insertApis(projectId, apis);
  });
}

function insertApis(projectId, apis) {
  const stmt = db.prepare(`INSERT INTO apis (
    project_id, name, method, endpoint, response_body, response_status, 
    request_match_type, request_body_match, required_headers, required_path_params
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

  apis.forEach(api => {
    stmt.run(
      projectId, api.name, api.method, api.endpoint, api.response_body, api.response_status,
      api.request_match_type || 'NONE', api.request_body_match,
      api.required_headers || '{}', api.required_path_params || '{}'
    );
  });

  stmt.finalize();
  console.log(`Seeded ${apis.length} APIs for project ${projectId}`);
}

module.exports = db;
