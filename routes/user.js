const express = require('express');
const { handleUserSignup, handleUserLogin } = require('../controllers/user');
const { authLimiter } = require('../middlewares/rateLimiter');
const router = express.Router(); // ✅ Capital 'R'

// ✅ Signup with rate limiting (5 attempts per 15 minutes)
router.post('/', authLimiter, handleUserSignup);

// ✅ Login with rate limiting (5 attempts per 15 minutes)
router.post('/login', authLimiter, handleUserLogin);

// ✅ Logout (no rate limiting needed)
router.post('/logout', (req, res) => {
  res.clearCookie('uid');
  res.redirect('/');
});


module.exports = router;
