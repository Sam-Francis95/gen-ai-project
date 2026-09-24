const { ValidationError } = require('../../domain/errors');
const {
  ReferralStatus,
  isValidPriority,
} = require('../../domain/referralStatus');

function makeCreateReferral({ patientRepo, referralRepo, referralEventRepo, now }) {
  return async function createReferral(input) {
    const patientName = input.patientName?.trim();
    const phone = input.phone?.trim();
    const department = input.department?.trim();
    const doctor = input.doctor ? input.doctor.trim() : null;
    const specialist = input.specialist ? input.specialist.trim() : null;
    const notes = input.notes ? input.notes.trim() : null;
    const priority = (input.priority || 'normal').toLowerCase();

    if (!patientName || !phone || !department) {
      throw new ValidationError('patientName, phone, and department are required');
    }

    if (!isValidPriority(priority)) {
      throw new ValidationError('priority must be normal or urgent');
    }

    const timestamp = now();
    let patient = await patientRepo.findByPhone(phone);

    if (!patient) {
      patient = await patientRepo.create({
        name: patientName,
        phone,
        createdAt: timestamp,
      });
    }

    const referral = await referralRepo.create({
      patientId: patient.id,
      department,
      doctor,
      specialist,
      notes,
      priority,
      status: ReferralStatus.CREATED,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    await referralEventRepo.create({
      referralId: referral.id,
      status: ReferralStatus.CREATED,
      note: 'Referral created',
      createdAt: timestamp,
    });

    return referralRepo.findById(referral.id);
  };
}

module.exports = { makeCreateReferral };
