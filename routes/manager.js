const express = require('express');
const db = require('../models/db');
const router = express.Router();

// Middleware to check if manager
router.use((req, res, next) => {
  if (req.session.user && req.session.user.role === 'manager') {
    next();
  } else {
    res.redirect('/auth/login');
  }
});

router.get('/dashboard', (req, res) => {
  // View parked vehicles
  db.query('SELECT * FROM vehicles WHERE exit_time IS NULL', (err, parked) => {
    if (err) throw err;
    res.render('manager/dashboard', { parked });
  });
});

router.get('/history', (req, res) => {
  db.query('SELECT * FROM vehicles WHERE exit_time IS NOT NULL ORDER BY exit_time DESC', (err, history) => {
    if (err) throw err;
    res.render('manager/history', { history });
  });
});

router.post('/entry', (req, res) => {
  const { plate_number, vehicle_type, driver_username } = req.body;
  const entry_time = new Date();
  db.query('SELECT id FROM users WHERE username = ? AND role = "driver"', [driver_username], (err, results) => {
    if (err) throw err;
    const owner_id = results.length > 0 ? results[0].id : null;
    db.query('INSERT INTO vehicles (plate_number, vehicle_type, owner_id, entry_time) VALUES (?, ?, ?, ?)', [plate_number, vehicle_type, owner_id, entry_time], (err) => {
      if (err) throw err;
      res.redirect('/manager/dashboard');
    });
  });
});

router.post('/exit/:id', (req, res) => {
  const id = req.params.id;
  const exit_time = new Date();
  db.query('SELECT entry_time FROM vehicles WHERE id = ?', [id], (err, results) => {
    if (err) throw err;
    const entry_time = new Date(results[0].entry_time);
    const duration = Math.ceil((exit_time - entry_time) / (1000 * 60 * 60)); // hours
    const fee = duration === 1 ? 1500 : 1500 + (duration - 1) * 1000;
    db.query('UPDATE vehicles SET exit_time = ?, fee = ? WHERE id = ?', [exit_time, fee, id], (err) => {
      if (err) throw err;
      res.redirect('/manager/dashboard');
    });
  });
});

router.get('/reports/daily', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  db.query('SELECT SUM(fee) as revenue FROM vehicles WHERE DATE(exit_time) = ?', [today], (err, results) => {
    if (err) throw err;
    res.render('manager/daily_report', { revenue: results[0].revenue || 0 });
  });
});

router.get('/reports/monthly', (req, res) => {
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();
  db.query('SELECT SUM(fee) as revenue FROM vehicles WHERE MONTH(exit_time) = ? AND YEAR(exit_time) = ?', [month, year], (err, results) => {
    if (err) throw err;
    res.render('manager/monthly_report', { revenue: results[0].revenue || 0 });
  });
});

module.exports = router;