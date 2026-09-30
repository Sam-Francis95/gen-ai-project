class SqlitePatientRepository {
  constructor(db) {
    this.db = db;
  }

  async findByPhone(phone) {
    return this.db.get(
      'SELECT id, name, phone, created_at as createdAt FROM patients WHERE phone = ?',
      [phone]
    );
  }

  async create({ name, phone, createdAt }) {
    const result = await this.db.run(
      'INSERT INTO patients (name, phone, created_at) VALUES (?, ?, ?)',
      [name, phone, createdAt]
    );

    return {
      id: result.lastID,
      name,
      phone,
      createdAt,
    };
  }

  async update(id, { name, phone }) {
    await this.db.run(
      'UPDATE patients SET name = ?, phone = ? WHERE id = ?',
      [name, phone, id]
    );
  }
}

module.exports = { SqlitePatientRepository };
