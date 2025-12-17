const express = require('express');
const db = require('../models/db');
const router = express.Router();

// Middleware to check if driver
router.use((req, res, next) => {
  if (req.session.user && req.session.user.role === 'driver') {
    next();
  } else {
    res.redirect('/auth/login');
  }
});

router.get('/dashboard', (req, res) => {
  const userId = req.session.user.id;
  // Current parking if any
  db.query('SELECT * FROM vehicles WHERE owner_id = ? AND exit_time IS NULL', [userId], (err, current) => {
    if (err) throw err;
    // Previous records
    db.query('SELECT * FROM vehicles WHERE owner_id = ? AND exit_time IS NOT NULL ORDER BY exit_time DESC', [userId], (err, history) => {
      if (err) throw err;
      res.render('driver/dashboard', { current: current[0], history });
    });
  });
});

module.exports = router;