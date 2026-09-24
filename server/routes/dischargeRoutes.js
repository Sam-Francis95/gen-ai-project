const express = require('express');
const router = express.Router();
const multer = require('multer');
const dischargeController = require('../controllers/dischargeController');

// Set up Multer for handling file uploads in memory
const upload = multer({ storage: multer.memoryStorage() });

// Core Discharge Routes
router.post('/generate', upload.single('report'), dischargeController.generateDischarge);
router.post('/validate', dischargeController.validateDischargePlan);
router.post('/translate', dischargeController.translateDischarge);
router.post('/voice', dischargeController.processVoice);
router.post('/followup', dischargeController.scheduleFollowup);
router.get('/patient/:id', dischargeController.getDischargeByPatient);
router.post('/transfer', dischargeController.transferDischarge);
router.get('/notifications', dischargeController.getNotifications);
router.get('/transfer-history/:referralId', dischargeController.getTransferHistory);

// Feature 1: Patient Recovery Tracker
router.post('/progress-note', dischargeController.recordProgressNote);
router.get('/progress-notes/:referralId', dischargeController.getProgressNotes);

// Feature 2: Health Insurance Claim Assistant
router.post('/claim-assistant', dischargeController.generateInsuranceClaim);

// Feature 3: Multilingual Discharge Card (8 Indian Languages)
router.post('/discharge-card', dischargeController.generateDischargeCard);

// Feature 4: Doctor Approval Checklist
router.post('/approve', dischargeController.approveDischarge);

module.exports = router;
