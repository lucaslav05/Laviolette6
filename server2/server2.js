// server2 code for Lab 5 API
// ----------------------------------------
// REQUIRED MODULES
const http = require('http');
const mysql = require('mysql2');
const url = require('url');

// ----------------------------------------
// CONFIGURATION STRINGS (do not use "var")
const dbConfig = {
  host: '157.230.14.38',
  user: 'lab5user',      
  password: 'Jackjohn1',  
  database: 'Lab5'
};

// ----------------------------------------
// SET UP MYSQL CONNECTION & INITIALIZE DB/TABLE
// First, create a connection without specifying a DB.
const dbConnection = mysql.createConnection({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password
});

dbConnection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL server.");

  // Create the database if it doesn't exist
  dbConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``, (err) => {
    if (err) {
      console.error("Error creating database:", err);
      return;
    }
    console.log(`Database '${dbConfig.database}' is ready.`);

    // Switch to the newly created (or existing) database
    dbConnection.changeUser({ database: dbConfig.database }, (err) => {
      if (err) {
        console.error("Error changing database:", err);
        return;
      }

      // Create the 'patient' table if it doesn't exist
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS patient (
            patientid INT(11) NOT NULL AUTO_INCREMENT,
            name VARCHAR(100) NOT NULL,
            dateOfBirth DATETIME,
            PRIMARY KEY (patientid)
            ) ENGINE=InnoDB;

      `;
      dbConnection.query(createTableQuery, (err) => {
        if (err) {
          console.error("Error creating table:", err);
        } else {
          console.log("Table 'patient' is ready.");
        }
      });
    });
  });
});


const server = http.createServer((req, res) => {
  // Enable CORS to allow cross-origin requests from server1.
  // Here we allow all origins with '*' but you could restrict it if needed.
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;

  // Only process requests that start with /lab5/api/v1/sql
  if (path.startsWith('/lab5/api/v1/sql')) {
    if (req.method === "GET") {
      // For GET requests, expect the SQL query to be appended to the URL
      const parts = path.split('/lab5/api/v1/sql/');
      let queryText = "";
      if (parts.length > 1) {
        queryText = decodeURIComponent(parts[1]);
      }
      processQuery(queryText, res);
    } else if (req.method === "POST") {
      // For POST requests, the SQL query is expected in the request body
      let body = "";
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        const queryText = body.toString();
        processQuery(queryText, res);
      });
    } else {
      res.writeHead(405, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Method not allowed" }));
    }
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not Found" }));
  }
});

// ----------------------------------------
// PROCESS THE SQL QUERY
// ----------------------------------------
function processQuery(queryText, res) {
  if (!queryText) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "No SQL query provided" }));
    return;
  }

  const lowerQuery = queryText.toLowerCase().trim();

  // Block queries containing disallowed keywords
  const disallowedKeywords = ["update", "delete", "drop", "alter"];
  for (const keyword of disallowedKeywords) {
    if (lowerQuery.includes(keyword)) {
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Operation not allowed" }));
      return;
    }
  }

  // Only allow SELECT or INSERT queries
  if (lowerQuery.startsWith("select") || lowerQuery.startsWith("insert")) {
    dbConnection.query(queryText, (err, results) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      } else {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(results));
      }
    });
  } else {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Only SELECT or INSERT queries are allowed" }));
  }
}

// ----------------------------------------
// START THE SERVER
// ----------------------------------------
const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Server2 is running on port ${PORT}`);
});
