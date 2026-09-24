const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const env = require('./config/env');
const { buildContainer } = require('./container');
const { buildReferralRoutes } = require('./interfaces/http/routes/referrals');
const { buildHealthRoutes } = require('./interfaces/http/routes/health');
const { notFound } = require('./interfaces/http/middlewares/notFound');
const { errorHandler } = require('./interfaces/http/middlewares/errorHandler');

function createApp({ db }) {
  const app = express();
  const { referralController } = buildContainer({ db });

  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigin === '*' ? true : env.corsOrigin.split(','),
    })
  );
  app.use(express.json({ limit: '1mb' }));

  app.use('/health', buildHealthRoutes());
  app.use('/referrals', buildReferralRoutes({ referralController }));

  // Handlers will be attached later in index.js

  return app;
}

module.exports = { createApp };
