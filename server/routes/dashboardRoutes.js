import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  getFeaturedNews,
  getMaterials,
  getDashboardStats,
  getMaterialFilters
} from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/featured-news', authenticateToken, getFeaturedNews);
router.get('/materials', authenticateToken, getMaterials);
router.get('/stats', authenticateToken, getDashboardStats);
router.get('/material-filters', authenticateToken, getMaterialFilters);

export default router;
