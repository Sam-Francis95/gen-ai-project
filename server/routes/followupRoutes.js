const express = require('express');
const followupController = require('../controllers/followupController');

function buildFollowupRoutes({ db }) {
  const router = express.Router();
  
  router.get('/', followupController.list(db));
  router.post('/', followupController.create(db));
  router.put('/:id/status', followupController.updateStatus(db));

  return router;
}

module.exports = { buildFollowupRoutes };
