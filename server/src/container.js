const { SqlitePatientRepository } = require('./infrastructure/repositories/sqlitePatientRepository');
const { SqliteReferralRepository } = require('./infrastructure/repositories/sqliteReferralRepository');
const { SqliteReferralEventRepository } = require('./infrastructure/repositories/sqliteReferralEventRepository');

const { makeCreateReferral } = require('./application/usecases/createReferral');
const { makeUpdateReferralStatus } = require('./application/usecases/updateReferralStatus');
const { makeGetReferralById } = require('./application/usecases/getReferralById');
const { makeListReferrals } = require('./application/usecases/listReferrals');
const { makeGetReferralStats } = require('./application/usecases/getReferralStats');

const { buildReferralController } = require('./interfaces/http/controllers/referralController');

function buildContainer({ db }) {
  const patientRepo = new SqlitePatientRepository(db);
  const referralRepo = new SqliteReferralRepository(db);
  const referralEventRepo = new SqliteReferralEventRepository(db);

  const now = () => new Date().toISOString();

  const createReferral = makeCreateReferral({
    patientRepo,
    referralRepo,
    referralEventRepo,
    now,
  });

  const updateReferralStatus = makeUpdateReferralStatus({
    referralRepo,
    referralEventRepo,
    now,
  });

  const getReferralById = makeGetReferralById({
    referralRepo,
    referralEventRepo,
  });

  const listReferrals = makeListReferrals({ referralRepo });
  const getReferralStats = makeGetReferralStats({ referralRepo });

  const referralController = buildReferralController({
    createReferral,
    updateReferralStatus,
    getReferralById,
    listReferrals,
    getReferralStats,
  });

  return {
    referralController,
  };
}

module.exports = { buildContainer };
