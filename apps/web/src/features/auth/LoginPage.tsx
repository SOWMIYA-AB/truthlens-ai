import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { AuthFormShell } from './AuthFormShell';
import { validateEmail, validateRequired } from './validation';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }

    const passwordError = validateRequired(password, 'Password');
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      const destination = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/profile';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthFormShell
      title="Log in"
      subtitle="Access your secure TruthLens AI workspace."
      footerText="New to TruthLens?"
      footerLink="/signup"
      footerLinkText="Create an account"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-signal focus:ring-2 focus:ring-blue-100"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            autoComplete="email"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-signal focus:ring-2 focus:ring-blue-100"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            autoComplete="current-password"
          />
        </label>
        <div className="text-right">
          <Link className="text-sm font-semibold text-signal hover:text-blue-700" to="/forgot-password">
            Forgot password?
          </Link>
        </div>
        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <button
          className="w-full rounded-lg bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? 'Signing in...' : 'Log in'}
        </button>
      </form>
    </AuthFormShell>
  );
}

