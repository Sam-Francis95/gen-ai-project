const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'data', 'careflow.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        db.run(`CREATE TABLE IF NOT EXISTS discharges (
            id TEXT PRIMARY KEY,
            patientId TEXT,
            rawInput TEXT,
            clinicalSummary TEXT,
            patientSummary TEXT,
            structuredData TEXT,
            languageVersions TEXT,
            approved_by TEXT,
            approved_at TEXT,
            doctor_modified INTEGER DEFAULT 0,
            approval_status TEXT DEFAULT 'PENDING',
            doctor_notes TEXT,
            claim_data TEXT,
            card_data TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creating discharges table', err.message);
            }
        });

        // Run safe alters for existing discharges table
        const dischargeAlters = [
            'ALTER TABLE discharges ADD COLUMN approved_by TEXT',
            'ALTER TABLE discharges ADD COLUMN approved_at TEXT',
            'ALTER TABLE discharges ADD COLUMN doctor_modified INTEGER DEFAULT 0',
            'ALTER TABLE discharges ADD COLUMN approval_status TEXT DEFAULT "PENDING"',
            'ALTER TABLE discharges ADD COLUMN doctor_notes TEXT',
            'ALTER TABLE discharges ADD COLUMN claim_data TEXT',
            'ALTER TABLE discharges ADD COLUMN card_data TEXT'
        ];
        dischargeAlters.forEach(sql => {
            db.run(sql, () => {});
        });

        db.run(`CREATE TABLE IF NOT EXISTS progress_notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            referral_id INTEGER NOT NULL,
            day_label TEXT NOT NULL,
            visit_date TEXT NOT NULL,
            vitals TEXT,
            current_symptoms TEXT,
            adherence TEXT,
            clinical_notes TEXT,
            baseline_summary TEXT,
            ai_comparison TEXT,
            recovery_status TEXT,
            recorded_by TEXT,
            created_at TEXT NOT NULL
        )`, (err) => {
            if (err) {
                console.error('Error creating progress_notes table', err.message);
            }
        });
    }
});

module.exports = db;
