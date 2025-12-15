"use client";
import { useState } from 'react';
import { FiSearch, FiBell, FiUser, FiChevronDown, FiMenu, FiSettings, FiHelpCircle, FiLogOut } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function Navbar({ onMenuClick }) {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleProfile = () => {
    router.push('/profile');
    setShowProfileDropdown(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // Implement search functionality here
    }
  };

  return (
    <div className="flex items-center justify-between h-20 px-6 border-b border-gray-200 bg-white shadow-sm">
      <div className="flex items-center flex-1">
        {/* Hamburger */}
        <div className="lg:hidden mr-4">
          <button className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors" onClick={onMenuClick}>
            <FiMenu className="h-6 w-6" />
          </button>
        </div>

        {/* Search Bar - Desktop */}
        {/* <div className="hidden lg:block relative w-full max-w-md">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search drivers, trips, or documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 hover:bg-white transition-colors placeholder-gray-500"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <kbd className="hidden sm:inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs text-gray-500 bg-white">
                ⌘K
              </kbd>
            </div>
          </form>
        </div> */}
      </div>

      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <button className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors relative">
            <FiBell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="hidden md:flex items-center space-x-2">
          <button className="p-2 text-gray-600 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors">
            <FiSettings className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-600 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors">
            <FiHelpCircle className="h-5 w-5" />
          </button>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="text-right hidden md:block">
              <div className="font-medium text-gray-900 text-sm">
                {user?.profile?.BankData?.name_at_bank ?? 'Guest User'}
              </div>
              <div className="text-xs text-gray-500">Administrator</div>
            </div>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm border-2 border-white">
              <FiUser className="h-5 w-5" />
            </div>
            <FiChevronDown className={`text-gray-400 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showProfileDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg z-50 border border-gray-200"
              >
                <div className="p-2">
                  {/* User Info */}
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.profile?.BankData?.name_at_bank ?? 'Guest User'}</p>
                    <p className="text-xs text-gray-500">admin@example.com</p>
                  </div>
                  
                  {/* Menu Items */}
                  <button 
                    onClick={handleProfile}
                    className="flex items-center w-full px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <FiUser className="mr-3 h-4 w-4 text-gray-400" />
                    My Profile
                  </button>
                  
                  <button className="flex items-center w-full px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <FiSettings className="mr-3 h-4 w-4 text-gray-400" />
                    Settings
                  </button>
                  
                  <button className="flex items-center w-full px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <FiHelpCircle className="mr-3 h-4 w-4 text-gray-400" />
                    Help & Support
                  </button>
                  
                  <div className="border-t border-gray-100 my-1"></div>
                  
                  <button
                    onClick={logout}
                    className="flex items-center w-full px-3 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FiLogOut className="mr-3 h-4 w-4" />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}