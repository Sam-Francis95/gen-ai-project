function makeGetReferralStats({ referralRepo }) {
  return async function getReferralStats() {
    return referralRepo.getStats();
  };
}

module.exports = { makeGetReferralStats };
