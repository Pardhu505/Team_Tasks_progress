import { motion } from 'framer-motion';

export const KpiCard = ({ label, value, icon: Icon, token = 'signal', index = 0 }) => (
  <motion.div
    className="card relative overflow-hidden p-5"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
  >
    {/* Accent rail */}
    <span
      className="absolute inset-y-0 left-0 w-1"
      style={{ backgroundColor: `rgb(var(--${token}))` }}
    />
    <div className="flex items-start justify-between">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </p>
      <div
        className="grid h-9 w-9 place-items-center rounded-xl"
        style={{ backgroundColor: `rgb(var(--${token}) / 0.12)` }}
      >
        <Icon className="h-[18px] w-[18px]" style={{ color: `rgb(var(--${token}))` }} />
      </div>
    </div>
    <p className="mt-3 font-mono text-3xl font-bold tracking-tight text-ink">
      {value}
    </p>
  </motion.div>
);
