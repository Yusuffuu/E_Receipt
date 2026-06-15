import { Link } from 'react-router-dom';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-3">
          <Link to="/" className="text-2xl font-bold text-white">🏠 511 HOMES</Link>
          <div className="flex flex-wrap gap-3">
            <Link to="/" className="text-white hover:underline">Receipt Generator</Link>
            <Link to="/dashboard" className="text-white hover:underline">Landlord Dashboard</Link>
            <Link to="/tenant-form" className="text-white hover:underline">Tenant Form</Link>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="text-center text-white/70 text-sm py-4">
        © 2026 511 HOMES | All Rights Reserved
      </footer>
    </div>
  );
}
