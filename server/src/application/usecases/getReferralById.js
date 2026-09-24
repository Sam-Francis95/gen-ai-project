const { NotFoundError, ValidationError } = require('../../domain/errors');

function makeGetReferralById({ referralRepo, referralEventRepo }) {
  return async function getReferralById(referralId) {
    const id = Number(referralId);
    if (!id || Number.isNaN(id)) {
      throw new ValidationError('referralId must be a number');
    }

    const referral = await referralRepo.findById(id);
    if (!referral) {
      throw new NotFoundError('Referral not found');
    }

    const events = await referralEventRepo.listByReferralId(id);
    return { ...referral, events };
  };
}

module.exports = { makeGetReferralById };
