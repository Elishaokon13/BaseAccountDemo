'use client';

import { useAuth } from '../contexts/AuthContext';
import { SignInWithBaseButton } from '@base-org/account-ui/react';

export function Header() {
  const { user, isAuthenticated, signIn, signOut } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">Base Commerce</h1>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Auth Button */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-600">
                  {user?.address.slice(0, 6)}...{user?.address.slice(-4)}
                </div>
                <button
                  onClick={signOut}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <SignInWithBaseButton
                onClick={signIn}
                align="center"
                variant="solid"
                colorScheme="light"
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
