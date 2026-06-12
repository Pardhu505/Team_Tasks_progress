import Task from '../models/Task.js';
import Employee from '../models/Employee.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Build a Mongo filter object from query params shared by list endpoints.
const buildFilter = (q) => {
  const filter = {};
  if (q.department) filter.department = q.department;
  if (q.status) filter.taskStatus = q.status;
  if (q.search) {
    filter.$or = [
      { taskTitle: { $regex: q.search, $options: 'i' } },
      { taskDescription: { $regex: q.search, $options: 'i' } },
    ];
  }
  // employeeNames can be a comma list or repeated query param.
  if (q.employeeNames) {
    const names = Array.isArray(q.employeeNames)
      ? q.employeeNames
      : String(q.employeeNames).split(',').map((s) => s.trim()).filter(Boolean);
    if (names.length) filter.employeeName = { $in: names };
  }
  if (q.startDate || q.endDate) {
    filter.taskDate = {};
    if (q.startDate) filter.taskDate.$gte = new Date(q.startDate);
    if (q.endDate) {
      const end = new Date(q.endDate);
      end.setHours(23, 59, 59, 999);
      filter.taskDate.$lte = end;
    }
  }
  return filter;
};

// GET /api/tasks  (supports filtering, pagination, sorting)
export const getTasks = asyncHandler(async (req, res) => {
  const filter = buildFilter(req.query);
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 10);
  const sortField = req.query.sortBy || 'createdAt';
  const sortDir = req.query.order === 'asc' ? 1 : -1;

  const [items, total] = await Promise.all([
    Task.find(filter)
      .sort({ [sortField]: sortDir })
      .skip((page - 1) * limit)
      .limit(limit),
    Task.countDocuments(filter),
  ]);

  res.json({
    data: items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  });
});

// GET /api/tasks/employee/:employeeId
export const getTasksByEmployee = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ employeeId: req.params.employeeId }).sort({
    createdAt: -1,
  });
  res.json(tasks);
});

// Resolve the employee record so denormalized fields stay accurate.
const resolveEmployee = async ({ employeeId, employeeName }) => {
  let employee = null;
  if (employeeId) employee = await Employee.findById(employeeId);
  if (!employee && employeeName)
    employee = await Employee.findOne({ employeeName });
  return employee;
};

// POST /api/tasks  (accepts a single task or an array of tasks)
export const createTask = asyncHandler(async (req, res) => {
  const payload = Array.isArray(req.body) ? req.body : [req.body];
  const docs = [];

  for (const raw of payload) {
    const employee = await resolveEmployee(raw);
    if (!employee) {
      res.status(400);
      throw new Error(`Unknown employee: ${raw.employeeName || raw.employeeId}`);
    }
    if (!raw.taskTitle || !raw.taskDate || !raw.expectedCompletionDate) {
      res.status(400);
      throw new Error('taskTitle, taskDate and expectedCompletionDate are required');
    }
    docs.push({
      employeeId: employee._id,
      employeeName: employee.employeeName,
      department: employee.department,
      taskTitle: raw.taskTitle,
      taskDescription: raw.taskDescription || '',
      taskStatus: raw.taskStatus || 'Not Yet Started',
      taskDate: raw.taskDate,
      expectedCompletionDate: raw.expectedCompletionDate,
    });
  }

  const created = await Task.insertMany(docs);
  res.status(201).json(created);
});

// PUT /api/tasks/:id
export const updateTask = asyncHandler(async (req, res) => {
  const update = { ...req.body };
  // If the employee changes, refresh denormalized fields.
  if (req.body.employeeId || req.body.employeeName) {
    const employee = await resolveEmployee(req.body);
    if (employee) {
      update.employeeId = employee._id;
      update.employeeName = employee.employeeName;
      update.department = employee.department;
    }
  }
  const task = await Task.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }
  res.json(task);
});

// DELETE /api/tasks/:id
export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }
  res.json({ message: 'Task removed' });
});

export { buildFilter };
