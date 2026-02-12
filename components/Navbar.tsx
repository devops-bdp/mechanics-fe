'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { getUser, logout } from '@/lib/auth';
import { getEquivalentPosisi } from '@/lib/access-control';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const user = getUser();

  const isActive = (path: string) => pathname === path;

  const handleLogout = () => {
    logout();
  };

  if (!user) return null;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 min-w-0">
            <Link href="/dashboard" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
              <Image
                src="/1.png"
                alt="Batara Dharma Persada Property Logo"
                width={40}
                height={40}
                className="object-contain sm:w-12 sm:h-12"
              />
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-bold text-primary-600 leading-tight">
                  Mechanic Activity Report
                </span>
                <span className="text-[10px] sm:text-xs text-gray-500 leading-tight hidden sm:block">
                  Batara Dharma Persada Property
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex lg:items-center lg:space-x-2 xl:space-x-4">
            <Link
              href="/dashboard"
              className={`px-2 xl:px-3 py-2 rounded-md text-xs xl:text-sm font-medium transition-colors ${
                isActive('/dashboard')
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </Link>

            {(getEquivalentPosisi(user.posisi || '') === 'PLANNER' || user.role === 'ADMIN' || user.role === 'SUPERADMIN' || getEquivalentPosisi(user.posisi || '') === 'SUPERADMIN') ? (
              <>
                <Link
                  href="/planner/activities"
                  className={`px-2 xl:px-3 py-2 rounded-md text-xs xl:text-sm font-medium transition-colors ${
                    isActive('/planner/activities')
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Activities
                </Link>
                <Link
                  href="/planner/units"
                  className={`px-2 xl:px-3 py-2 rounded-md text-xs xl:text-sm font-medium transition-colors ${
                    isActive('/planner/units')
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Units
                </Link>
                <Link
                  href="/planner/reports"
                  className={`px-2 xl:px-3 py-2 rounded-md text-xs xl:text-sm font-medium transition-colors ${
                    isActive('/planner/reports') || pathname.startsWith('/planner/reports')
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Reports
                </Link>
                <Link
                  href="/planner/analytics"
                  className={`px-2 xl:px-3 py-2 rounded-md text-xs xl:text-sm font-medium transition-colors ${
                    isActive('/planner/analytics')
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Analytics
                </Link>
              </>
            ) : null}

            {getEquivalentPosisi(user.posisi || '') === 'GROUP_LEADER_MEKANIK' ? (
              <Link
                href="/group-leader/activities"
                className={`px-2 xl:px-3 py-2 rounded-md text-xs xl:text-sm font-medium transition-colors ${
                  isActive('/group-leader/activities')
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Activities
              </Link>
            ) : null}

            {(user.role === 'SUPERADMIN' || getEquivalentPosisi(user.posisi || '') === 'SUPERADMIN') && (
              <>
                <Link
                  href="/superadmin/users"
                  className={`px-2 xl:px-3 py-2 rounded-md text-xs xl:text-sm font-medium transition-colors ${
                    isActive('/superadmin/users')
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Users
                </Link>
                <Link
                  href="/superadmin/dashboard"
                  className={`px-2 xl:px-3 py-2 rounded-md text-xs xl:text-sm font-medium transition-colors ${
                    isActive('/superadmin/dashboard')
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="hidden xl:inline">Admin Dashboard</span>
                  <span className="xl:hidden">Admin</span>
                </Link>
              </>
            )}

            {getEquivalentPosisi(user.posisi || '') === 'MEKANIK' ? (
              <>
                <Link
                  href="/mechanics/activities/list"
                  className={`px-2 xl:px-3 py-2 rounded-md text-xs xl:text-sm font-medium transition-colors ${
                    isActive('/mechanics/activities/list')
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="hidden xl:inline">List Activities</span>
                  <span className="xl:hidden">List</span>
                </Link>
                <Link
                  href="/mechanics/activities"
                  className={`px-2 xl:px-3 py-2 rounded-md text-xs xl:text-sm font-medium transition-colors ${
                    isActive('/mechanics/activities')
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="hidden xl:inline">My Activities</span>
                  <span className="xl:hidden">My</span>
                </Link>
              </>
            ) : null}

            {/* Profile Picture & Profile Link */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Link
                href="/profile"
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || 'Profile'}
                    className="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-cover border-2 border-gray-300"
                  />
                ) : (
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                    <svg
                      className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
                <span className={`hidden lg:inline ${
                  isActive('/profile')
                    ? 'text-primary-700'
                    : 'text-gray-700'
                }`}>
                  Profile
                </span>
              </Link>
            </div>

            <button
              onClick={handleLogout}
              className="px-2 xl:px-3 py-2 rounded-md text-xs xl:text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/dashboard"
              onClick={() => setIsMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/dashboard')
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </Link>

            {(getEquivalentPosisi(user.posisi || '') === 'PLANNER' || user.role === 'ADMIN' || user.role === 'SUPERADMIN' || getEquivalentPosisi(user.posisi || '') === 'SUPERADMIN') ? (
              <>
                <Link
                  href="/planner/activities"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/planner/activities')
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Activities
                </Link>
                <Link
                  href="/planner/units"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/planner/units')
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Units
                </Link>
                <Link
                  href="/planner/reports"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/planner/reports') || pathname.startsWith('/planner/reports')
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Reports
                </Link>
                <Link
                  href="/planner/analytics"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/planner/analytics')
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Analytics
                </Link>
              </>
            ) : null}

            {getEquivalentPosisi(user.posisi || '') === 'GROUP_LEADER_MEKANIK' ? (
              <Link
                href="/group-leader/activities"
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/group-leader/activities')
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Activities
              </Link>
            ) : null}

            {(user.role === 'SUPERADMIN' || getEquivalentPosisi(user.posisi || '') === 'SUPERADMIN') && (
              <>
                <Link
                  href="/superadmin/users"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/superadmin/users')
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Users
                </Link>
                <Link
                  href="/superadmin/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/superadmin/dashboard')
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Admin Dashboard
                </Link>
              </>
            )}

            {getEquivalentPosisi(user.posisi || '') === 'MEKANIK' ? (
              <>
                <Link
                  href="/mechanics/activities/list"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/mechanics/activities/list')
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  List Activities
                </Link>
                <Link
                  href="/mechanics/activities"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/mechanics/activities')
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  My Activities
                </Link>
              </>
            ) : null}

            <Link
              href="/profile"
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                isActive('/profile')
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || 'Profile'}
                  className="h-8 w-8 rounded-full object-cover border-2 border-gray-300"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              )}
              <span>Profile</span>
            </Link>

            <button
              onClick={() => {
                setIsMenuOpen(false);
                handleLogout();
              }}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

