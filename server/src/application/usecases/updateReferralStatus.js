const { NotFoundError, ValidationError } = require('../../domain/errors');
const { ReferralStatus, isValidStatus } = require('../../domain/referralStatus');

function makeUpdateReferralStatus({ referralRepo, referralEventRepo, now }) {
  return async function updateReferralStatus(input) {
    const referralId = Number(input.referralId);
    const status = input.status;
    const note = input.note ? input.note.trim() : null;

    if (!referralId || Number.isNaN(referralId)) {
      throw new ValidationError('referralId must be a number');
    }

    if (!isValidStatus(status)) {
      throw new ValidationError('status is invalid');
    }

    const existing = await referralRepo.findById(referralId);
    if (!existing) {
      throw new NotFoundError('Referral not found');
    }

    const timestamp = now();
    const updates = {
      status,
      updatedAt: timestamp,
    };

    if (status === ReferralStatus.CONTACTED) {
      updates.lastContactedAt = timestamp;
    }

    if (status === ReferralStatus.BOOKED) {
      updates.bookedAt = timestamp;
    }

    if (status === ReferralStatus.VISITED) {
      updates.visitedAt = timestamp;
    }

    await referralRepo.updateStatus(referralId, updates);

    await referralEventRepo.create({
      referralId,
      status,
      note: note || `Status updated to ${status}`,
      createdAt: timestamp,
    });

    return referralRepo.findById(referralId);
  };
}

module.exports = { makeUpdateReferralStatus };
