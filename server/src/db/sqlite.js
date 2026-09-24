const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const { runMigrations } = require('./migrations');

function openDatabase(filePath) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(filePath, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(db);
    });
  });
}

function createDbHelpers(db) {
  const run = (sql, params = []) =>
    new Promise((resolve, reject) => {
      db.run(sql, params, function onRun(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ lastID: this.lastID, changes: this.changes });
      });
    });

  const get = (sql, params = []) =>
    new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row || null);
      });
    });

  const all = (sql, params = []) =>
    new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows || []);
      });
    });

  const exec = (sql) =>
    new Promise((resolve, reject) => {
      db.exec(sql, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });

  return { run, get, all, exec, raw: db };
}

async function initSqlite(dbFile) {
  const dir = path.dirname(dbFile);
  fs.mkdirSync(dir, { recursive: true });

  const db = await openDatabase(dbFile);
  const helpers = createDbHelpers(db);

  await helpers.exec('PRAGMA foreign_keys = ON;');
  await runMigrations(helpers);

  const close = () => {
    db.close();
  };

  return { db: helpers, close };
}

module.exports = { initSqlite };
