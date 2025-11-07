import express from 'express';
import { 
  getAssignments, 
  getAssignmentDetails,
  submitAssignment,
  markAsDone,
  addClassComment,
  addPrivateComment,
  getUploadUrl,
  uploadFile,
  upload
} from '../controllers/assignmentController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getAssignments);
router.get('/:id', getAssignmentDetails);
router.post('/submit', submitAssignment);
router.post('/mark-done', markAsDone);
router.post('/class-comment', addClassComment);
router.post('/private-comment', addPrivateComment);
router.post('/upload-url', getUploadUrl);
router.post('/upload', upload.single('file'), uploadFile);

export default router;
