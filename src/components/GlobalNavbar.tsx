import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Film, Archive, Home, Search, Compass, Heart } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { languages, translations } from '../data/i18n';

import { useLanguage } from './LanguageContext';

const GlobalNavbar: React.FC = () => {
  const location = useLocation();
  const { language, setLanguage } = useLanguage();

  const t = translations[language] || translations.en;

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Define nav items with translated labels
  const navItems = [
    { path: '/', label: t.nav_home, icon: Home },
    { path: '/search', label: t.nav_search, icon: Search },
    { path: '/discover', label: t.nav_discover, icon: Compass },
    // { path: '/soon', label: t.home_coming_soon, icon: Calendar }, // optional
    { path: '/vault', label: t.nav_vault, icon: Archive },
  ];

  // Custom Language Selector component (inside same file)
  const LanguageSelectorCustom = () => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (ref.current && !ref.current.contains(event.target as Node)) {
          setOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (lang: string) => {
      setLanguage(lang);
      setOpen(false);
    };

    return (
      <div ref={ref} className="relative inline-block max-w-[100px]">
        <button
          onClick={() => setOpen(!open)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="inline-flex items-center justify-between w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-2xl text-gray-900 dark:text-gray-100 text-xl font-semibold cursor-pointer select-none
            hover:bg-gray-200 dark:hover:bg-gray-700 transition-shadow shadow-sm dark:shadow-none focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          {language.toUpperCase()}
          <svg
            className={`ml-2 h-5 w-5 text-gray-500 dark:text-gray-300 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <ul
            role="listbox"
            tabIndex={-1}
            className="absolute right-0 mt-2 w-full rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none
              text-gray-900 dark:text-gray-100 text-sm origin-top-right"
            style={{ transformOrigin: 'top right', transform: 'scale(0.9)', transition: 'transform 0.15s ease' }}
          >
            {languages.map(({ shortname }) => (
              <li
                key={shortname}
                role="option"
                aria-selected={language === shortname}
                onClick={() => handleSelect(shortname)}
                className={`cursor-pointer px-4 py-2 hover:bg-pink-500 hover:text-white ${
                  language === shortname ? 'bg-pink-500 text-white' : ''
                }`}
              >
                {shortname.toUpperCase()}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <nav className="bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-pink-200/50 dark:border-gray-600/30 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center h-16">
          <Link to="/" className="flex items-center space-x-2 group z-10">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-200">
              <Film className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              LunaStream
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 absolute left-1/2 transform -translate-x-1/2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-pink-600 dark:hover:text-pink-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center space-x-1 ml-auto z-10">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-pink-600 dark:hover:text-pink-400'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              );
            })}
          </div>

          {/* Right side controls: Donate, ThemeToggle, LanguageSelector */}
          <div className="flex items-center ml-auto space-x-3 z-10">
            <Link
              to="/donate"
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                isActive('/donate')
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                  : 'text-pink-600 dark:text-pink-400 border border-transparent border-[1.5px] border-gradient-to-r from-pink-500 to-purple-600 hover:bg-pink-50/40 dark:hover:bg-gray-800'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>{t.nav_donate}</span>
            </Link>

            <ThemeToggle />

            {/* Custom Language selector */}
            <LanguageSelectorCustom />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default GlobalNavbar;
