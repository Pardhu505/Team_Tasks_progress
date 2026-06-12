import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Task from '../models/Task.js';
import { DEFAULT_EMPLOYEES, TASK_STATUSES } from '../config/constants.js';

const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

const SAMPLE_TASK_TITLES = [
  ['API Development', 'Build the task management REST endpoints'],
  ['UI Dashboard', 'Implement KPI cards and analytics charts'],
  ['Database Schema', 'Design and index the Mongo collections'],
  ['Auth Module', 'JWT login and role-based access control'],
  ['Onboarding Docs', 'Write the new-hire onboarding handbook'],
  ['Quarterly Report', 'Compile Q2 progress for leadership review'],
  ['Bug Triage', 'Review and prioritize the open defect backlog'],
  ['Client Demo', 'Prepare and rehearse the customer walkthrough'],
];

const seed = async () => {
  await connectDB();

  console.log('… clearing existing data');
  await Promise.all([User.deleteMany({}), Employee.deleteMany({}), Task.deleteMany({})]);

  console.log('… creating users');
  await User.create([
    { name: 'Admin User', email: 'admin@taskflow.dev', password: 'admin123', role: 'Admin' },
    { name: 'Manager User', email: 'manager@taskflow.dev', password: 'manager123', role: 'Manager' },
    { name: 'Employee User', email: 'employee@taskflow.dev', password: 'employee123', role: 'Employee' },
  ]);

  console.log('… creating employees');
  const employees = await Employee.create(DEFAULT_EMPLOYEES);

  console.log('… creating sample tasks');
  const tasks = [];
  employees.forEach((emp, ei) => {
    for (let i = 0; i < 4; i += 1) {
      const [title, desc] = SAMPLE_TASK_TITLES[(ei * 2 + i) % SAMPLE_TASK_TITLES.length];
      const status = TASK_STATUSES[(ei + i) % TASK_STATUSES.length];
      // Mix of past and future target dates to generate overdue + trend data.
      const offset = (i - 1) * 9 - ei * 3;
      tasks.push({
        employeeId: emp._id,
        employeeName: emp.employeeName,
        department: emp.department,
        taskTitle: title,
        taskDescription: desc,
        taskStatus: status,
        taskDate: daysFromNow(offset - 5),
        expectedCompletionDate: daysFromNow(offset),
      });
    }
  });
  await Task.insertMany(tasks);

  console.log('\n✓ Seed complete');
  console.log('  Login accounts:');
  console.log('    Admin    -> admin@taskflow.dev / admin123');
  console.log('    Manager  -> manager@taskflow.dev / manager123');
  console.log('    Employee -> employee@taskflow.dev / employee123');

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
