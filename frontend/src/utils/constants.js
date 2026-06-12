export const DEPARTMENTS = ['Data', 'IT', 'HR', 'Finance', 'Operations', 'Marketing'];
export const TASK_STATUSES = ['Not Yet Started', 'WIP', 'Completed'];
export const ROLES = ['Admin', 'Manager', 'Employee'];

// Visual mapping for each status — used by chips, charts and cards.
export const STATUS_META = {
  Completed: { label: 'Completed', color: 'var(--good)', token: 'good' },
  WIP: { label: 'In Progress', color: 'var(--warn)', token: 'warn' },
  'Not Yet Started': { label: 'Not Started', color: 'var(--faint)', token: 'faint' },
};

export const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const toInputDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};

export const isOverdue = (task) =>
  task.taskStatus !== 'Completed' &&
  task.expectedCompletionDate &&
  new Date(task.expectedCompletionDate) < new Date();
