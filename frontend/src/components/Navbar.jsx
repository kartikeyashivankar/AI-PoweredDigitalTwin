import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
  const [selectedRegion, setSelectedRegion] = useState('Global');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const regions = [
    'Global',
    'North America',
    'Europe',
    'Asia-Pacific',
    'Africa',
    'Latin America'
  ];

  const handleRegionSelect = (region) => {
    setSelectedRegion(region);
    setIsDropdownOpen(false);
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Forecast', path: '/forecast' },
    { label: 'What-if Simulator', path: '/what-if' },
    { label: 'About', path: '/about' }
  ];

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white px-6 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo & Name */}
        <Link
          to="/"
          className="flex items-center space-x-3 cursor-pointer select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-400 to-orange-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            {/* Globe icon using SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-slate-900">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 3.03v.568c0 .334.148.65.405.864l.406.34c.125.104.224.239.29.392l.04.093c.12.275.326.498.587.628l.404.202c.207.103.347.314.37.544l.024.244a.438.438 0 0 1-.22.407L14.75 8l-.26.13c-.263.13-.524.186-.787.168l-.247-.018a.89.89 0 0 0-.738.282L11.75 9.5l-.21.105a.438.438 0 0 0-.254.392v.353c0 .249-.2.45-.45.45-.072 0-.143-.018-.208-.051l-.224-.112a.98.98 0 0 0-.554-.111l-.279.03a.438.438 0 0 1-.407-.223l-.047-.094a.89.89 0 0 0-.54-.452l-.31-.103a.438.438 0 0 1-.293-.413v-.023c0-.22-.12-.421-.312-.522l-.219-.11a.438.438 0 0 1-.25-.392V8.5c0-.248-.202-.45-.45-.45h-.226a.438.438 0 0 1-.41-.297L5 7.5a.436.436 0 0 0-.398-.288c-.244-.01-.435-.205-.435-.45V6c0-.252-.204-.456-.456-.456L3.5 5.5A9.75 9.75 0 0 1 12.75 3.03ZM20.97 12.75a9.75 9.75 0 0 1-1.393 5.72c-.086.13-.252.172-.39.095l-.117-.066a.438.438 0 0 1-.16-.544l.13-.324a.89.89 0 0 0-.083-.794l-.243-.364a.438.438 0 0 1-.069-.234v-.35a.89.89 0 0 0-.263-.63l-.244-.244a.437.437 0 0 1-.128-.31v-.439c0-.248-.202-.45-.45-.45h-.166a.89.89 0 0 0-.793.488l-.121.242a.438.438 0 0 1-.391.242H16.5a.438.438 0 0 0-.438.438v.22a.89.89 0 0 1-.307.674l-.224.2a.438.438 0 0 0-.07.525l.163.272a.89.89 0 0 1 .08.882l-.135.27c-.07.14-.224.21-.373.165l-.41-.123a.438.438 0 0 0-.412.107l-.213.214a.89.89 0 0 1-.63.261h-.441a.438.438 0 0 0-.31.128l-.244.244a.89.89 0 0 1-.63.263h-.233a.438.438 0 0 0-.307.126l-.211.21a.89.89 0 0 1-.63.263h-.478a.438.438 0 0 0-.294.116l-.25.226a.438.438 0 0 1-.587-.015l-.234-.21a.89.89 0 0 0-.58-.22H8.75a.438.438 0 0 1-.41-.297l-.09-.27a.89.89 0 0 0-.845-.609h-.18a.438.438 0 0 1-.438-.438v-.233c0-.24-.197-.435-.437-.435h-.136a.89.89 0 0 0-.73.385l-.14.21a.438.438 0 0 1-.365.195H5.25a.438.438 0 0 0-.438.438v.172c0 .24-.197.435-.437.435H4.25a.438.438 0 0 1-.429-.356l-.101-.502a.89.89 0 0 0-.6-.689l-.232-.078a.438.438 0 0 1-.295-.412v-.24c0-.244-.202-.44-.445-.429a9.75 9.75 0 0 1 18.72-2.12Z" />
            </svg>
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
            Climate Digital Twin
          </span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
          {navLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.path}
              className={({ isActive }) =>
                `transition-colors duration-200 py-1 border-b-2 hover:text-white ${
                  isActive
                    ? 'text-white border-blue-500 font-semibold'
                    : 'border-transparent text-slate-400 hover:border-slate-700'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Region Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-all duration-200 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <span>{selectedRegion}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'transform rotate-180' : ''}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {isDropdownOpen && (
            <>
              {/* Overlay to close on clicking outside */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsDropdownOpen(false)}
              ></div>

              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-800 border border-slate-700 shadow-xl z-20 py-1 overflow-hidden font-medium text-sm">
                {regions.map((region) => (
                  <button
                    key={region}
                    onClick={() => handleRegionSelect(region)}
                    className={`w-full text-left px-4 py-2.5 transition-colors duration-150 ${
                      selectedRegion === region
                        ? 'bg-emerald-600 text-white font-semibold'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
