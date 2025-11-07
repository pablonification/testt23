import express from 'express';
import {
  getSections,
  getCompletedNodes,
  getQuestions,
  completeNode
} from '../controllers/practiceController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/sections', authenticateToken, getSections);
router.get('/completed', authenticateToken, getCompletedNodes);
router.get('/questions/:sectionId/:nodeId', authenticateToken, getQuestions);
router.post('/complete', authenticateToken, completeNode);

export default router;
