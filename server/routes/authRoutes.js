const express = require('express');
const authController = require('../controllers/authController');

function buildAuthRoutes({ db }) {
  const router = express.Router();
  
  router.post('/register', authController.register(db));
  router.post('/login', authController.login(db));
  router.get('/me', authController.me(db));

  return router;
}

module.exports = { buildAuthRoutes };
