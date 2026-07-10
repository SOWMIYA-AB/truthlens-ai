import { FormEvent, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { AuthFormShell } from './AuthFormShell';
import { validatePassword, validateRequired } from './validation';

export function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token') ?? '');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setMessage('');

    const tokenError = validateRequired(token, 'Reset token');
    if (tokenError) {
      setError(tokenError);
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setMessage('Password reset successfully. You can log in with your new password.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthFormShell
      title="Reset password"
      subtitle="Set a new password using your reset token."
      footerText="Ready?"
      footerLink="/login"
      footerLinkText="Log in"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Reset token</span>
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-signal focus:ring-2 focus:ring-blue-100"
            value={token}
            onChange={(event) => setToken(event.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">New password</span>
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-signal focus:ring-2 focus:ring-blue-100"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            autoComplete="new-password"
          />
        </label>
        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {message && (
          <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message} <Link className="font-semibold underline" to="/login">Go to login.</Link>
          </p>
        )}
        <button
          className="w-full rounded-lg bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? 'Resetting password...' : 'Reset password'}
        </button>
      </form>
    </AuthFormShell>
  );
}

