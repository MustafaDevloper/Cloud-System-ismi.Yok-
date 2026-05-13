import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import UAParser from 'ua-parser-js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password });
    
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      if (user.isBanned) return res.status(403).json({ message: 'Account is banned' });

      // Track Login History
      const parser = new UAParser(req.get('User-Agent'));
      const ua = parser.getResult();
      
      user.loginHistory.push({
        ip: req.ip || req.connection.remoteAddress,
        device: ua.device.model || 'Desktop',
        browser: ua.browser.name,
        os: ua.os.name,
      });
      
      // Limit history to last 10
      if (user.loginHistory.length > 10) user.loginHistory.shift();
      
      await user.save();

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        storage: user.storage,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  res.json(req.user);
};
