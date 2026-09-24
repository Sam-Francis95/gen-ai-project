const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'careflow-secret-2024';

// Simple password hashing without bcrypt dependency
const hashPassword = (pwd) => crypto.createHash('sha256').update(pwd + 'careflow_salt').digest('hex');

const generateToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, role: user.role, hospital: user.hospital_name }, JWT_SECRET, { expiresIn: '7d' });

exports.register = (db) => async (req, res) => {
  try {
    const { hospitalName, email, password, role = 'staff' } = req.body;
    if (!hospitalName || !email || !password) {
      return res.status(400).json({ error: 'Hospital name, email, and password are required.' });
    }

    const existing = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) return res.status(409).json({ error: 'Email already registered.' });

    const password_hash = hashPassword(password);
    const created_at = new Date().toISOString();

    const result = await db.run(
      'INSERT INTO users (hospital_name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)',
      [hospitalName, email, password_hash, role, created_at]
    );

    const user = { id: result.lastID, email, role, hospital_name: hospitalName };
    const token = generateToken(user);
    res.status(201).json({ token, user: { id: user.id, email, role, hospitalName } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.login = (db) => async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });

    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);

    if (!user || user.password_hash !== hashPassword(password)) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role, hospitalName: user.hospital_name }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.me = (db) => async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided.' });

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db.get('SELECT id, hospital_name, email, role FROM users WHERE id = ?', [decoded.id]);
    
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ id: user.id, hospitalName: user.hospital_name, email: user.email, role: user.role });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// Seed a default hospital account if none exists
exports.seedDefaultUser = (db) => {
  const password_hash = hashPassword('demo1234');
  const created_at = new Date().toISOString();
  
  const mockHospitals = [
    ['CareFlow Demo Hospital', 'admin@careflow.ai', 'admin'],
    ['Apollo Care Center', 'apollo@careflow.ai', 'staff'],
    ['City General Hospital', 'city@careflow.ai', 'staff'],
    ['Metro Heart Institute', 'metro@careflow.ai', 'staff'],
    ['Sunshine Pediatric Care', 'sunshine@careflow.ai', 'staff'],
    ['Global Neuro Center', 'global@careflow.ai', 'staff']
  ];

  mockHospitals.forEach(([name, email, role]) => {
    db.run(
      `INSERT OR IGNORE INTO users (hospital_name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)`,
      [name, email, password_hash, role, created_at],
      (err) => { 
        if (err) console.error(`Seed user error for ${email}:`, err.message); 
        else console.log(`Mock hospital ready: ${email} / demo1234`); 
      }
    );
  });
};
