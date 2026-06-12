import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Moon, Sun, LogOut } from 'lucide-react';
import { Sidebar } from './Sidebar.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();

  const initials = (user?.name || 'U')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-bg/80 px-4 backdrop-blur-xl sm:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-surface-2 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="grid h-9 w-9 place-items-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-ink"
              title="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-[18px] w-[18px]" />
              ) : (
                <Moon className="h-[18px] w-[18px]" />
              )}
            </button>

            <div className="ml-1 flex items-center gap-3 rounded-xl border border-line bg-surface px-2 py-1.5">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-signal/15 text-xs font-bold text-signal">
                {initials}
              </div>
              <div className="hidden pr-1 sm:block">
                <p className="text-xs font-semibold leading-none text-ink">
                  {user?.name}
                </p>
                <p className="mt-0.5 text-[11px] text-faint">{user?.role}</p>
              </div>
              <button
                onClick={logout}
                className="grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-bad/10 hover:text-bad"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
