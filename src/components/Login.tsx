import { useState, type FormEvent } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { WaveLogo } from './WaveLogo';
import { supabase } from '../lib/supabaseClient';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    // Simple client-side validation
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      alert('Logged in successfully!');
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during Google sign in.');
    }
  };

  return (
    <div className="min-h-svh w-full flex flex-col items-center justify-center bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#e0f7f6] via-[#f2fbf9] to-[#f8fafc] px-4 py-12">
      {/* Logo and Header Section */}
      <div className="flex flex-col items-center mb-8 text-center">
        <WaveLogo className="mb-3 animate-fade-in" size={56} />
        <h2 className="text-[#0F766E] font-bold text-sm tracking-wider uppercase">ABMS</h2>
        <p className="text-xs text-slate-500 font-medium mt-1">Aquaculture Management Portal</p>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-[420px] bg-white border border-[#E2E8F0] rounded-[16px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] p-6 md:p-8 animate-card-enter">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 text-left">
          Sign in to your account
        </h1>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded-r-md">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-5">
          {/* Email Field */}
          <div className="space-y-1.5 text-left">
            <label htmlFor="email" className="text-xs font-semibold text-slate-700 tracking-wide">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail size={18} />
              </div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="block w-full h-11 pl-10 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5 text-left">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-xs font-semibold text-slate-700 tracking-wide">
                Password
              </label>
              <a 
                href="#forgot-password" 
                className="text-xs font-semibold text-[#0F766E] hover:text-[#14B8A6] transition-colors"
              >
                Forgot Password?
              </a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full h-11 pl-10 pr-11 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-[#0F766E] hover:bg-[#0D645D] active:scale-[0.98] text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#0F766E]/10 hover:shadow-lg transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
            {!isLoading && <LogIn size={16} />}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E2E8F0]"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-slate-400 font-medium">Or continue with</span>
          </div>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full h-11 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] active:scale-[0.98] text-slate-700 font-semibold text-sm rounded-xl flex items-center justify-center gap-2 hover:shadow-sm transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continue with Google
        </button>
      </div>

      {/* Footer Request Access link */}
      <p className="mt-6 text-sm text-slate-500 font-medium">
        Don't have an account?{' '}
        <a 
          href="#request-access" 
          className="text-[#0F766E] hover:text-[#14B8A6] font-semibold transition-colors"
        >
          Request Access
        </a>
      </p>

      {/* General Terms Footer */}
      <div className="flex gap-4 mt-8 text-xs text-slate-400 font-medium">
        <a href="#privacy" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
        <span>•</span>
        <a href="#terms" className="hover:text-slate-600 transition-colors">Terms of Service</a>
        <span>•</span>
        <a href="#help" className="hover:text-slate-600 transition-colors">Help Center</a>
      </div>
    </div>
  );
};
