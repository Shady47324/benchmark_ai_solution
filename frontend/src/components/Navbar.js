import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const activeClass = 'text-orange-600 font-semibold border-b-2 border-orange-600';

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-black">
            <img src="/logo.png" alt="Logo" className="h-14 w-14 object-contain mt-3" />
            <span>DevSpark-AI Assistant</span>
          </Link>

          <div className="hidden md:flex space-x-8">
            <NavLink to="/" end className={({ isActive }) => isActive ? activeClass : 'text-gray-700 hover:text-orange-600 font-medium'}>
              Accueil
            </NavLink>
            <NavLink to="/History" className={({ isActive }) => isActive ? activeClass : 'text-gray-700 hover:text-orange-600 font-medium'}>
              Historique
            </NavLink>
            <a href="#about" className="text-gray-700 hover:text-orange-600 font-medium cursor-pointer">
              À propos
            </a>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-orange-600 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Ouvrir le menu</span>
              {isOpen ? (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white shadow-md" id="mobile-menu">
          <NavLink to="/" end onClick={() => setIsOpen(false)} className={({ isActive }) =>
            (isActive ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600') + ' block px-4 py-2'}>
            Accueil
          </NavLink>
          <NavLink to="/History" onClick={() => setIsOpen(false)} className={({ isActive }) =>
            (isActive ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600') + ' block px-4 py-2'}>
            Historique
          </NavLink>
          <a href="#about" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600">
            À propos
          </a>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
