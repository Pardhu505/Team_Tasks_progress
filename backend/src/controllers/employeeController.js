import Employee from '../models/Employee.js';
import Task from '../models/Task.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// GET /api/employees
export const getEmployees = asyncHandler(async (req, res) => {
  const { search, department } = req.query;
  const filter = {};
  if (department) filter.department = department;
  if (search) filter.employeeName = { $regex: search, $options: 'i' };
  const employees = await Employee.find(filter).sort({ employeeName: 1 });
  res.json(employees);
});

// POST /api/employees
export const createEmployee = asyncHandler(async (req, res) => {
  const { employeeName, department } = req.body;
  if (!employeeName || !department) {
    res.status(400);
    throw new Error('Employee name and department are required');
  }
  const employee = await Employee.create({ employeeName, department });
  res.status(201).json(employee);
});

// PUT /api/employees/:id
export const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }
  // Keep denormalized task data in sync.
  await Task.updateMany(
    { employeeId: employee._id },
    { employeeName: employee.employeeName, department: employee.department }
  );
  res.json(employee);
});

// DELETE /api/employees/:id
export const deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findByIdAndDelete(req.params.id);
  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }
  await Task.deleteMany({ employeeId: employee._id });
  res.json({ message: 'Employee and related tasks removed' });
});
