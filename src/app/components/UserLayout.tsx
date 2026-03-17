import { Outlet, Link } from 'react-router';

export default function UserLayout() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      <header className="sticky top-0 z-10 bg-white border-b border-[var(--color-border)] px-4 py-3 shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-lg font-bold text-[var(--color-primary)]">
            낙골당
          </Link>
          <nav className="text-sm text-gray-600">
            <Link to="/facilities" className="hover:text-[var(--color-primary)]">
              시설 보기
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
