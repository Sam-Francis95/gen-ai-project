function buildReferralController({
  createReferral,
  updateReferralStatus,
  getReferralById,
  listReferrals,
  getReferralStats,
}) {
  return {
    createReferral: async (req, res) => {
      const referral = await createReferral({
        patientName: req.body.patientName,
        phone: req.body.phone,
        department: req.body.department,
        doctor: req.body.doctor,
        priority: req.body.priority,
      });

      res.status(201).json({ data: referral });
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
