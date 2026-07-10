import { FormEvent, useState } from 'react';
import { BadgeCheck, Shield } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { validateRequired } from '../auth/validation';

export function ProfilePage() {
  const { user, updateProfile, verifyEmail } = useAuth();
  const location = useLocation();
  const initialVerificationToken =
    (location.state as { verificationToken?: string | null } | null)?.verificationToken ?? '';
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [verificationToken, setVerificationToken] = useState(initialVerificationToken);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);

  async function handleProfileSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setMessage('');

    const nameError = validateRequired(fullName, 'Full name');
    if (nameError) {
      setError(nameError);
      return;
    }

    setSaving(true);
    try {
      await updateProfile(fullName);
      setMessage('Profile updated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Profile update failed.');
    } finally {
      setSaving(false);
    }
  }

  async function handleVerifySubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setMessage('');

    const tokenError = validateRequired(verificationToken, 'Verification token');
    if (tokenError) {
      setError(tokenError);
      return;
    }

    setVerifying(true);
    try {
      await verifyEmail(verificationToken);
      setVerificationToken('');
      setMessage('Email verified.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Email verification failed.');
    } finally {
      setVerifying(false);
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-signal">Protected Route</p>
        <h1 className="mt-2 text-4xl font-bold">User Profile</h1>
        <p className="mt-3 text-slate-600">Manage the account identity used across TruthLens AI.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <form className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft" onSubmit={handleProfileSubmit}>
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-slate-100 text-ink">
              <Shield size={22} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Account details</h2>
              <p className="text-sm text-slate-500">{user?.email}</p>
            </div>
          </div>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Full name</span>
            <input
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-signal focus:ring-2 focus:ring-blue-100"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </label>
          <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="font-semibold text-ink">Role</p>
              <p className="mt-1 capitalize">{user?.role}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="font-semibold text-ink">Email status</p>
              <p className="mt-1">{user?.emailVerified ? 'Verified' : 'Pending verification'}</p>
            </div>
          </div>
          {error && <p className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          {message && <p className="mt-5 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}
          <button
            className="mt-6 rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={saving}
            type="submit"
          >
            {saving ? 'Saving...' : 'Save profile'}
          </button>
        </form>

        <form className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft" onSubmit={handleVerifySubmit}>
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-50 text-verified">
              <BadgeCheck size={22} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Email verification</h2>
              <p className="text-sm text-slate-500">Use the development token returned by signup.</p>
            </div>
          </div>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Verification token</span>
            <input
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-signal focus:ring-2 focus:ring-blue-100"
              value={verificationToken}
              onChange={(event) => setVerificationToken(event.target.value)}
              disabled={user?.emailVerified}
            />
          </label>
          <button
            className="mt-6 rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={verifying || user?.emailVerified}
            type="submit"
          >
            {user?.emailVerified ? 'Already verified' : verifying ? 'Verifying...' : 'Verify email'}
          </button>
        </form>
      </div>
    </section>
  );
}
