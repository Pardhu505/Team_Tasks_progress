import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ListChecks,
  CheckCircle2,
  Loader,
  CircleDashed,
  AlertOctagon,
  SlidersHorizontal,
  FileSpreadsheet,
  FileText,
  Printer,
  Search,
} from 'lucide-react';
import api from '../api/client.js';
import { DEPARTMENTS, formatDate, isOverdue } from '../utils/constants.js';
import { MultiSelect } from '../components/MultiSelect.jsx';
import { KpiCard } from '../components/KpiCard.jsx';
import { StatusChip, OverdueChip } from '../components/StatusChip.jsx';
import { EmptyState, CardSkeleton, TableSkeleton } from '../components/States.jsx';
import { StatusPie, EmployeeBar, DepartmentBar, TrendLine } from '../components/charts/Charts.jsx';
import { exportToExcel, exportToPDF, printReport } from '../utils/exporters.js';

const EMPLOYEE_NAMES = ['Ankit Kumar', 'Hari Krishna', 'Vidya', 'Faisal'];
const PAGE_SIZE = 8;

const Panel = ({ title, subtitle, children, action }) => (
  <div className="card p-5">
    <div className="mb-4 flex items-center justify-between">
      <div>
        <h3 className="font-display text-sm font-bold text-ink">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
    {children}
  </div>
);

export const Dashboard = () => {
  const [filters, setFilters] = useState({
    department: '',
    startDate: '',
    endDate: '',
    employeeNames: [],
    search: '',
  });
  const [summary, setSummary] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Build query params from active filters.
  const buildParams = useCallback(() => {
    const p = {};
    if (filters.department) p.department = filters.department;
    if (filters.startDate) p.startDate = filters.startDate;
    if (filters.endDate) p.endDate = filters.endDate;
    if (filters.employeeNames.length) p.employeeNames = filters.employeeNames.join(',');
    if (filters.search) p.search = filters.search;
    return p;
  }, [filters]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = buildParams();
      const [sumRes, taskRes] = await Promise.all([
        api.get('/dashboard/summary', { params }),
        api.get('/tasks', { params: { ...params, limit: 500 } }),
      ]);
      setSummary(sumRes.data);
      setTasks(taskRes.data.data);
      setPage(1);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  // Initial load only — subsequent loads via "Get Data".
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const kpis = summary?.kpis;
  const charts = summary?.charts;

  const pageCount = Math.max(1, Math.ceil(tasks.length / PAGE_SIZE));
  const pageTasks = tasks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const KPI_CARDS = [
    { label: 'Total Tasks', value: kpis?.total ?? 0, icon: ListChecks, token: 'signal' },
    { label: 'Completed', value: kpis?.completed ?? 0, icon: CheckCircle2, token: 'good' },
    { label: 'In Progress', value: kpis?.wip ?? 0, icon: Loader, token: 'warn' },
    { label: 'Not Started', value: kpis?.notStarted ?? 0, icon: CircleDashed, token: 'faint' },
    { label: 'Overdue', value: kpis?.overdue ?? 0, icon: AlertOctagon, token: 'bad' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          Filter the team's task data, then review progress and analytics.
        </p>
      </div>

      {/* Filters */}
      <div className="card p-5">
        <div className="mb-4 flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-signal" />
          <h2 className="font-display text-sm font-bold text-ink">Filters</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="label">Department</label>
            <select
              className="input"
              value={filters.department}
              onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value }))}
            >
              <option value="">All departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Start Date</label>
            <input
              type="date"
              className="input"
              value={filters.startDate}
              onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">End Date</label>
            <input
              type="date"
              className="input"
              value={filters.endDate}
              onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Employees</label>
            <MultiSelect
              options={EMPLOYEE_NAMES}
              value={filters.employeeNames}
              onChange={(v) => setFilters((f) => ({ ...f, employeeNames: v }))}
              placeholder="All employees"
            />
          </div>
          <div className="flex items-end">
            <button className="btn-primary w-full" onClick={fetchData} disabled={loading}>
              <Search className="h-4 w-4" />
              Get Data
            </button>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
          : KPI_CARDS.map((c, i) => <KpiCard key={c.label} {...c} index={i} />)}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Task Status Distribution" subtitle="Share of tasks by status">
          {loading ? (
            <div className="skeleton h-[260px] rounded-xl" />
          ) : (
            <StatusPie data={charts.statusDistribution} />
          )}
        </Panel>
        <Panel title="Employee Task Count" subtitle="Total vs completed per employee">
          {loading ? (
            <div className="skeleton h-[260px] rounded-xl" />
          ) : charts.employeeCounts.length ? (
            <EmployeeBar data={charts.employeeCounts} />
          ) : (
            <EmptyState title="No data" hint="Adjust filters and try again." />
          )}
        </Panel>
        <Panel title="Department Progress" subtitle="Completion across departments">
          {loading ? (
            <div className="skeleton h-[260px] rounded-xl" />
          ) : charts.departmentProgress.length ? (
            <DepartmentBar data={charts.departmentProgress} />
          ) : (
            <EmptyState title="No data" hint="Adjust filters and try again." />
          )}
        </Panel>
        <Panel title="Completion Trend" subtitle="Completed tasks over time">
          {loading ? (
            <div className="skeleton h-[260px] rounded-xl" />
          ) : charts.completionTrend.length ? (
            <TrendLine data={charts.completionTrend} />
          ) : (
            <EmptyState title="No trend yet" hint="Completed tasks will appear here." />
          )}
        </Panel>
      </div>

      {/* Report */}
      <motion.div
        className="card overflow-hidden"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5">
          <div>
            <h3 className="font-display text-sm font-bold text-ink">Task Report</h3>
            <p className="mt-0.5 text-xs text-muted">{tasks.length} matching tasks</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
              <input
                className="input w-48 pl-9"
                placeholder="Search title…"
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && fetchData()}
              />
            </div>
            <button className="btn-ghost" onClick={() => exportToExcel(tasks)} disabled={!tasks.length}>
              <FileSpreadsheet className="h-4 w-4" />
              <span className="hidden md:inline">Excel</span>
            </button>
            <button className="btn-ghost" onClick={() => exportToPDF(tasks)} disabled={!tasks.length}>
              <FileText className="h-4 w-4" />
              <span className="hidden md:inline">PDF</span>
            </button>
            <button className="btn-ghost" onClick={printReport} disabled={!tasks.length}>
              <Printer className="h-4 w-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <TableSkeleton />
        ) : tasks.length === 0 ? (
          <EmptyState title="No tasks found" hint="Try widening your filters, then click Get Data." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs uppercase tracking-wide text-faint">
                    <th className="px-5 py-3 font-semibold">Employee</th>
                    <th className="px-5 py-3 font-semibold">Task Title</th>
                    <th className="hidden px-5 py-3 font-semibold lg:table-cell">Description</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Expected</th>
                  </tr>
                </thead>
                <tbody>
                  {pageTasks.map((t) => (
                    <tr key={t._id} className="border-b border-line/60 transition hover:bg-surface-2">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-ink">{t.employeeName}</p>
                        <p className="text-xs text-faint">{t.department}</p>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-ink">{t.taskTitle}</td>
                      <td className="hidden max-w-xs px-5 py-3.5 text-muted lg:table-cell">
                        <span className="line-clamp-1">{t.taskDescription || '—'}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <StatusChip status={t.taskStatus} />
                          {isOverdue(t) && <OverdueChip />}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-muted">
                        {formatDate(t.expectedCompletionDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pageCount > 1 && (
              <div className="flex items-center justify-between border-t border-line px-5 py-3 text-sm">
                <p className="text-xs text-muted">
                  Page {page} of {pageCount}
                </p>
                <div className="flex gap-2">
                  <button
                    className="btn-ghost px-3 py-1.5 text-xs"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </button>
                  <button
                    className="btn-ghost px-3 py-1.5 text-xs"
                    onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                    disabled={page === pageCount}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};
