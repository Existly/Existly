require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

// Never hand out source. Vercel does not static-serve api/, but this dev
// server would, so block it here to keep local behaviour honest.
app.use((req, res, next) => {
  if (/^\/(api|node_modules)\//i.test(req.path) && req.method === 'GET') {
    return res.status(404).send('Not found');
  }
  next();
});

// Serve static files from the project root
// `extensions: ['html']` mirrors Vercel's cleanUrls locally, so /property-management
// and /uk/landlords resolve to their .html files here exactly as they do in
// production. Without it every internal link 404s in local dev, because the
// links are extensionless by design.
app.use(express.static(path.join(__dirname), { extensions: ['html'] }));

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
