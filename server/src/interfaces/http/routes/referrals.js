const express = require('express');

const { asyncHandler } = require('../middlewares/asyncHandler');

function buildReferralRoutes({ referralController }) {
  const router = express.Router();

  router.get('/stats', asyncHandler(referralController.stats));
  router.get('/', asyncHandler(referralController.list));
  router.get('/:id', asyncHandler(referralController.getById));
  router.post('/', asyncHandler(referralController.createReferral));
  router.put('/:id/status', asyncHandler(referralController.updateStatus));

  return router;
}

module.exports = { buildReferralRoutes };
