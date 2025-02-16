const messages = {
    error: {
      noQuery: "No SQL query provided",
      methodNotAllowed: "Method not allowed",
      notFound: "Not Found",
      operationNotAllowed: "Operation not allowed",
      onlySelectInsert: "Only SELECT or INSERT queries are allowed",
      databaseError: "Error connecting to MySQL",
      createDatabaseError: "Error creating database",
      changeDatabaseError: "Error changing database",
      createTableError: "Error creating table",
      queryExecutionError: "Error executing query"
    },
    success: {
      databaseReady: "Database is ready",
      tableReady: "Table is ready",
      querySuccess: "Query executed successfully"
    }
  };
  
  module.exports = messages;
  