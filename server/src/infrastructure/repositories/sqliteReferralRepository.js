const { ReferralStatus } = require('../../domain/referralStatus');

function mapReferralRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    patient: {
      id: row.patient_id,
      name: row.patient_name,
      phone: row.patient_phone,
    },
    department: row.department,
    doctor: row.doctor,
    specialist: row.specialist,
    notes: row.notes,
    priority: row.priority,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastContactedAt: row.last_contacted_at,
    bookedAt: row.booked_at,
    visitedAt: row.visited_at,
  };
}

class SqliteReferralRepository {
  constructor(db) {
    this.db = db;
  }

  async create({
    patientId,
    department,
    doctor,
    specialist,
    notes,
    priority,
    status,
    createdAt,
    updatedAt,
  }) {
    const result = await this.db.run(
      `
        INSERT INTO referrals (
          patient_id,
          department,
          doctor,
          specialist,
          notes,
          priority,
          status,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [patientId, department, doctor, specialist, notes, priority, status, createdAt, updatedAt]
    );

    return { id: result.lastID };
  }

  async findById(id) {
    const row = await this.db.get(
      `
        SELECT
          r.*, 
          p.name as patient_name,
          p.phone as patient_phone
        FROM referrals r
        JOIN patients p ON p.id = r.patient_id
        WHERE r.id = ?
      `,
      [id]
    );

    return mapReferralRow(row);
  }

  async list({ status, priority, limit, offset }) {
    const conditions = [];
    const params = [];

    if (status) {
      conditions.push('r.status = ?');
      params.push(status);
    }

    if (priority) {
      conditions.push('r.priority = ?');
      params.push(priority);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    const rows = await this.db.all(
      `
        SELECT
          r.*, 
          p.name as patient_name,
          p.phone as patient_phone
        FROM referrals r
        JOIN patients p ON p.id = r.patient_id
        ${whereClause}
        ORDER BY r.created_at DESC
        LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    return rows.map(mapReferralRow);
  }

  async updateStatus(referralId, updates) {
    const fields = ['status = ?', 'updated_at = ?'];
    const params = [updates.status, updates.updatedAt];

    if (updates.lastContactedAt) {
      fields.push('last_contacted_at = ?');
      params.push(updates.lastContactedAt);
    }

    if (updates.bookedAt) {
      fields.push('booked_at = ?');
      params.push(updates.bookedAt);
    }

    if (updates.visitedAt) {
      fields.push('visited_at = ?');
      params.push(updates.visitedAt);
    }

    params.push(referralId);

    await this.db.run(
      `UPDATE referrals SET ${fields.join(', ')} WHERE id = ?`,
      params
    );
  }

  async getStats() {
    const totalRow = await this.db.get(
      'SELECT COUNT(*) as total FROM referrals'
    );

    const statusRows = await this.db.all(
      'SELECT status, COUNT(*) as count FROM referrals GROUP BY status'
    );

    const atRiskRow = await this.db.get(
      `
        SELECT COUNT(*) as count
        FROM referrals
        WHERE status IN (?, ?, ?)
          AND julianday('now') - julianday(created_at) >= 5
      `,
      [
        ReferralStatus.CREATED,
        ReferralStatus.CONTACTED,
        ReferralStatus.BOOKED,
      ]
    );

    const byStatus = statusRows.reduce((acc, row) => {
      acc[row.status] = row.count;
      return acc;
    }, {});

    return {
      total: totalRow ? totalRow.total : 0,
      byStatus,
      atRisk: atRiskRow ? atRiskRow.count : 0,
    };
  }
}

module.exports = { SqliteReferralRepository };
