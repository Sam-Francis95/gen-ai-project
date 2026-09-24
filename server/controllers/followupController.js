exports.list = (db) => async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM follow_ups ORDER BY follow_up_date ASC', []);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = (db) => async (req, res) => {
  try {
    const { referral_id, patient_name, patient_phone, follow_up_date, type, message } = req.body;
    const created_at = new Date().toISOString();

    const result = await db.run(
      'INSERT INTO follow_ups (referral_id, patient_name, patient_phone, follow_up_date, type, message, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [referral_id, patient_name, patient_phone, follow_up_date, type, message, created_at]
    );

    res.status(201).json({ id: result.lastID, message: 'Follow-up created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateStatus = (db) => async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    await db.run(
      'UPDATE follow_ups SET status = ? WHERE id = ?',
      [status, id]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
