import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users } from 'lucide-react';
import { Logo } from './Logo.jsx';

const NAV = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/employees', label: 'Employee Records', icon: Users },
];

export const Sidebar = ({ open, onClose }) => (
  <>
    {/* Mobile backdrop */}
    {open && (
      <div
        className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
        onClick={onClose}
      />
    )}
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-line bg-surface transition-transform duration-300 lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex h-16 items-center border-b border-line px-6">
        <Logo className="h-9" />
      </div>

      <nav className="space-y-1 p-4">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-faint">
          Workspace
        </p>
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? 'bg-signal/10 text-signal'
                  : 'text-muted hover:bg-surface-2 hover:text-ink'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`h-[18px] w-[18px] ${
                    isActive ? 'text-signal' : 'text-faint group-hover:text-ink'
                  }`}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="absolute inset-x-4 bottom-4 rounded-xl border border-line bg-surface-2 p-4">
        <p className="text-xs font-semibold text-ink">Need a hand?</p>
        <p className="mt-1 text-[11px] leading-relaxed text-muted">
          Filter the dashboard, then export to Excel or PDF from the report panel.
        </p>
      </div>
    </aside>
  </>
);
