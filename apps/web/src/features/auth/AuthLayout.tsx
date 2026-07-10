import { Activity } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <main className="grid min-h-screen bg-slate-50 text-ink lg:grid-cols-[0.95fr_1.05fr]">
      <section className="hidden bg-ink px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-white text-ink">
            <Activity size={22} aria-hidden="true" />
          </div>
          <div>
            <p className="text-lg font-semibold">TruthLens AI</p>
            <p className="text-sm text-slate-300">Authentication</p>
          </div>
        </Link>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-200">Secure by design</p>
          <h1 className="mt-4 max-w-xl text-5xl font-bold leading-tight">
            Account security before analysis workflows.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
            Milestone 2 establishes the identity layer TruthLens AI will rely on for future forensic,
            reporting, and administrative tools.
          </p>
        </div>
      </section>
      <section className="flex items-center justify-center px-6 py-12">
        <Outlet />
      </section>
    </main>
  );
}

