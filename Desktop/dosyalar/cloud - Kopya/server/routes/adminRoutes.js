import express from 'express';
import { getUsers, updateUserRole, banUser, getLogs, getStats } from '../controllers/adminController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'super_admin'));

router.get('/users', getUsers);
router.patch('/users/role', updateUserRole);
router.patch('/users/ban', banUser);
router.get('/logs', getLogs);
router.get('/stats', getStats);

export default router;
