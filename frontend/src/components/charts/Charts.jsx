import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// Resolve a CSS variable to an rgb() string for SVG fills.
const cssVar = (name) => {
  if (typeof window === 'undefined') return '#0d9488';
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v ? `rgb(${v})` : '#0d9488';
};

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2 shadow-card">
      {label && <p className="mb-1 text-xs font-semibold text-ink">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} className="text-xs text-muted">
          <span
            className="mr-1.5 inline-block h-2 w-2 rounded-full align-middle"
            style={{ backgroundColor: p.color || p.fill }}
          />
          {p.name}: <span className="font-semibold text-ink">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

const STATUS_COLORS = {
  Completed: () => cssVar('--good'),
  WIP: () => cssVar('--warn'),
  'Not Yet Started': () => cssVar('--faint'),
};

export const StatusPie = ({ data }) => {
  const rows = data.map((d) => ({ name: d.status, value: d.count }));
  const total = rows.reduce((a, b) => a + b.value, 0);
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={rows}
          dataKey="value"
          nameKey="name"
          innerRadius={62}
          outerRadius={92}
          paddingAngle={3}
          stroke="none"
        >
          {rows.map((r) => (
            <Cell key={r.name} fill={(STATUS_COLORS[r.name] || (() => cssVar('--signal')))()} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          wrapperStyle={{ fontSize: 12, color: cssVar('--muted') }}
        />
        <text
          x="50%"
          y="44%"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontSize: 28, fontWeight: 700, fill: cssVar('--ink') }}
        >
          {total}
        </text>
        <text
          x="50%"
          y="53%"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontSize: 11, fill: cssVar('--faint') }}
        >
          total tasks
        </text>
      </PieChart>
    </ResponsiveContainer>
  );
};

export const EmployeeBar = ({ data }) => (
  <ResponsiveContainer width="100%" height={260}>
    <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke={cssVar('--line')} vertical={false} />
      <XAxis dataKey="employee" tick={{ fontSize: 11, fill: cssVar('--muted') }} axisLine={false} tickLine={false} />
      <YAxis tick={{ fontSize: 11, fill: cssVar('--muted') }} axisLine={false} tickLine={false} allowDecimals={false} />
      <Tooltip content={<ChartTooltip />} cursor={{ fill: cssVar('--surface-2') }} />
      <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
      <Bar dataKey="total" name="Total" fill={cssVar('--info')} radius={[6, 6, 0, 0]} maxBarSize={28} />
      <Bar dataKey="completed" name="Completed" fill={cssVar('--good')} radius={[6, 6, 0, 0]} maxBarSize={28} />
    </BarChart>
  </ResponsiveContainer>
);

export const DepartmentBar = ({ data }) => (
  <ResponsiveContainer width="100%" height={260}>
    <BarChart layout="vertical" data={data} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke={cssVar('--line')} horizontal={false} />
      <XAxis type="number" tick={{ fontSize: 11, fill: cssVar('--muted') }} axisLine={false} tickLine={false} allowDecimals={false} />
      <YAxis type="category" dataKey="department" tick={{ fontSize: 11, fill: cssVar('--muted') }} axisLine={false} tickLine={false} width={84} />
      <Tooltip content={<ChartTooltip />} cursor={{ fill: cssVar('--surface-2') }} />
      <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
      <Bar dataKey="total" name="Total" fill={cssVar('--signal')} radius={[0, 6, 6, 0]} maxBarSize={22} />
      <Bar dataKey="completed" name="Completed" fill={cssVar('--good')} radius={[0, 6, 6, 0]} maxBarSize={22} />
    </BarChart>
  </ResponsiveContainer>
);

export const TrendLine = ({ data }) => (
  <ResponsiveContainer width="100%" height={260}>
    <LineChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
      <defs>
        <linearGradient id="trendStroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={cssVar('--signal')} />
          <stop offset="100%" stopColor={cssVar('--info')} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke={cssVar('--line')} vertical={false} />
      <XAxis dataKey="label" tick={{ fontSize: 11, fill: cssVar('--muted') }} axisLine={false} tickLine={false} />
      <YAxis tick={{ fontSize: 11, fill: cssVar('--muted') }} axisLine={false} tickLine={false} allowDecimals={false} />
      <Tooltip content={<ChartTooltip />} />
      <Line
        type="monotone"
        dataKey="completed"
        name="Completed"
        stroke="url(#trendStroke)"
        strokeWidth={3}
        dot={{ r: 4, fill: cssVar('--signal'), strokeWidth: 0 }}
        activeDot={{ r: 6 }}
      />
    </LineChart>
  </ResponsiveContainer>
);
