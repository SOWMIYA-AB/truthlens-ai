import { Activity, FileSearch, Fingerprint, ShieldCheck, UploadCloud } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const capabilities = [
  {
    icon: FileSearch,
    title: 'Media forensics',
    description: 'Prepare images, videos, and documents for future authenticity analysis pipelines.',
  },
  {
    icon: ShieldCheck,
    title: 'Trust scoring',
    description: 'A clean foundation for risk scores, evidence summaries, and analyst-ready reports.',
  },
  {
    icon: Fingerprint,
    title: 'Evidence integrity',
    description: 'Designed for hashes, metadata, chain-of-custody records, and secure storage.',
  },
];

export function LandingPage() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-slate-50 text-ink">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-white">
              <Activity size={22} aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-semibold">TruthLens AI</p>
              <p className="text-sm text-slate-500">Digital Trust & Forensics Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Link className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700" to="/profile">
                Profile
              </Link>
            ) : (
              <>
                <Link className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100" to="/login">
                  Log in
                </Link>
                <Link className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700" to="/signup">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-signal">Milestone 2 Authentication</p>
          <h1 className="max-w-3xl text-5xl font-bold leading-tight text-ink md:text-6xl">
            A secure foundation for digital trust workflows.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            TruthLens AI now includes account registration, secure login, refresh-token sessions,
            protected routes, email verification, and password reset flows.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Security Status</p>
              <h2 className="text-2xl font-semibold">Auth system ready</h2>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-emerald-50 text-verified">
              <UploadCloud size={24} aria-hidden="true" />
            </div>
          </div>
          <div className="space-y-4">
            {capabilities.map((item) => (
              <div key={item.title} className="flex gap-4 rounded-lg border border-slate-200 p-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-ink">
                  <item.icon size={20} aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

