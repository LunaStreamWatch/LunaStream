import React, { useState } from 'react';
import { Film, Lock, User, Eye, EyeOff } from 'lucide-react';
import { authService } from '../services/auth';
import GlobalNavbar from './GlobalNavbar';
import { useLanguage } from './LanguageContext';
import { translations } from '../data/i18n';

interface AdminLoginProps {
  onLogin: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { language } = useLanguage();
  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await authService.login({ username, password });
      
      if (result.success) {
        onLogin();
      } else {
        setError(result.message || t.admin_login_invalid_credentials || 'Invalid username or password');
      }
    } catch (error) {
      setError(t.admin_login_network_error || 'Network error. Please try again.');
    }

    setLoading(false);
  };

  return (
    // Main background consistent with HomePage
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
      <GlobalNavbar />

      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md w-full mx-4">
        {/* Logo and Title - styled to match HomePage */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Film className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {t.admin_login_title || 'LunaStream Admin'}
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
            {t.admin_login_subtitle || 'Access the analytics dashboard'}
          </p>
        </div>

        {/* Login Form Container - NOW styled to exactly match HomePage's 'Recently Viewed' section */}
        <div className="relative rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 bg-gradient-to-br from-white/30 to-white/10 dark:from-gray-800/30 dark:to-gray-800/10 backdrop-blur-lg transition-all duration-500 overflow-hidden">
            {/* Background overlay for subtle gradient effect */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400/10 via-purple-400/10 to-indigo-400/10 opacity-30 rounded-2xl"></div>
            </div>
            {/* Content Wrapper to ensure it's above the background overlay */}
            <div className="relative z-10 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Username Field */}
                    <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                        {t.admin_login_username_label || 'Username'}
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        </div>
                        <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors duration-300"
                        placeholder={t.admin_login_username_placeholder || 'Enter username'}
                        required
                        />
                    </div>
                    </div>

                    {/* Password Field */}
                    <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                        {t.admin_login_password_label || 'Password'}
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        </div>
                        <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors duration-300"
                        placeholder={t.admin_login_password_placeholder || 'Enter password'}
                        required
                        />
                        <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                        {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                        ) : (
                            <Eye className="h-5 w-5" />
                        )}
                        </button>
                    </div>
                    </div>

                    {/* Error Message - styled for consistency */}
                    {error && (
                    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-3 transition-colors duration-300">
                        <p className="text-red-600 dark:text-red-400 text-sm transition-colors duration-300">{error}</p>
                    </div>
                    )}

                    {/* Login Button - styled to match HomePage's gradient buttons */}
                    <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                    {loading ? (
                        <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        {t.admin_login_signing_in || 'Signing in...'}
                        </div>
                    ) : (
                        t.admin_login_sign_in || 'Sign In'
                    )}
                    </button>
                </form>

                {/* Security Notice - styled for consistency */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg transition-colors duration-300">
                    <h3 className="text-blue-800 dark:text-blue-300 font-semibold text-sm mb-2 transition-colors duration-300">
                        {t.admin_login_secure_access || 'Secure Access'}
                    </h3>
                    <p className="text-blue-600 dark:text-blue-400 text-sm transition-colors duration-300">
                        {t.admin_login_security_notice || 'This admin panel provides access to real-time analytics and user data. Please ensure you have proper authorization.'}
                    </p>
                </div>
            </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
