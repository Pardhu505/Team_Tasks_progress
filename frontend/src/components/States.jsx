import { Inbox } from 'lucide-react';

export const EmptyState = ({ icon: Icon = Inbox, title, hint }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="grid h-16 w-16 place-items-center rounded-2xl bg-surface-2 border border-line">
      <Icon className="h-7 w-7 text-faint" />
    </div>
    <h3 className="mt-4 font-display text-lg font-semibold text-ink">{title}</h3>
    {hint && <p className="mt-1 max-w-sm text-sm text-muted">{hint}</p>}
  </div>
);

export const TableSkeleton = ({ rows = 6 }) => (
  <div className="space-y-2.5 p-1">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="skeleton h-12 rounded-xl" />
    ))}
  </div>
);

export const CardSkeleton = () => (
  <div className="card p-5">
    <div className="skeleton h-3 w-24 rounded" />
    <div className="skeleton mt-4 h-9 w-16 rounded" />
  </div>
);
