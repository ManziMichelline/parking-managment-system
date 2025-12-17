const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../models/db');
const router = express.Router();

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      bcrypt.compare(password, results[0].password, (err, match) => {
        if (match) {
          req.session.user = results[0];
          if (results[0].role === 'manager') {
            res.redirect('/manager/dashboard');
          } else {
            res.redirect('/driver/dashboard');
          }
        } else {
          res.send('Invalid credentials');
        }
      });
    } else {
      res.send('User not found');
    }
  });
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/auth/login');
});

module.exports = router;