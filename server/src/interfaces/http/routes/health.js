const express = require('express');

function buildHealthRoutes() {
  const router = express.Router();

  router.get('/', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  return router;
}

module.exports = { buildHealthRoutes };
