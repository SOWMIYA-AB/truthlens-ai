import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { AuthFormShell } from './AuthFormShell';
import { validateEmail, validatePassword, validateRequired } from './validation';

export function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');

    const nameError = validateRequired(fullName, 'Full name');
    if (nameError) {
      setError(nameError);
      return;
    }

    if (!validateEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);
    try {
      const token = await signup(fullName, email, password);
      navigate('/profile', { state: { verificationToken: token } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthFormShell
      title="Create account"
      subtitle="Start with a secure account before forensic analysis tools are enabled."
      footerText="Already have an account?"
      footerLink="/login"
      footerLinkText="Log in"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Full name</span>
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-signal focus:ring-2 focus:ring-blue-100"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            autoComplete="name"
          />
        </label>
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
            autoComplete="new-password"
          />
        </label>
        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <button
          className="w-full rounded-lg bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </AuthFormShell>
  );
}
