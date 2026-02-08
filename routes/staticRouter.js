const express = require('express');
const URL = require('../models/url');
const { checkAuth, restrictToLoggedinUserOnly } = require("../middlewares/auth");

const router = express.Router();

// ===== PUBLIC ROUTES (No authentication required) =====

// Landing Page - Public homepage
router.get("/", (req, res) => {
  return res.render("landing");
});

// Signup Page
router.get("/signup", (req, res) => {
  return res.render("signup");
});

// Login Page
router.get("/login", (req, res) => {
  return res.render("login");
});

// ===== PROTECTED ROUTES (Authentication required) =====

// Dashboard - User's shortened URLs
router.get("/dashboard", restrictToLoggedinUserOnly, async (req, res) => {
  const allurls = await URL.find({ createdBy: req.user._id });

  return res.render("home", {
    urls: allurls,
    user: req.user,
    id: req.query.shortId || null
  });
});

module.exports = router;
