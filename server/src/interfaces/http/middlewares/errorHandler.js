const { AppError } = require('../../../domain/errors');
const { logger } = require('../../../config/logger');

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err instanceof AppError ? err.message : 'Internal server error';

  if (statusCode >= 500) {
    logger.error('Unhandled error', err);
  }

  res.status(statusCode).json({
    error: {
      message,
      details: err.details || null,
    },
  });
};

module.exports = { errorHandler };
