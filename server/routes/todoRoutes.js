import express from 'express';
import { 
  getTodos, 
  createTodo, 
  updateTodo, 
  reorderTodos, 
  deleteTodo 
} from '../controllers/todoController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getTodos);
router.post('/', createTodo);
router.put('/:id', updateTodo);
router.put('/reorder', reorderTodos);
router.delete('/:id', deleteTodo);

export default router;
