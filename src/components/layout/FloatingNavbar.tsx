import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { isAuthenticated } from '../admin/AdminLogin';

export default function FloatingNavbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { to: '/', label: 'Inicio' },
    { to: '/inventario', label: 'Inventario' },
    ...(isAuthenticated() ? [{ to: '/admin', label: 'Admin' }] : []),
  ];

  const handleNavClick = () => {
    setMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? 'bg-deep/95 backdrop-blur-xl' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sport rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-sm">AS</span>
          </div>
          <span className="font-bold text-lg tracking-tight hidden sm:block">
            Auto<span className="text-sport">Select</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={handleNavClick}
              className={`font-semibold transition-colors ${
                l.to === '/admin'
                  ? 'text-sm text-white/30 hover:text-white/50'
                  : location.pathname === l.to
                    ? 'text-base text-sport'
                    : 'text-base text-white/70 hover:text-white'
              }`}>
              {l.label}
            </Link>
          ))}
        </div>

        <button className="md:hidden text-white p-2" onClick={() => setMenuOpen(!menuOpen)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-deep/98 border-t border-white/10">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={handleNavClick}
              className={`block px-4 py-3 font-semibold ${location.pathname === l.to ? 'text-base text-sport bg-sport/10' : l.to === '/admin' ? 'text-sm text-white/30' : 'text-base text-white/70'}`}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
