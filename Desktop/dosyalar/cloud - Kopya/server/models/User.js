import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['user', 'admin', 'super_admin'], 
    default: 'user' 
  },
  plan: { 
    type: String, 
    enum: ['FREE', 'PRO', 'ENTERPRISE'], 
    default: 'FREE' 
  },
  storage: {
    used: { type: Number, default: 0 }, // in bytes
    max: { type: Number, default: 104857600 } // Default 100MB
  },
  loginHistory: [{
    ip: String,
    device: String,
    browser: String,
    os: String,
    timestamp: { type: Date, default: Date.now }
  }],
  isBanned: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
