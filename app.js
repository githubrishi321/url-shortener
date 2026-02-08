// app.js
require('dotenv').config(); // loads .env for local dev
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const { restrictToLoggedinUserOnly, checkAuth } = require('./middlewares/auth');
// DO NOT import or call connectToMongoDB here — index.js handles DB connect

const URL = require('./models/url');

const urlRoute = require('./routes/url');
const staticRoute = require('./routes/staticRouter');
const userRoute = require('./routes/user');

const app = express();

// quick debug route (optional) - you can remove later
app.get('/db-status', (req, res) => {
  const mongoose = require('mongoose');
  res.json({ readyState: mongoose.connection.readyState });
});

app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/url', urlRoute);
app.use('/user', userRoute);
app.use('/', checkAuth, staticRoute);

app.get('/:shortId', async (req, res) => {
  try {
    const shortId = req.params.shortId;
    const showPreview = req.query.preview === '1';

    const entry = await URL.findOne({ shortId });

    if (!entry) return res.status(404).send('Short URL not found');

    // Check if URL has expired
    if (entry.expiresAt && new Date() > entry.expiresAt) {
      return res.status(410).send(`
        <html>
          <head>
            <title>Link Expired</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
          </head>
          <body class="d-flex align-items-center justify-content-center" style="min-height: 100vh; background: #f8f9fa;">
            <div class="text-center">
              <h1 class="display-1">⌛</h1>
              <h2>Link Expired</h2>
              <p class="text-muted">This short URL has expired and is no longer accessible.</p>
              <p class="text-muted">Expired on: ${entry.expiresAt.toLocaleString()}</p>
              <a href="/" class="btn btn-primary">Go to Homepage</a>
            </div>
          </body>
        </html>
      `);
    }

    // Show preview page if requested
    if (showPreview) {
      return res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Link Preview - URL Shortener</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
          <style>
            body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
            .preview-card { box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
            .url-display { background: #f8f9fa; padding: 15px; border-radius: 8px; word-break: break-all; border-left: 4px solid #667eea; }
          </style>
        </head>
        <body class="d-flex align-items-center justify-content-center p-3">
          <div class="card preview-card" style="max-width: 600px; width: 100%;">
            <div class="card-body p-4">
              <div class="text-center mb-4">
                <h2 class="mb-2">🔗 Link Preview</h2>
                <p class="text-muted">You're about to visit:</p>
              </div>
              
              <div class="url-display mb-4">
                <small class="text-muted d-block mb-1">Destination URL:</small>
                <strong>${entry.redirectURL}</strong>
              </div>

              <div class="alert alert-info mb-4">
                <strong>ℹ️ Safety Reminder:</strong> Always verify the destination URL before proceeding. Be cautious of suspicious links.
              </div>

              <div class="d-grid gap-2">
                <a href="${entry.redirectURL}" class="btn btn-primary btn-lg">
                  ✓ Continue to Destination
                </a>
                <a href="/" class="btn btn-outline-secondary">
                  ← Go Back to Homepage
                </a>
              </div>

              <div class="text-center mt-3">
                <small class="text-muted">
                  Short URL: <strong>${req.protocol}://${req.get('host')}/${shortId}</strong>
                </small>
              </div>
            </div>
          </div>
        </body>
        </html>
      `);
    }

    // Update visit history and redirect
    await URL.findOneAndUpdate(
      { shortId },
      { $push: { visitHistory: { timestamp: Date.now() } } }
    );

    return res.redirect(entry.redirectURL);
  } catch (err) {
    console.error('Redirect failed:', err);
    return res.status(500).send('Internal Server Error');
  }
});

module.exports = app;
