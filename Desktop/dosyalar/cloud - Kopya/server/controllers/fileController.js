import File from '../models/File.js';
import User from '../models/User.js';
import fs from 'fs';
import path from 'path';

export const uploadFile = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  try {
    const user = await User.findById(req.user._id);
    const fileSize = req.file.size;

    // Check storage quota
    if (user.storage.used + fileSize > user.storage.max) {
      // Remove the uploaded file from disk if quota exceeded
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Storage quota exceeded' });
    }

    const file = await File.create({
      name: req.body.name || req.file.originalname,
      originalName: req.file.originalname,
      path: req.file.path,
      size: fileSize,
      mimetype: req.file.mimetype,
      owner: user._id,
      parentId: req.body.parentId || null,
    });

    // Update user used storage
    user.storage.used += fileSize;
    await user.save();

    res.status(201).json(file);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFiles = async (req, res) => {
  try {
    const parentId = req.query.parentId || null;
    const files = await File.find({ owner: req.user._id, parentId }).sort({ createdAt: -1 });
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, owner: req.user._id });
    if (!file) return res.status(404).json({ message: 'File not found' });

    // Remove from disk
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Update user used storage
    const user = await User.findById(req.user._id);
    user.storage.used -= file.size;
    if (user.storage.used < 0) user.storage.used = 0;
    await user.save();

    await File.findByIdAndDelete(req.params.id);
    res.json({ message: 'File deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const shareFile = async (req, res) => {
  const { userId, permission } = req.body;
  try {
    const file = await File.findOne({ _id: req.params.id, owner: req.user._id });
    if (!file) return res.status(404).json({ message: 'File not found' });

    file.sharedWith.push({ user: userId, permission });
    await file.save();
    res.json({ message: 'File shared successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
