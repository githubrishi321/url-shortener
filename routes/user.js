const express = require('express');
const { handleUserSignup , handleUserLogin } = require('../controllers/user');
const router = express.Router(); // ✅ Capital 'R'

router.post('/', handleUserSignup);
router.post('/login' , handleUserLogin);
router.post('/logout', (req, res) => {
  res.clearCookie('uid');
  res.redirect('/login');
});


module.exports = router;
