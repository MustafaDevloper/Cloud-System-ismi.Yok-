import express from 'express';
import multer from 'multer';
import { uploadFile, getFiles, deleteFile, shareFile } from '../controllers/fileController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.use(protect);

router.post('/upload', upload.single('file'), uploadFile);
router.get('/', getFiles);
router.delete('/:id', deleteFile);
router.post('/:id/share', shareFile);

export default router;
