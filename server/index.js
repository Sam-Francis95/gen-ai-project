const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const multer = require('multer');

const dischargeRoutes = require('./routes/dischargeRoutes');
const { buildAuthRoutes } = require('./routes/authRoutes');
const authController = require('./controllers/authController');

const env = require('./src/config/env');
const { logger } = require('./src/config/logger');
const { initSqlite } = require('./src/db/sqlite');
const { createApp } = require('./src/app');

async function start() {
    const { db, close } = await initSqlite(env.dbFile);
    // createApp returns the adithya express app (referrals, health, etc.)
    const app = createApp({ db });

    // Seed default admin user
    authController.seedDefaultUser(db);

    // Mount aarya's discharge routes on the combined app
    app.use('/discharge', dischargeRoutes);
    
    // Mount Auth routes
    app.use('/auth', buildAuthRoutes({ db }));
    
    // Mount FollowUp routes
    const { buildFollowupRoutes } = require('./routes/followupRoutes');
    app.use('/followups', buildFollowupRoutes({ db }));

    // Global error handlers
    const { notFound } = require('./src/interfaces/http/middlewares/notFound');
    const { errorHandler } = require('./src/interfaces/http/middlewares/errorHandler');
    app.use(notFound);
    app.use(errorHandler);

    const PORT = env.port || process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
    });

    const shutdown = () => {
        logger.info('Shutting down server');
        server.close(() => {
            close();
        });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
}

start().catch((err) => {
    logger.error('Failed to start server', err);
    process.exit(1);
});