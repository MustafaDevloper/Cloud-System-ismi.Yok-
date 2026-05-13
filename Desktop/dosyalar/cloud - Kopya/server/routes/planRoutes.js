import express from 'express';
import { upgradePlan } from '../controllers/planController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.post('/upgrade', protect, upgradePlan);

export default router;
