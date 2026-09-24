const { ValidationError } = require('../../domain/errors');
const { isValidStatus, isValidPriority } = require('../../domain/referralStatus');

function makeListReferrals({ referralRepo }) {
  return async function listReferrals(query) {
    const status = query.status ? query.status.toUpperCase() : null;
    const priority = query.priority ? query.priority.toLowerCase() : null;
    const limit = query.limit ? Number(query.limit) : 25;
    const offset = query.offset ? Number(query.offset) : 0;

    if (status && !isValidStatus(status)) {
      throw new ValidationError('status filter is invalid');
    }

    if (priority && !isValidPriority(priority)) {
      throw new ValidationError('priority filter is invalid');
    }

    if (Number.isNaN(limit) || limit <= 0 || limit > 200) {
      throw new ValidationError('limit must be between 1 and 200');
    }

    if (Number.isNaN(offset) || offset < 0) {
      throw new ValidationError('offset must be 0 or greater');
    }

    return referralRepo.list({ status, priority, limit, offset });
  };
}

module.exports = { makeListReferrals };
