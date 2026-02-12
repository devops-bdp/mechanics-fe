'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { setTokenAndUser } from '@/lib/auth';
import { showError, showSuccess, showLoading, closeSwal } from '@/lib/swal';

export default function LoginPage() {
  const router = useRouter();
  const [emailOrNrp, setEmailOrNrp] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const loadingSwal = showLoading('Signing in...');

    try {
      const response = await apiClient.login(emailOrNrp, password);
      
      if (response.success && response.data) {
        closeSwal();
        await showSuccess('Login successful!', 'Welcome!');
        // Store token in localStorage and decode it to extract user info
        setTokenAndUser(response.data.token, response.data.user);
        router.push('/dashboard');
      } else {
        closeSwal();
        await showError(response.message || 'Login failed');
      }
    } catch (err: any) {
      closeSwal();
      await showError(err.response?.data?.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Gears */}
        <div className="absolute top-20 left-10 w-24 h-24 opacity-20 animate-spin-slow">
          <svg viewBox="0 0 100 100" className="w-full h-full text-white">
            <path d="M50 10 L60 20 L70 20 L80 30 L70 40 L60 40 L50 50 L40 40 L30 40 L20 30 L30 20 L40 20 Z" fill="currentColor" />
            <circle cx="50" cy="30" r="8" fill="currentColor" />
            <circle cx="50" cy="70" r="8" fill="currentColor" />
            <circle cx="30" cy="50" r="8" fill="currentColor" />
            <circle cx="70" cy="50" r="8" fill="currentColor" />
          </svg>
        </div>
        <div className="absolute top-40 right-20 w-32 h-32 opacity-15 animate-spin-reverse">
          <svg viewBox="0 0 100 100" className="w-full h-full text-white">
            <path d="M50 10 L60 20 L70 20 L80 30 L70 40 L60 40 L50 50 L40 40 L30 40 L20 30 L30 20 L40 20 Z" fill="currentColor" />
            <circle cx="50" cy="30" r="8" fill="currentColor" />
            <circle cx="50" cy="70" r="8" fill="currentColor" />
            <circle cx="30" cy="50" r="8" fill="currentColor" />
            <circle cx="70" cy="50" r="8" fill="currentColor" />
          </svg>
        </div>
        <div className="absolute bottom-20 left-20 w-20 h-20 opacity-20 animate-spin-slow">
          <svg viewBox="0 0 100 100" className="w-full h-full text-white">
            <path d="M50 10 L60 20 L70 20 L80 30 L70 40 L60 40 L50 50 L40 40 L30 40 L20 30 L30 20 L40 20 Z" fill="currentColor" />
            <circle cx="50" cy="30" r="8" fill="currentColor" />
            <circle cx="50" cy="70" r="8" fill="currentColor" />
            <circle cx="30" cy="50" r="8" fill="currentColor" />
            <circle cx="70" cy="50" r="8" fill="currentColor" />
          </svg>
        </div>
        <div className="absolute bottom-40 right-10 w-28 h-28 opacity-15 animate-spin-reverse">
          <svg viewBox="0 0 100 100" className="w-full h-full text-white">
            <path d="M50 10 L60 20 L70 20 L80 30 L70 40 L60 40 L50 50 L40 40 L30 40 L20 30 L30 20 L40 20 Z" fill="currentColor" />
            <circle cx="50" cy="30" r="8" fill="currentColor" />
            <circle cx="50" cy="70" r="8" fill="currentColor" />
            <circle cx="30" cy="50" r="8" fill="currentColor" />
            <circle cx="70" cy="50" r="8" fill="currentColor" />
          </svg>
        </div>

        {/* Floating Tools */}
        <div className="absolute top-1/4 left-1/4 w-16 h-16 opacity-10 animate-float">
          <svg viewBox="0 0 100 100" className="w-full h-full text-white">
            <path d="M30 20 L70 20 L80 30 L80 70 L70 80 L30 80 L20 70 L20 30 Z" fill="currentColor" />
            <rect x="45" y="35" width="10" height="30" fill="currentColor" />
          </svg>
        </div>
        <div className="absolute top-1/3 right-1/4 w-14 h-14 opacity-10 animate-float-delayed">
          <svg viewBox="0 0 100 100" className="w-full h-full text-white">
            <circle cx="50" cy="30" r="15" fill="currentColor" />
            <rect x="45" y="30" width="10" height="50" fill="currentColor" />
            <path d="M40 80 L60 80 L55 90 L45 90 Z" fill="currentColor" />
          </svg>
        </div>
        <div className="absolute bottom-1/4 left-1/3 w-12 h-12 opacity-10 animate-float">
          <svg viewBox="0 0 100 100" className="w-full h-full text-white">
            <path d="M20 50 L50 20 L80 50 L50 80 Z" fill="currentColor" />
            <circle cx="50" cy="50" r="8" fill="currentColor" />
          </svg>
        </div>

        {/* Animated Particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Login Form Card */}
      <div className="max-w-md w-full space-y-8 bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/20 relative z-10 animate-fade-in">
        <div className="flex flex-col items-center">
          <div className="mb-6 flex items-center justify-center animate-bounce-in">
            <img 
              src="/1.png" 
              alt="Batara Dharma Persada Property Logo" 
              className="h-32 sm:h-40 w-auto object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duration-300"
            />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 animate-slide-down">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 animate-slide-down-delayed">
            Mechanics Activity Report System
          </p>
        </div>
        
        <form className="mt-8 space-y-6 animate-fade-in-delayed" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div className="animate-slide-up">
              <label htmlFor="emailOrNrp" className="block text-sm font-medium text-gray-700 mb-1">
                Email atau NRP
              </label>
              <input
                id="emailOrNrp"
                name="emailOrNrp"
                type="text"
                autoComplete="username"
                required
                value={emailOrNrp}
                onChange={(e) => setEmailOrNrp(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all duration-200 hover:border-primary-300"
                placeholder="Masukkan email atau NRP"
              />
            </div>
            
            <div className="animate-slide-up-delayed">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all duration-200 hover:border-primary-300"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div className="animate-slide-up-delayed-2">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign in
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

