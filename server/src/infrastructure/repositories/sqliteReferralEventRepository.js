class SqliteReferralEventRepository {
  constructor(db) {
    this.db = db;
  }

  async create({ referralId, status, note, createdAt }) {
    const result = await this.db.run(
      'INSERT INTO referral_events (referral_id, status, note, created_at) VALUES (?, ?, ?, ?)',
      [referralId, status, note, createdAt]
    );

    return { id: result.lastID };
  }

  async listByReferralId(referralId) {
    return this.db.all(
      `
        SELECT id, referral_id as referralId, status, note, created_at as createdAt
        FROM referral_events
        WHERE referral_id = ?
        ORDER BY created_at ASC
      `,
      [referralId]
    );
  }
}

module.exports = { SqliteReferralEventRepository };
