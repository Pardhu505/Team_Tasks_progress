import { Router } from 'express';
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../controllers/employeeController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.route('/').get(getEmployees).post(authorize('Admin', 'Manager'), createEmployee);
router
  .route('/:id')
  .put(authorize('Admin', 'Manager'), updateEmployee)
  .delete(authorize('Admin'), deleteEmployee);

export default router;
