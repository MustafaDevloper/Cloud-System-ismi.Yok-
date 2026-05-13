import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  originalName: String,
  path: { type: String, required: true },
  size: { type: Number, required: true },
  mimetype: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isFolder: { type: Boolean, default: false },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'File', default: null },
  sharedWith: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    permission: { type: String, enum: ['read', 'write', 'admin'] }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('File', fileSchema);
