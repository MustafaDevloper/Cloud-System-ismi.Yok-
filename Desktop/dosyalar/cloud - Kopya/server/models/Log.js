import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  ip: String,
  method: String,
  endpoint: String,
  status: Number,
  responseTime: Number,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', null: true },
  userAgent: String,
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Log', logSchema);
