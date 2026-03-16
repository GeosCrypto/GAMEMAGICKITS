'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      if (data.user) fetchCredits(data.user.id);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchCredits(session.user.id);
      else setCredits(null);
    });

    return () => listener.subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchCredits(userId: string) {
    const { data } = await supabase
      .from('user_profiles')
      .select('total_credits')
      .eq('user_id', userId)
      .single();
    if (data) setCredits(data.total_credits);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setDropdownOpen(false);
    router.push('/');
    router.refresh();
  }

  const navLinks = [
    { href: '/markets', label: 'Markets' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/faq', label: 'FAQ' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold"
          >
            <span className="text-2xl">🎮</span>
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              GameMagicKit
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-purple-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm hover:border-purple-500/50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-xs font-bold">
                    {user.email?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  {credits !== null && (
                    <span className="text-yellow-400 font-medium">
                      {credits.toLocaleString()} cr
                    </span>
                  )}
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-xl shadow-black/50 py-1">
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                      👤 Profile
                    </Link>
                    <hr className="border-gray-700 my-1" />
                    <button
                      onClick={signOut}
                      className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-gray-800 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/auth/sign-in"
                  className="text-sm font-medium text-gray-300 hover:text-white border border-gray-700 rounded-lg px-4 py-2 hover:border-purple-500/50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-2 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden p-2 text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-800 py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`text-sm font-medium px-2 py-1 ${
                  pathname === link.href ? 'text-purple-400' : 'text-gray-400'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-gray-800" />
            {user ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm text-gray-300 px-2 py-1"
                >
                  👤 Profile
                  {credits !== null && (
                    <span className="ml-2 text-yellow-400">{credits.toLocaleString()} cr</span>
                  )}
                </Link>
                <button
                  onClick={() => { signOut(); setMenuOpen(false); }}
                  className="text-sm text-red-400 px-2 py-1 text-left"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex gap-3 px-2">
                <Link href="/auth/sign-in" onClick={() => setMenuOpen(false)} className="text-sm border border-gray-700 rounded-lg px-4 py-2 text-gray-300">Sign In</Link>
                <Link href="/auth/sign-up" onClick={() => setMenuOpen(false)} className="text-sm bg-purple-600 rounded-lg px-4 py-2 text-white">Sign Up</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
