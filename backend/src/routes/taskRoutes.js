import { Router } from 'express';
import {
  getTasks,
  getTasksByEmployee,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.route('/').get(getTasks).post(authorize('Admin', 'Manager'), createTask);
router.get('/employee/:employeeId', getTasksByEmployee);
router
  .route('/:id')
  .put(authorize('Admin', 'Manager'), updateTask)
  .delete(authorize('Admin', 'Manager'), deleteTask);

export default router;
