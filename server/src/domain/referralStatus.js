const ReferralStatus = {
  CREATED: 'CREATED',
  CONTACTED: 'CONTACTED',
  BOOKED: 'BOOKED',
  VISITED: 'VISITED',
  LOST: 'LOST',
};

const PRIORITIES = ['normal', 'urgent'];

const isValidStatus = (status) => Object.values(ReferralStatus).includes(status);

const isValidPriority = (priority) => PRIORITIES.includes(priority);

module.exports = {
  ReferralStatus,
  PRIORITIES,
  isValidStatus,
  isValidPriority,
};
