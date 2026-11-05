'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Phone,
  Mail,
  MapPin,
  Search,
  User,
  Shield,
  FileText,
  Menu,
  X,
  Flame,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../lib/api';
import GoogleTranslate from './GoogleTranslate';

export default function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [breakingNews, setBreakingNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  // Fetch breaking news and active categories sorted by priority
  useEffect(() => {
    const fetchNavbarData = async () => {
      try {
        const [newsRes, catRes] = await Promise.allSettled([
          api.get('/news/breaking'),
          api.get('/categories'),
        ]);

        if (newsRes.status === 'fulfilled' && newsRes.value.data.success) {
          setBreakingNews(newsRes.value.data.news);
        }
        if (catRes.status === 'fulfilled' && catRes.value.data.success) {
          setCategories(catRes.value.data.categories || []);
        }
      } catch (err) {
        console.error('Navbar data fetch error:', err);
      }
    };

    fetchNavbarData();
  }, []);

  // Smart auto-hide header on scroll (slides up on scroll down, slides down on scroll up)
  useEffect(() => {
    let lastScrollY = typeof window !== 'undefined' ? window.scrollY : 0;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always visible near top of page
      if (currentScrollY <= 60) {
        setIsVisible(true);
        setIsScrolled(false);
        lastScrollY = currentScrollY;
        return;
      }

      setIsScrolled(true);

      // Keep visible if mobile drawer/menu is open
      if (mobileMenuOpen) {
        setIsVisible(true);
        lastScrollY = currentScrollY;
        return;
      }

      // Delta threshold to ignore minor jitter
      const delta = currentScrollY - lastScrollY;
      if (Math.abs(delta) < 8) {
        return;
      }

      if (delta > 0 && currentScrollY > 120) {
        // Scrolling DOWN -> Hide header
        setIsVisible(false);
      } else if (delta < 0) {
        // Scrolling UP -> Reveal header smoothly
        setIsVisible(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mobileMenuOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'reporter') return '/reporter';
    return '/member';
  };

  const todayDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  const defaultNavCategories = [
    { name: 'Seemanchal Special', slug: 'seemanchal-special' },
    { name: 'Bihar State', slug: 'bihar' },
    { name: 'National', slug: 'national' },
    { name: 'Politics', slug: 'politics' },
    { name: 'Crime', slug: 'crime' },
    { name: 'Education', slug: 'education' },
    { name: 'Sports', slug: 'sports' },
  ];

  const displayCategories = categories.length > 0 ? categories : defaultNavCategories;
  const visibleCategories = displayCategories.slice(0, 7);
  const overflowCategories = displayCategories.slice(7);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);

  return (
    <header
      className={`w-full bg-white border-b border-slate-200 sticky top-0 z-50 transition-transform duration-300 ease-in-out will-change-transform ${isVisible ? 'translate-y-0' : '-translate-y-full'
        } ${isScrolled ? 'shadow-md' : 'shadow-sm'}`}
    >
      {/* 1. Top Utility Info Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-amber-400 font-medium">{todayDate}</span>
            <span className="hidden md:inline text-slate-500">|</span>
            <span className="hidden md:flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-red-400" />
              F 65, Shaheen Bagh, Okhla, New Delhi-110025
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="tel:9871023184"
              className="hidden xl:flex items-center gap-1 hover:text-white transition-colors"
            >
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>+91 9871023184</span>
            </a>
            <span className="text-slate-600 hidden lg:inline">|</span>
            <a
              href="mailto:mail@seemanchalexpress.in"
              className="hidden lg:flex items-center gap-1 hover:text-white transition-colors"
            >
              <Mail className="w-3 h-3 text-sky-400" />
              <span>mail@seemanchalexpress.in</span>
            </a>

            {/* Google News Preference Link */}
            <span className="text-slate-600 hidden lg:inline">|</span>
            <a
              href="https://www.google.com/preferences/source?q=seemanchalexpress.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-amber-300 hover:text-white text-[11px] font-semibold border border-white/10 transition-colors"
              title="Google पर Seemanchal Express को प्राथमिकता दें"
            >
              <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google पर प्राथमिकता दें</span>
            </a>

            {/* Google Language Translation Feature */}
            <div className="ml-2 pl-2 border-l border-slate-700">
              <GoogleTranslate />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Brand Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-0 flex justify-between items-center gap-4">
        {/* Brand Logo - Full Fill, No Margin, No Padding, No Border, No Name */}
        <Link href="/" className="flex items-center p-0 m-0 shrink-0">
          <img
            src="/logo.jpeg"
            alt="Seemanchal Express"
            className="h-16 sm:h-18 md:h-18 w-auto object-contain block p-0 m-0 border-0 rounded-none shadow-none"
          />
        </Link>

        {/* Search bar & Action CTAs */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="search"
              name="q"
              autoComplete="off"
              placeholder="Search news & stories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-3.5 pr-9 py-1.5 text-sm bg-slate-100 hover:bg-slate-50 focus:bg-white border border-slate-300 rounded-full w-52 focus:w-64 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              type="submit"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-600"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Member / Reporter Apply CTAs */}
          {!isAuthenticated && (
            <div className="flex items-center gap-2">
              <Link
                href="/apply-member"
                className="text-xs font-semibold px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors flex items-center gap-1"
              >
                <User className="w-3.5 h-3.5 text-blue-600" />
                Join Member
              </Link>
              <Link
                href="/apply-reporter"
                className="text-xs font-semibold px-3 py-1.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-colors flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                Apply Reporter
              </Link>
            </div>
          )}

          {/* User Profile / Dashboard Button */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                href={getDashboardLink()}
                className="text-sm font-bold px-3.5 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-sm transition-all flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5" />
                {user.role === 'admin'
                  ? 'Admin Panel'
                  : user.role === 'reporter'
                    ? 'Reporter Panel'
                    : 'Member Panel'}
              </Link>
              <button
                onClick={logout}
                title="Logout"
                className="p-1.5 text-red-400 hover:text-red-600 rounded-full hover:bg-red-100"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs font-bold px-4 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white shadow-sm transition-all flex items-center gap-1"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-slate-700 hover:text-red-600"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* 3. Primary Navigation Bar */}
      <nav className="bg-red-700 text-white font-medium text-sm hidden lg:block shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
          <ul className="flex items-center flex-nowrap whitespace-nowrap gap-0.5 overflow-x-visible">
            <li>
              <Link
                href="/"
                className="px-3 py-2.5 inline-block hover:bg-red-800 transition-colors font-semibold"
              >
                Home
              </Link>
            </li>
            {visibleCategories.map((cat) => (
              <li key={cat._id || cat.slug}>
                <Link
                  href={`/category/${cat.slug}`}
                  className={`px-3 py-2.5 inline-block hover:bg-red-800 transition-colors ${cat.slug === 'seemanchal-special'
                    ? 'bg-red-800 font-bold text-amber-200'
                    : ''
                    }`}
                >
                  {cat.name}
                </Link>
              </li>
            ))}

            {/* "More ▾" Dropdown for extra categories & institutional links */}
            <li className="relative group">
              <button
                type="button"
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                className="px-3.5 py-2.5 inline-flex items-center gap-1 hover:bg-red-800 transition-colors font-bold text-amber-200"
              >
                <span>More</span>
                <ChevronDown className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-200" />
              </button>

              {/* Dropdown Menu (Hover on desktop or click) */}
              <div className={`absolute left-0 top-full ${moreDropdownOpen ? 'block' : 'hidden'} group-hover:block hover:block z-50 pt-1`}>
                <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 min-w-[210px] text-xs divide-y divide-slate-800 backdrop-blur-md">
                  {/* Overflow Categories */}
                  {overflowCategories.length > 0 && (
                    <div className="py-1">
                      <span className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        More Categories
                      </span>
                      {overflowCategories.map((cat) => (
                        <Link
                          key={cat._id || cat.slug}
                          href={`/category/${cat.slug}`}
                          onClick={() => setMoreDropdownOpen(false)}
                          className="px-3 py-1.5 text-slate-200 hover:text-white hover:bg-red-700/80 block transition-colors font-medium"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Institutional Pages */}
                  <div className="py-1">
                    <span className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Organization & Network
                    </span>
                    <Link
                      href="/team"
                      onClick={() => setMoreDropdownOpen(false)}
                      className="px-3 py-1.5 text-amber-300 hover:text-white hover:bg-red-700/80 flex items-center justify-between transition-colors font-bold"
                    >
                      <span>Executive Team</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">Core</span>
                    </Link>
                    <Link
                      href="/about"
                      onClick={() => setMoreDropdownOpen(false)}
                      className="px-3 py-1.5 text-slate-200 hover:text-white hover:bg-red-700/80 block transition-colors"
                    >
                      About Us
                    </Link>
                    <Link
                      href="/contact"
                      onClick={() => setMoreDropdownOpen(false)}
                      className="px-3 py-1.5 text-slate-200 hover:text-white hover:bg-red-700/80 block transition-colors"
                    >
                      Contact Us
                    </Link>
                    <Link
                      href="/complaint"
                      onClick={() => setMoreDropdownOpen(false)}
                      className="px-3 py-1.5 text-slate-200 hover:text-white hover:bg-red-700/80 block transition-colors"
                    >
                      Grievance Cell (शिकायत)
                    </Link>
                    <Link
                      href="/legal"
                      onClick={() => setMoreDropdownOpen(false)}
                      className="px-3 py-1.5 text-slate-200 hover:text-white hover:bg-red-700/80 block transition-colors"
                    >
                      Legal & Policies
                    </Link>
                  </div>
                </div>
              </div>
            </li>
          </ul>

          <div className="flex items-center text-xs gap-3">
            <Link
              href="/verify"
              className="px-2.5 py-1 rounded bg-red-900 hover:bg-black text-amber-300 font-medium transition-colors"
            >
              Verify Digital ID
            </Link>
          </div>
        </div>
      </nav>

      {/* 4. Breaking News Ticker (Live Scrolling Bar) */}
      <div className="bg-amber-400 border-b border-amber-500 text-slate-900 text-xs font-semibold flex items-center overflow-hidden">
        <div className="bg-red-600 text-white px-3 py-1.5 flex items-center gap-1.5 shrink-0 z-10 font-bold shadow-md uppercase tracking-wider">
          <Flame className="w-3.5 h-3.5 animate-pulse text-amber-300" />
          <span className='hidden md:block'>Breaking News</span>
        </div>
        <div className="overflow-hidden whitespace-nowrap w-full py-1.5">
          <div className="inline-block animate-ticker">
            {breakingNews.length > 0 ? (
              [...breakingNews, ...breakingNews].map((item, idx) => (
                <Link
                  key={idx}
                  href={`/news/${item.slug}`}
                  className="mx-6 hover:text-red-700 transition-colors inline-flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block"></span>
                  <span>{item.title}</span>
                </Link>
              ))
            ) : (
              <span className="mx-6 text-slate-800">
                Seemanchal Express — Voice of the People | Dedicated to fearless and credible journalism across India.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 text-white px-4 py-6 border-b border-slate-800">
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded text-white"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-slate-400">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="flex flex-col gap-2 font-medium text-sm">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-slate-800 hover:text-red-400 font-bold"
            >
              Home
            </Link>
            {displayCategories.map((cat) => (
              <Link
                key={cat._id || cat.slug}
                href={`/category/${cat.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 border-b border-slate-800 hover:text-red-400 ${cat.slug === 'seemanchal-special' ? 'text-amber-300 font-bold' : ''
                  }`}
              >
                {cat.name}
              </Link>
            ))}
            <Link
              href="/team"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-slate-800 text-amber-400 font-bold"
            >
              Executive Team
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-slate-800 hover:text-red-400"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-slate-800 hover:text-red-400"
            >
              Contact Us
            </Link>
            <Link
              href="/verify"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-slate-800 text-sky-400"
            >
              Verify Digital ID Card
            </Link>

            <div className="pt-4 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Link
                    href={getDashboardLink()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 bg-red-600 rounded text-white font-bold"
                  >
                    Dashboard ({user.role})
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-center py-2 bg-slate-800 rounded text-slate-300"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 bg-red-600 rounded text-white font-bold"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/apply-member"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 bg-blue-600 rounded text-white font-medium"
                  >
                    Join as Member
                  </Link>
                  <Link
                    href="/apply-reporter"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 bg-amber-600 rounded text-white font-medium"
                  >
                    Apply as Reporter
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
