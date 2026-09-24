async function runMigrations(db) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS referrals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      department TEXT NOT NULL,
      doctor TEXT,
      specialist TEXT,
      notes TEXT,
      priority TEXT NOT NULL CHECK (priority IN ('normal', 'urgent')),
      status TEXT NOT NULL CHECK (status IN ('CREATED', 'CONTACTED', 'BOOKED', 'VISITED', 'LOST')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      last_contacted_at TEXT,
      booked_at TEXT,
      visited_at TEXT,
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    );

    CREATE TABLE IF NOT EXISTS referral_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      referral_id INTEGER NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('CREATED', 'CONTACTED', 'BOOKED', 'VISITED', 'LOST')),
      note TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (referral_id) REFERENCES referrals(id)
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hospital_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'staff',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS follow_ups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      referral_id INTEGER NOT NULL,
      patient_name TEXT NOT NULL,
      patient_phone TEXT NOT NULL,
      follow_up_date TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('medication', 'appointment', 'check_in', 'warning')),
      message TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'COMPLETED', 'MISSED')),
      created_at TEXT NOT NULL,
      FOREIGN KEY (referral_id) REFERENCES referrals(id)
    );

    CREATE TABLE IF NOT EXISTS whatsapp_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      referral_id INTEGER NOT NULL,
      patient_phone TEXT NOT NULL,
      message TEXT NOT NULL,
      direction TEXT NOT NULL CHECK (direction IN ('OUTBOUND', 'INBOUND')),
      status TEXT NOT NULL DEFAULT 'SENT',
      created_at TEXT NOT NULL,
      FOREIGN KEY (referral_id) REFERENCES referrals(id)
    );

    CREATE TABLE IF NOT EXISTS hospital_notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      target_hospital_email TEXT NOT NULL,
      referral_id INTEGER NOT NULL,
      patient_name TEXT,
      ai_summary TEXT,
      status TEXT DEFAULT 'UNREAD',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS progress_notes (
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
      created_at TEXT NOT NULL,
      FOREIGN KEY (referral_id) REFERENCES referrals(id)
    );

    CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
    CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON referrals(created_at);
    CREATE INDEX IF NOT EXISTS idx_referral_events_referral ON referral_events(referral_id);
    CREATE INDEX IF NOT EXISTS idx_follow_ups_date ON follow_ups(follow_up_date);
    CREATE INDEX IF NOT EXISTS idx_follow_ups_status ON follow_ups(status);
    CREATE INDEX IF NOT EXISTS idx_progress_notes_ref ON progress_notes(referral_id);
  `);

  // Safely add new columns to existing referrals table if they don't exist
  try {
    await db.exec(`ALTER TABLE referrals ADD COLUMN specialist TEXT`);
  } catch (err) {
    // Column already exists
  }

  try {
    await db.exec(`ALTER TABLE referrals ADD COLUMN notes TEXT`);
  } catch (err) {
    // Column already exists
  }

  // Safe alters for discharges table
  const dischargeCols = [
    'ALTER TABLE discharges ADD COLUMN approved_by TEXT',
    'ALTER TABLE discharges ADD COLUMN approved_at TEXT',
    'ALTER TABLE discharges ADD COLUMN doctor_modified INTEGER DEFAULT 0',
    'ALTER TABLE discharges ADD COLUMN approval_status TEXT DEFAULT "PENDING"',
    'ALTER TABLE discharges ADD COLUMN doctor_notes TEXT',
    'ALTER TABLE discharges ADD COLUMN claim_data TEXT',
    'ALTER TABLE discharges ADD COLUMN card_data TEXT'
  ];
  for (const sql of dischargeCols) {
    try {
      await db.exec(sql);
    } catch (e) {
      // Column exists
    }
  }
}

module.exports = { runMigrations };
