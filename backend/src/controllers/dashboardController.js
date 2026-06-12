import Task from '../models/Task.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { buildFilter } from './taskController.js';
import { TASK_STATUSES } from '../config/constants.js';

// GET /api/dashboard/summary  -> KPI cards + chart datasets
export const getSummary = asyncHandler(async (req, res) => {
  const filter = buildFilter(req.query);
  const now = new Date();

  const [
    total,
    byStatus,
    byEmployee,
    byDepartment,
    overdue,
    trend,
  ] = await Promise.all([
    Task.countDocuments(filter),

    // Status distribution (pie).
    Task.aggregate([
      { $match: filter },
      { $group: { _id: '$taskStatus', count: { $sum: 1 } } },
    ]),

    // Employee-wise task count (bar).
    Task.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$employeeName',
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$taskStatus', 'Completed'] }, 1, 0] },
          },
        },
      },
      { $sort: { total: -1 } },
    ]),

    // Department-wise progress (bar).
    Task.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$department',
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$taskStatus', 'Completed'] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    // Overdue: not completed AND past expected completion date.
    Task.countDocuments({
      ...filter,
      taskStatus: { $ne: 'Completed' },
      expectedCompletionDate: { $lt: now },
    }),

    // Completion trend by month (line).
    Task.aggregate([
      { $match: { ...filter, taskStatus: 'Completed' } },
      {
        $group: {
          _id: {
            y: { $year: '$expectedCompletionDate' },
            m: { $month: '$expectedCompletionDate' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.y': 1, '_id.m': 1 } },
    ]),
  ]);

  // Normalize status counts so every status is present even at zero.
  const statusMap = Object.fromEntries(byStatus.map((s) => [s._id, s.count]));
  const statusDistribution = TASK_STATUSES.map((status) => ({
    status,
    count: statusMap[status] || 0,
  }));

  const completed = statusMap['Completed'] || 0;
  const wip = statusMap['WIP'] || 0;
  const notStarted = statusMap['Not Yet Started'] || 0;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const completionTrend = trend.map((t) => ({
    label: `${months[t._id.m - 1]} ${t._id.y}`,
    completed: t.count,
  }));

  res.json({
    kpis: { total, completed, wip, notStarted, overdue },
    charts: {
      statusDistribution,
      employeeCounts: byEmployee.map((e) => ({
        employee: e._id,
        total: e.total,
        completed: e.completed,
      })),
      departmentProgress: byDepartment.map((d) => ({
        department: d._id,
        total: d.total,
        completed: d.completed,
      })),
      completionTrend,
    },
  });
});
