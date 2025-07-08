const express = require('express');
const { handleGenerateNewShortURL, handleGetAnalytics } = require("../controllers/url");
const URL = require('../models/url');
const { restrictToLoggedinUserOnly } = require("../middlewares/auth");

const router = express.Router();

// ✅ Only this POST route is protected
router.post('/', restrictToLoggedinUserOnly, handleGenerateNewShortURL);

// ✅ Anyone can view analytics
router.get('/analytics/:shortId', handleGetAnalytics);

// ✅ Anyone can open short links
router.get('/:shortId', async (req, res) => {
  const shortId = req.params.shortId;

  const entry = await URL.findOneAndUpdate(
    { shortId },
    {
      $push: {
        visitHistory: {
          timestamp: Date.now(),
        }
      }
    }
  );

  if (!entry) {
    return res.status(404).send("Short URL not found");
  }

  res.redirect(entry.redirectURL);
});

module.exports = router;
