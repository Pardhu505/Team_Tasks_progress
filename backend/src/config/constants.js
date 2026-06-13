// Centralized domain constants shared across models, controllers and seed.
// "Data" is the default department for all employees.
export const DEFAULT_DEPARTMENT = 'Data';
export const DEPARTMENTS = ['Data', 'IT', 'HR', 'Finance', 'Operations', 'Marketing'];

export const TASK_STATUSES = ['Not Yet Started', 'WIP', 'Completed'];

export const ROLES = ['Admin', 'Manager', 'Employee'];

// Default employee roster from the specification — all in the Data department.
export const DEFAULT_EMPLOYEES = [
  { employeeName: 'Ankit', department: DEFAULT_DEPARTMENT },
  { employeeName: 'Hari Krishna', department: DEFAULT_DEPARTMENT },
  { employeeName: 'Vidya Kolati', department: DEFAULT_DEPARTMENT },
  { employeeName: 'Faisal', department: DEFAULT_DEPARTMENT },
  { employeeName: 'Pardhasaradhi', department: DEFAULT_DEPARTMENT },
];
