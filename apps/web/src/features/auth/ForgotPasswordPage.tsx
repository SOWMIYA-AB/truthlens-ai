import { FormEvent, useState } from 'react';
import { useAuth } from './AuthContext';
import { AuthFormShell } from './AuthFormShell';
import { validateEmail } from './validation';

export function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [devToken, setDevToken] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setMessage('');
    setDevToken(null);

    if (!validateEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const response = await forgotPassword(email);
      setMessage(response.message);
      setDevToken(response.resetToken ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset request failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthFormShell
      title="Forgot password"
      subtitle="Request a reset token for your account."
      footerText="Remembered it?"
      footerLink="/login"
      footerLinkText="Back to login"
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
        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {message && <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}
        {devToken && <p className="rounded-lg bg-blue-50 px-4 py-3 text-xs text-blue-800">Dev reset token: {devToken}</p>}
        <button
          className="w-full rounded-lg bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? 'Preparing reset...' : 'Send reset instructions'}
        </button>
      </form>
    </AuthFormShell>
  );
}

