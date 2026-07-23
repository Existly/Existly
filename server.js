require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

// Serve static files from the project root
app.use(express.static(path.join(__dirname)));

// Temporary local route to test the Vercel serverless function
const chatApi = require('./api/chat.js');
app.post('/api/chat', chatApi);

const submitApi = require('./api/submit.js');
app.post('/api/submit', submitApi);

app.listen(PORT, () => {
  console.log(`\x1b[36m%s\x1b[0m`, `Existly Local Static Server is running!`);
  console.log(`URL: http://localhost:${PORT}/`);
  console.log(`Note: The Chatbot API is mapped locally for testing purposes.`);
  console.log(`Press Ctrl+C to terminate server.`);
});
