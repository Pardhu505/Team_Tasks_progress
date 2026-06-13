import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Task from '../models/Task.js';
import { DEFAULT_EMPLOYEES } from '../config/constants.js';

const seed = async () => {
  await connectDB();

  console.log('… clearing existing data');
  await Promise.all([User.deleteMany({}), Employee.deleteMany({}), Task.deleteMany({})]);

  console.log('… creating users');
  const adminPassword = 'admin123';
  const employeePassword = 'employee123';

  await User.create([
    { name: 'Ankit', email: 'Ankit@showtimeconsulting.in', password: employeePassword, role: 'Employee' },
    { name: 'Hari Krishna', email: 'HariKrishna@showtimeconsulting.in', password: employeePassword, role: 'Employee' },
    { name: 'Vidya Kolati', email: 'Vidya@showtimeconsulting.in', password: employeePassword, role: 'Employee' },
    { name: 'Faisal', email: 'Faisal@showtimeconsulting.in', password: employeePassword, role: 'Employee' },
    { name: 'Pardhasaradhi', email: 'pardhasaradhi@showtimeconsulting.in', password: adminPassword, role: 'Admin' },
  ]);

  console.log('… creating employees');
  await Employee.create(DEFAULT_EMPLOYEES);

  console.log('\n✓ Seed complete (Prepared for Live Data)');
  console.log('  All mock tasks have been removed.');
  console.log('  Login accounts:');
  console.log('    Ankit          -> Ankit@showtimeconsulting.in / ' + employeePassword);
  console.log('    Hari Krishna   -> HariKrishna@showtimeconsulting.in / ' + employeePassword);
  console.log('    Vidya Kolati   -> Vidya@showtimeconsulting.in / ' + employeePassword);
  console.log('    Faisal         -> Faisal@showtimeconsulting.in / ' + employeePassword);
  console.log('    Pardhasaradhi  -> pardhasaradhi@showtimeconsulting.in / ' + adminPassword + ' (Admin)');

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
