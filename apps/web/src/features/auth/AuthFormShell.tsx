import { Link } from 'react-router-dom';

interface AuthFormShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerText: string;
  footerLink: string;
  footerLinkText: string;
}

export function AuthFormShell({
  title,
  subtitle,
  children,
  footerText,
  footerLink,
  footerLinkText,
}: AuthFormShellProps) {
  return (
    <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-soft">
      <div>
        <h1 className="text-3xl font-bold text-ink">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
      </div>
      <div className="mt-8">{children}</div>
      <p className="mt-6 text-center text-sm text-slate-600">
        {footerText}{' '}
        <Link className="font-semibold text-signal hover:text-blue-700" to={footerLink}>
          {footerLinkText}
        </Link>
      </p>
    </div>
  );
}

