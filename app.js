require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const { restrictToLoggedinUserOnly, checkAuth } = require('./middlewares/auth');
const { connectToMongoDB } = require('./connect');

const URL = require('./models/url');

const urlRoute = require('./routes/url');
const staticRoute = require('./routes/staticRouter');
const userRoute = require('./routes/user');

const app = express();

connectToMongoDB(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection failed:', err));

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

