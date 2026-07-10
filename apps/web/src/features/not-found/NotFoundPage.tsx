import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-6 text-center text-ink">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-signal">404</p>
        <h1 className="mt-3 text-4xl font-bold">Page not found</h1>
        <p className="mt-3 text-slate-600">This route does not exist in the current milestone.</p>
        <Link className="mt-6 inline-block rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-white" to="/">
          Back to home
        </Link>
      </div>
    </main>
  );
}

