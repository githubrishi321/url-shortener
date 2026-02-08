const express = require('express');
const { handleGenerateNewShortURL, handleGetAnalytics, handleDeleteURL, handleUpdateURL, handleGenerateQRCode } = require("../controllers/url");
const URL = require('../models/url');
const { restrictToLoggedinUserOnly } = require("../middlewares/auth");
const { urlCreationLimiter, qrCodeLimiter } = require("../middlewares/rateLimiter");

const router = express.Router();

// ✅ URL creation with rate limiting (20 per hour)
router.post('/', restrictToLoggedinUserOnly, urlCreationLimiter, handleGenerateNewShortURL);

// ✅ Delete URL (protected)
router.post('/delete/:id', restrictToLoggedinUserOnly, handleDeleteURL);

// ✅ Update URL (protected)
router.post('/update/:id', restrictToLoggedinUserOnly, handleUpdateURL);

// ✅ Generate QR code with rate limiting (50 per hour)
router.get('/qrcode/:shortId', qrCodeLimiter, handleGenerateQRCode);

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
