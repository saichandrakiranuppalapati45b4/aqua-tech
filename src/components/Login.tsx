import { useState, type FormEvent } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { showAlert } from '../lib/modal';

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
      await showAlert('Logged in successfully!');
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
    <div className="min-h-svh w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#ECFDF5] via-[#F0FDFA] to-[#F8FAFC] px-5 py-12">
      {/* Logo and Header Section */}
      <div className="flex flex-col items-center mb-8 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0F766E] to-[#14B8A6] flex items-center justify-center shadow-xl shadow-[#0F766E]/20 mb-4">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M3 7 C 5.5 9, 7.5 5, 10 7 C 12.5 9, 14.5 5, 17 7 C 19.5 9, 20.5 6, 21 6.5" />
            <path d="M3 12 C 5.5 14, 7.5 10, 10 12 C 12.5 14, 14.5 10, 17 12 C 19.5 14, 20.5 11, 21 11.5" />
            <path d="M3 17 C 5.5 19, 7.5 15, 10 17 C 12.5 19, 14.5 15, 17 17 C 19.5 19, 20.5 16, 21 16.5" />
          </svg>
        </div>
        <h2 className="text-[#0F766E] font-extrabold text-sm tracking-wider uppercase">ABMS</h2>
        <p className="text-[11px] text-slate-400 font-semibold mt-1">Aquaculture Billing Management</p>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-[400px] bg-white border border-[#E2E8F0]/80 rounded-2xl shadow-xl shadow-slate-200/50 p-6 animate-card-enter">
        <h1 className="text-xl font-extrabold text-slate-800 mb-1 text-left">
          Welcome back
        </h1>
        <p className="text-[11px] text-slate-400 font-semibold mb-6 text-left">Sign in to continue to your workspace</p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-xl flex items-start gap-2">
            <span className="mt-0.5">⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-1.5 text-left">
            <label htmlFor="email" className="text-[11px] font-bold text-slate-500 tracking-wide">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300">
                <Mail size={16} />
              </div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="block w-full h-11 pl-10 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm placeholder-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5EEAD4] focus:border-transparent focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5 text-left">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-[11px] font-bold text-slate-500 tracking-wide">
                Password
              </label>
              <a 
                href="#forgot-password" 
                className="text-[10px] font-bold text-[#0F766E] hover:text-[#14B8A6] transition-colors"
              >
                Forgot Password?
              </a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300">
                <Lock size={16} />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full h-11 pl-10 pr-11 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm placeholder-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5EEAD4] focus:border-transparent focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-300 hover:text-slate-500 focus:outline-none cursor-pointer transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-gradient-to-r from-[#0F766E] to-[#0D9488] hover:from-[#115E59] hover:to-[#0F766E] active:scale-[0.98] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#0F766E]/15 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Signing In...
              </span>
            ) : (
              <>
                Sign In
                <ArrowRight size={16} strokeWidth={2.5} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#F1F5F9]"></div>
          </div>
          <div className="relative flex justify-center text-[10px]">
            <span className="bg-white px-3 text-slate-400 font-semibold uppercase tracking-wider">Or</span>
          </div>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full h-11 bg-white border border-[#E2E8F0] hover:bg-slate-50 active:scale-[0.98] text-slate-700 font-bold text-[12px] rounded-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer focus:outline-none"
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

      {/* Footer */}
      <p className="mt-6 text-[12px] text-slate-400 font-semibold">
        Don't have an account?{' '}
        <a 
          href="#request-access" 
          className="text-[#0F766E] hover:text-[#14B8A6] font-bold transition-colors"
        >
          Request Access
        </a>
      </p>

      <div className="flex gap-3 mt-6 text-[10px] text-slate-300 font-semibold">
        <a href="#privacy" className="hover:text-slate-500 transition-colors">Privacy</a>
        <span>·</span>
        <a href="#terms" className="hover:text-slate-500 transition-colors">Terms</a>
        <span>·</span>
        <a href="#help" className="hover:text-slate-500 transition-colors">Help</a>
      </div>
    </div>
  );
};
