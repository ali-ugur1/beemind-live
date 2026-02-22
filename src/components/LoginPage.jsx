import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const { t, lang, changeLanguage } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError(lang === 'tr' ? 'Kullanıcı adı ve şifre gerekli' : 'Username and password required');
      return;
    }

    setIsLoading(true);
    // Simulate network delay
    await new Promise(r => setTimeout(r, 800));

    const result = login(username, password);
    if (!result.success) {
      setError(lang === 'tr' ? 'Kullanıcı adı veya şifre hatalı' : 'Invalid username or password');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 800 600">
          {[...Array(12)].map((_, i) => (
            <polygon
              key={i}
              points="50,0 93.3,25 93.3,75 50,100 6.7,75 6.7,25"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1"
              transform={`translate(${(i % 4) * 200 + (Math.floor(i / 4) % 2) * 100}, ${Math.floor(i / 4) * 180}) scale(1.5)`}
            />
          ))}
        </svg>
      </div>

      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-amber-600/5 rounded-full blur-[80px]" />

      {/* Language toggle */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => changeLanguage(lang === 'tr' ? 'en' : 'tr')}
          className="px-3 py-1.5 rounded-lg bg-gray-800/80 border border-gray-700/50 text-sm text-gray-300 hover:text-amber-400 hover:border-amber-500/30 transition-colors"
        >
          {lang === 'tr' ? '🇬🇧 EN' : '🇹🇷 TR'}
        </button>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl mb-4">
            <img
              src="/logo.png"
              alt="BeeMind"
              className="w-12 h-12 object-contain"
              style={{ filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.5))' }}
              onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<span class="text-4xl">🐝</span>'; }}
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-100 mb-1">BeeMind</h1>
          <p className="text-gray-500 text-sm">
            {lang === 'tr' ? 'Akıllı Kovan İzleme Sistemi' : 'Smart Hive Monitoring System'}
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-gray-900/80 border border-gray-800 rounded-2xl p-8 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-gray-100 mb-6 text-center">
            {lang === 'tr' ? 'Giriş Yap' : 'Sign In'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">
                {lang === 'tr' ? 'Kullanıcı Adı' : 'Username'}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={lang === 'tr' ? 'Kullanıcı adınızı girin' : 'Enter your username'}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-100 placeholder-gray-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-colors"
                  autoFocus
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">
                {lang === 'tr' ? 'Şifre' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={lang === 'tr' ? 'Şifrenizi girin' : 'Enter your password'}
                  className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-100 placeholder-gray-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-colors"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-black font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                <span>{lang === 'tr' ? 'Giriş yapılıyor...' : 'Signing in...'}</span>
              </>
            ) : (
              <span>{lang === 'tr' ? 'Giriş Yap' : 'Sign In'}</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs mt-6">
          &copy; {new Date().getFullYear()} BeeMind &mdash; {lang === 'tr' ? 'Tüm hakları saklıdır.' : 'All rights reserved.'}
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
