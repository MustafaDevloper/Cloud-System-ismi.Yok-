import User from '../models/User.js';

export const upgradePlan = async (req, res) => {
  const { plan } = req.body;
  const planLimits = {
    'FREE': 104857600,      // 100MB
    'PRO': 5368709120,      // 5GB
    'ENTERPRISE': 107374182400 // 100GB (Custom)
  };

  if (!planLimits[plan]) {
    return res.status(400).json({ message: 'Invalid plan' });
  }

  try {
    const user = await User.findById(req.user._id);
    user.plan = plan;
    user.storage.max = planLimits[plan];
    await user.save();
    
    res.json({ message: `Successfully upgraded to ${plan} plan`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
