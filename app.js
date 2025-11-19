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
    const entry = await URL.findOneAndUpdate(
      { shortId },
      { $push: { visitHistory: { timestamp: Date.now() } } },
      { new: true }
    );

    if (!entry) return res.status(404).send('Short URL not found');
    return res.redirect(entry.redirectURL);
  } catch (err) {
    console.error('Redirect failed:', err);
    return res.status(500).send('Internal Server Error');
  }
});

module.exports = app;
