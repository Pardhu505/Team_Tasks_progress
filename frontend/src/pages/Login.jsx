import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Logo } from '../components/Logo.jsx';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}`);
      navigate('/');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-surface lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(40rem_30rem_at_30%_20%,rgb(var(--signal)/0.18),transparent_60%),radial-gradient(40rem_30rem_at_80%_90%,rgb(var(--info)/0.14),transparent_60%)]" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <Logo className="h-11" />
          </div>
          <div>
            <h1 className="font-display text-4xl font-extrabold leading-tight text-ink">
              Track every task.
              <br />
              See the whole team.
            </h1>
            <p className="mt-4 max-w-md text-muted">
              A command center for team task progress — live KPIs, status
              analytics, and per-employee reporting in one elegant workspace.
            </p>
          </div>
          <p className="text-xs text-faint">
            © {new Date().getFullYear()} TaskFlow · Team Task Progress Management
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-8 lg:hidden">
            <Logo className="h-10" />
          </div>
          <h2 className="font-display text-2xl font-bold text-ink">Sign in</h2>
          <p className="mt-1 text-sm text-muted">
            Use your credentials to access your account.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={busy}>
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              Sign in
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};
