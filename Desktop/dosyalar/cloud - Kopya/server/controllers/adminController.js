import User from '../models/User.js';
import Log from '../models/Log.js';

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  const { userId, role } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.role = role;
    await user.save();
    res.json({ message: 'User role updated', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const banUser = async (req, res) => {
  const { userId, isBanned } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.isBanned = isBanned;
    await user.save();
    res.json({ message: isBanned ? 'User banned' : 'User unbanned' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLogs = async (req, res) => {
  try {
    const logs = await Log.find({}).sort({ timestamp: -1 }).limit(100).populate('userId', 'name email');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const totalStorage = await User.aggregate([
      { $group: { _id: null, total: { $sum: "$storage.used" } } }
    ]);
    
    // Simulate RAM/CPU usage for demo
    const stats = {
      users: userCount,
      totalStorage: totalStorage[0]?.total || 0,
      activeConnections: Math.floor(Math.random() * 50) + 10,
      systemHealth: {
        cpu: Math.floor(Math.random() * 30) + 5,
        ram: Math.floor(Math.random() * 4000) + 1000, // MB
      }
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
