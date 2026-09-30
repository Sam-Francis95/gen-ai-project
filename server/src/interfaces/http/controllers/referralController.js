function buildReferralController({
  createReferral,
  updateReferralStatus,
  getReferralById,
  listReferrals,
  getReferralStats,
  patientRepo,
  referralRepo,
}) {
  return {
    createReferral: async (req, res) => {
      const referral = await createReferral({
        patientName: req.body.patientName,
        phone: req.body.phone,
        department: req.body.department,
        doctor: req.body.doctor || req.body.specialist,
        specialist: req.body.specialist,
        notes: req.body.notes,
        priority: req.body.priority,
      });

      res.status(201).json({ data: referral });
    },

    updateDetails: async (req, res) => {
      const referral = await getReferralById(req.params.id);
      if (!referral) return res.status(404).json({ error: 'Referral not found' });

      const { patientName, phone, department, doctor, specialist, notes, priority, status } = req.body;

      if (referral.patient && (patientName || phone)) {
        await patientRepo.update(referral.patient.id, {
          name: patientName || referral.patient.name,
          phone: phone || referral.patient.phone
        });
      }

      await referralRepo.updateDetails(req.params.id, {
        department,
        doctor: doctor !== undefined ? doctor : specialist,
        specialist: specialist !== undefined ? specialist : doctor,
        notes,
        priority,
        status
      });

      const updated = await getReferralById(req.params.id);
      res.json({ data: updated, message: 'Referral updated successfully' });
    },

    updateStatus: async (req, res) => {
      const referral = await updateReferralStatus({
        referralId: req.params.id,
        status: String(req.body.status || '').toUpperCase(),
        note: req.body.note,
      });

      res.json({ data: referral });
    },

    getById: async (req, res) => {
      const referral = await getReferralById(req.params.id);
      res.json({ data: referral });
    },

    list: async (req, res) => {
      const referrals = await listReferrals(req.query);
      res.json({ data: referrals });
    },

    stats: async (req, res) => {
      const stats = await getReferralStats();
      res.json({ data: stats });
    },
  };
}

module.exports = { buildReferralController };
