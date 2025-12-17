const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const db = require('./models/db');
const authRoutes = require('./routes/auth');
const managerRoutes = require('./routes/manager');
const driverRoutes = require('./routes/driver');

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true
}));

app.use('/auth', authRoutes);
app.use('/manager', managerRoutes);
app.use('/driver', driverRoutes);

app.get('/', (req, res) => {
  res.redirect('/auth/login');
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});