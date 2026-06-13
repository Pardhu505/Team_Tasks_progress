import { Router } from 'express';
import {
  getTasks,
  getTasksByEmployee,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.route('/').get(getTasks).post(createTask);
router.get('/employee/:employeeId', getTasksByEmployee);
router
  .route('/:id')
  .put(updateTask)
  .delete(deleteTask);

export default router;
