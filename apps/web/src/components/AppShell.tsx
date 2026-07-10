import { Activity, LogOut, Upload, UserRound } from 'lucide-react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';

export function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <main className="min-h-screen bg-slate-50 text-ink">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-white">
              <Activity size={22} aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-semibold">TruthLens AI</p>
              <p className="text-sm text-slate-500">Secure workspace</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/upload"
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <Upload size={16} aria-hidden="true" />
              Upload
            </Link>
            <Link
              to="/profile"
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <UserRound size={16} aria-hidden="true" />
              {user?.fullName}
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-white hover:bg-slate-700"
              aria-label="Log out"
            >
              <LogOut size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>
      <Outlet />
    </main>
  );
}
