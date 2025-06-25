'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PricingPlans from '@/components/PricingPlans';
import { getCurrentUser } from '@/lib/user';

// Функция для получения или создания session ID
const getOrCreateSessionId = () => {
  if (typeof window === 'undefined') return null;
  
  let sessionId = localStorage.getItem('gifty_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('gifty_session_id', sessionId);
  }
  return sessionId;
};

export default function PricingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Проверяем авторизацию пользователя
    const sessionId = getOrCreateSessionId();
    const registeredUser = getCurrentUser();
    const authToken = localStorage.getItem('auth_token');
    
    // Пользователь считается авторизованным если есть session ID или auth token
    const authenticated = !!(sessionId || authToken);
    setIsAuthenticated(authenticated);
    
    if (authenticated) {
      setUserName(registeredUser?.name || 'Пользователь');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%), 
                           radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%)`
        }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <Link href="/" className="text-2xl font-bold text-white">
                GIFTY
              </Link>
              <span className="text-sm text-gray-400 hidden sm:block">тарифы</span>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-gray-300 hidden sm:block">
                    Привет, {userName}!
                  </span>
                  <Link
                    href="/dashboard"
                    className="text-gray-300 hover:text-white font-medium transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Назад к дашборду</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-300 hover:text-white font-medium transition-colors"
                  >
                    Вход
                  </Link>
                  <Link
                    href="/register"
                    className="bg-gradient-to-r from-orange-400 to-pink-400 text-white px-4 py-2 rounded-lg hover:from-orange-500 hover:to-pink-500 transition-all shadow-lg"
                  >
                    Регистрация
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 py-12 flex-1">
        <PricingPlans />
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2025 Gifty. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 