import { STATUS_META } from '../utils/constants.js';

export const StatusChip = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META['Not Yet Started'];
  return (
    <span
      className="chip"
      style={{
        color: `rgb(${meta.color})`,
        backgroundColor: `rgb(${meta.color} / 0.12)`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: `rgb(${meta.color})` }}
      />
      {meta.label}
    </span>
  );
};

export const OverdueChip = () => (
  <span
    className="chip"
    style={{
      color: 'rgb(var(--bad))',
      backgroundColor: 'rgb(var(--bad) / 0.12)',
    }}
  >
    Overdue
  </span>
);
