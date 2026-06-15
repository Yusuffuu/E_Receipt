import { NavLink } from 'react-router-dom';

// Added subtle scale, active press down effects (active:scale-95), and transition curves
const navButtonClass = ({ isActive }) =>
  `group inline-flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300 ease-out active:scale-95 ${
    isActive 
      ? 'bg-none text-slate-900 shadow-xl shadow-white/10 scale-105' 
      : 'bg-transparent text-white/80 hover:bg-none hover:text-white hover:scale-105'
  }`;

export default function NavBar() {
  return (
    <nav className="sticky top-0 z-30 w-full border-b border-white/5 bg-slate-900/60 backdrop-blur-md shadow-md">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        
        {/* Left Nav Button */}
        <NavLink to="/" className={navButtonClass} title="Receipt Generator">
          {/* group-hover rules dynamically shift the png element */}
          <img 
            src="/arrow-left.png" 
            alt="Receipt Generator" 
            className="h-5 w-5 object-contain transition-transform duration-300 ease-out group-hover:-translate-x-0.5 group-active:scale-90" 
          />
        </NavLink>

        {/* Dynamic Center Branding */}
        <div className="relative group cursor-default select-none">
          <div className="text-sm font-bold uppercase tracking-wide text-white/90 transition-colors duration-300 group-hover:text-white drop-shadow-sm">
            511 HOMES
          </div>
          {/* Sleek expanding accent line beneath text on hover */}
          <span className="absolute -bottom-1 left-1/2 h-0.5 w-0 bg-linear-to-r from-blue-400 to-indigo-400 transition-all duration-300 ease-out group-hover:w-full group-hover:left-0 rounded-full" />
        </div>

        {/* Right Nav Button */}
        <NavLink to="/dashboard" className={navButtonClass} title="Landlord Dashboard">
          <img 
            src="/arrow-right.png" 
            alt="Landlord Dashboard" 
            className="h-5 w-5 object-contain transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-active:scale-90" 
          />
        </NavLink>

      </div>
    </nav>
  );
}