require('dotenv').config();
const express = require('express');
const app = express();
const PORT = 3000;

console.log("PostgreSQL Config:", {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: 5432,
});

app.get('/', (req, res) => {
  res.send('ClearTax is running!');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});