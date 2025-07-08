const express = require('express');
const URL = require('../models/url');
const { checkAuth } = require("../middlewares/auth");

const router = express.Router();

// Home Page Route with optional shortId from query params
router.get("/", checkAuth, async (req, res) => {
  if (!req.user) return res.redirect('/login');

  const allurls = await URL.find({ createdBy: req.user._id });

  // ✅ Get shortId from query params for success alert
  return res.render("home", {
    urls: allurls,
    user: req.user,
    id: req.query.shortId || null
  });
});

// Signup Page
router.get("/signup", (req, res) => {
  return res.render("signup");
});

// Login Page
router.get("/login", (req, res) => {
  return res.render("login");
});

module.exports = router;
