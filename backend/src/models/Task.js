import mongoose from 'mongoose';
import { DEPARTMENTS, TASK_STATUSES } from '../config/constants.js';

const taskSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    // Denormalized for cheap filtering / reporting without joins.
    employeeName: { type: String, required: true, trim: true },
    department: { type: String, enum: DEPARTMENTS, required: true },
    taskTitle: { type: String, required: true, trim: true },
    taskDescription: { type: String, default: '', trim: true },
    taskStatus: {
      type: String,
      enum: TASK_STATUSES,
      default: 'Not Yet Started',
    },
    taskDate: { type: Date, required: true },
    expectedCompletionDate: { type: Date, required: true },
  },
  { timestamps: true }
);

// Indexes that match the dashboard's common filter patterns.
taskSchema.index({ department: 1, taskStatus: 1 });
taskSchema.index({ employeeName: 1 });
taskSchema.index({ taskDate: 1 });

// Virtual: a task is overdue if not completed and its target date has passed.
taskSchema.virtual('isOverdue').get(function isOverdue() {
  return (
    this.taskStatus !== 'Completed' &&
    this.expectedCompletionDate &&
    this.expectedCompletionDate < new Date()
  );
});

taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

export default mongoose.model('Task', taskSchema);
