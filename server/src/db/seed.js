const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const env = require('../config/env');
const { initSqlite } = require('./sqlite');

async function seed() {
  console.log('Connecting to database...', env.dbFile);
  const { db, close } = await initSqlite(env.dbFile);

  const existing = await db.get('SELECT COUNT(*) as count FROM referrals');
  if (existing.count > 0) {
    console.log('Database already contains data. Skipping seed.');
    close();
    return;
  }

  console.log('Seeding mock data...');

  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  // Helper to get dates offset by days
  const getDate = (offsetDays) => new Date(now.getTime() + offsetDays * dayMs).toISOString();

  // Patients
  const patients = [
    { name: 'Ravi Kumar', phone: '+919876543210' },
    { name: 'Priya Sharma', phone: '+919876543211' },
    { name: 'Arun', phone: '+919876543212' },
    { name: 'Anita Desai', phone: '+919876543213' },
    { name: 'Vikram Singh', phone: '+919876543214' }
  ];

  const patientIds = {};
  for (const p of patients) {
    const res = await db.run('INSERT INTO patients (name, phone, created_at) VALUES (?, ?, ?)', [
      p.name, p.phone, getDate(-10)
    ]);
    patientIds[p.name] = res.lastID;
  }

  // Referrals
  const mockReferrals = [
    {
      patientName: 'Ravi Kumar',
      department: 'Cardiology',
      doctor: 'Dr. Sen',
      priority: 'urgent',
      status: 'BOOKED',
      createdAt: getDate(-5),
      updatedAt: getDate(-1),
      lastContactedAt: getDate(-4),
      bookedAt: getDate(-1),
      visitedAt: null
    },
    {
      patientName: 'Priya Sharma',
      department: 'Neurology',
      doctor: null,
      priority: 'normal',
      status: 'CONTACTED',
      createdAt: getDate(-2),
      updatedAt: getDate(-1),
      lastContactedAt: getDate(-1),
      bookedAt: null,
      visitedAt: null
    },
    {
      patientName: 'Arun',
      department: 'Orthopedics',
      doctor: 'Dr. Gupta',
      priority: 'urgent',
      status: 'VISITED',
      createdAt: getDate(-15),
      updatedAt: getDate(-2),
      lastContactedAt: getDate(-14),
      bookedAt: getDate(-10),
      visitedAt: getDate(-2)
    },
    {
      patientName: 'Anita Desai',
      department: 'Cardiology',
      doctor: null,
      priority: 'normal',
      status: 'LOST',
      createdAt: getDate(-20),
      updatedAt: getDate(-5),
      lastContactedAt: getDate(-19),
      bookedAt: null,
      visitedAt: null
    },
    {
      patientName: 'Vikram Singh',
      department: 'Pediatrics',
      doctor: 'Dr. John',
      priority: 'normal',
      status: 'CREATED',
      createdAt: getDate(0),
      updatedAt: getDate(0),
      lastContactedAt: null,
      bookedAt: null,
      visitedAt: null
    },
    {
      patientName: 'Ravi Kumar', // Follow-up or second referral
      department: 'Orthopedics',
      doctor: null,
      priority: 'normal',
      status: 'CREATED',
      createdAt: getDate(0),
      updatedAt: getDate(0),
      lastContactedAt: null,
      bookedAt: null,
      visitedAt: null
    }
  ];

  for (const r of mockReferrals) {
    const patientId = patientIds[r.patientName];
    const res = await db.run(`
      INSERT INTO referrals 
      (patient_id, department, doctor, priority, status, created_at, updated_at, last_contacted_at, booked_at, visited_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      patientId, r.department, r.doctor, r.priority, r.status, 
      r.createdAt, r.updatedAt, r.lastContactedAt, r.bookedAt, r.visitedAt
    ]);

    const referralId = res.lastID;

    // Insert an initial event
    await db.run('INSERT INTO referral_events (referral_id, status, note, created_at) VALUES (?, ?, ?, ?)', [
      referralId, 'CREATED', 'Referral created via seed', r.createdAt
    ]);

    // Insert additional events based on status
    if (['CONTACTED', 'BOOKED', 'VISITED', 'LOST'].includes(r.status)) {
      await db.run('INSERT INTO referral_events (referral_id, status, note, created_at) VALUES (?, ?, ?, ?)', [
        referralId, 'CONTACTED', 'Patient contacted', r.lastContactedAt
      ]);
    }
    
    if (['BOOKED', 'VISITED'].includes(r.status)) {
      await db.run('INSERT INTO referral_events (referral_id, status, note, created_at) VALUES (?, ?, ?, ?)', [
        referralId, 'BOOKED', 'Patient booked appointment', r.bookedAt
      ]);
    }

    if (r.status === 'VISITED') {
      await db.run('INSERT INTO referral_events (referral_id, status, note, created_at) VALUES (?, ?, ?, ?)', [
        referralId, 'VISITED', 'Patient completed visit', r.visitedAt
      ]);
    }

    if (r.status === 'LOST') {
      await db.run('INSERT INTO referral_events (referral_id, status, note, created_at) VALUES (?, ?, ?, ?)', [
        referralId, 'LOST', 'Patient marked as lost after 15 days', r.updatedAt
      ]);
    }
  }

  console.log('Seeding completed successfully!');
  close();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
