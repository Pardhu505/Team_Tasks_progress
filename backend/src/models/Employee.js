import mongoose from 'mongoose';
import { DEPARTMENTS, DEFAULT_DEPARTMENT } from '../config/constants.js';

const employeeSchema = new mongoose.Schema(
  {
    employeeName: { type: String, required: true, trim: true, unique: true },
    department: { type: String, enum: DEPARTMENTS, default: DEFAULT_DEPARTMENT },
  },
  { timestamps: true }
);

export default mongoose.model('Employee', employeeSchema);
