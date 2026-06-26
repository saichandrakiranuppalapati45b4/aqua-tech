import { useState, useEffect, type FormEvent } from 'react';
import { Lock, Eye, EyeOff, User, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { showAlert } from '../lib/modal';

interface ConfirmInviteProps {
  onBackToLogin: () => void;
}

export const ConfirmInvite: React.FC<ConfirmInviteProps> = ({ onBackToLogin }) => {
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Check if we already have a session established (Supabase automatically logs in from Hash/URL tokens)
    const checkInitialSession = async () => {
      try {
        // First check query params for direct email link
        const queryParams = new URLSearchParams(window.location.search);
        const emailParam = queryParams.get('email');

        if (emailParam) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: emailParam,
            password: 'TemporaryPassword123!'
          });

          if (!isMounted) return;

          if (error) {
            console.error('Direct auth error:', error.message);
            setErrorMsg('Failed to authenticate invitation. Please request a new invite.');
          } else if (data.session) {
            setSession(data.session);
            if (data.session.user?.user_metadata?.full_name) {
              setFullName(data.session.user.user_metadata.full_name);
            }
          }
          setIsLoading(false);
          return;
        }

        // Standard hash-based URL verification
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (initialSession && isMounted) {
          setSession(initialSession);
          setIsLoading(false);
          if (initialSession.user?.user_metadata?.full_name) {
            setFullName(initialSession.user.user_metadata.full_name);
          }
          return;
        }
      } catch (err) {
        console.error('Error fetching initial session:', err);
      }
    };

    checkInitialSession();

    // Subscribe to auth state changes to detect when the token parses and log-in succeeds
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!isMounted) return;
      if (currentSession) {
        setSession(currentSession);
        setIsLoading(false);
        if (currentSession.user?.user_metadata?.full_name) {
          setFullName(currentSession.user.user_metadata.full_name);
        }
      }
    });

    // Fallback timer: if no session is captured in 6 seconds, show error
    const timer = setTimeout(() => {
      if (isMounted && isLoading) {
        setIsLoading(false);
        setErrorMsg('The invitation link is invalid, expired, or has already been used.');
      }
    }, 6000);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (!session) {
        throw new Error('No active session. Please click the link in the invitation email again.');
      }

      // 1. Update the user password and user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
        data: {
          full_name: fullName,
          must_change_password: false
        }
      });

      if (updateError) throw updateError;

      // 2. Update the public profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName
        })
        .eq('id', session.user.id);

      if (profileError) throw profileError;

      await showAlert('Account activated successfully! Redirecting you to the dashboard.');
      window.location.href = '/';
    } catch (err: any) {
      console.error('Error confirming invite:', err);
      let errMsg = err.message || 'Failed to complete registration.';
      if (err.status === 504 || errMsg === '{}') {
        errMsg = 'Supabase Auth server timed out (Status 504). This usually means the Custom SMTP / Resend provider is misconfigured in your Supabase Dashboard.';
      }
      setErrorMsg(errMsg);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-svh w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#ECFDF5] via-[#F0FDFA] to-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0F766E] to-[#14B8A6] flex items-center justify-center shadow-lg shadow-[#0F766E]/20 animate-pulse">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M3 7 C 5.5 9, 7.5 5, 10 7 C 12.5 9, 14.5 5, 17 7 C 19.5 9, 20.5 6, 21 6.5" />
                <path d="M3 12 C 5.5 14, 7.5 10, 10 12 C 12.5 14, 14.5 10, 17 12 C 19.5 14, 20.5 11, 21 11.5" />
                <path d="M3 17 C 5.5 19, 7.5 15, 10 17 C 12.5 19, 14.5 15, 17 17 C 19.5 19, 20.5 16, 21 16.5" />
              </svg>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#5EEAD4] rounded-full animate-ping" />
          </div>
          <div className="text-center">
            <span className="text-sm font-bold text-[#0F766E] tracking-wider uppercase">ABMS</span>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Verifying invitation token...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#ECFDF5] via-[#F0FDFA] to-[#F8FAFC] px-5 py-12">
      {/* Header */}
      <div className="flex flex-col items-center mb-6 text-center animate-fade-in">
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

      {/* Card */}
      <div className="w-full max-w-[400px] bg-white border border-[#E2E8F0]/80 rounded-2xl shadow-xl shadow-slate-200/50 p-6 animate-card-enter">
        <h1 className="text-xl font-extrabold text-slate-800 mb-1 text-left">
          Complete Registration
        </h1>
        <p className="text-[11px] text-slate-400 font-semibold mb-6 text-left">
          Set up your profile and password to join your team workspace.
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-xl flex items-start gap-2">
            <span className="mt-0.5">⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {session ? (
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Email Field (Disabled) */}
            <div className="space-y-1.5 text-left opacity-75">
              <label className="text-[11px] font-bold text-slate-500 tracking-wide">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={session.user.email}
                className="block w-full h-11 px-4 bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl text-sm text-slate-500 cursor-not-allowed"
              />
            </div>

            {/* Name Field */}
            <div className="space-y-1.5 text-left">
              <label htmlFor="fullName" className="text-[11px] font-bold text-slate-500 tracking-wide">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300">
                  <User size={16} />
                </div>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="block w-full h-11 pl-10 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm placeholder-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5EEAD4] focus:border-transparent focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 text-left">
              <label htmlFor="password" className="text-[11px] font-bold text-slate-500 tracking-wide">
                Password
              </label>
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

            {/* Confirm Password Field */}
            <div className="space-y-1.5 text-left">
              <label htmlFor="confirmPassword" className="text-[11px] font-bold text-slate-500 tracking-wide">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300">
                  <Lock size={16} />
                </div>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full h-11 pl-10 pr-11 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm placeholder-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5EEAD4] focus:border-transparent focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-gradient-to-r from-[#0F766E] to-[#0D9488] hover:from-[#115E59] hover:to-[#0F766E] active:scale-[0.98] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#0F766E]/15 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Registering Account...
                </span>
              ) : (
                <>
                  Register & Login
                  <ArrowRight size={16} strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-xs font-medium text-slate-500 text-center leading-relaxed">
              We couldn't detect a valid session. If you clicked the link in your email, please try opening it again, or make sure the link hasn't expired.
            </p>
            <button
              onClick={onBackToLogin}
              className="w-full h-11 border border-[#E2E8F0] hover:bg-slate-50 active:scale-[0.98] text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center transition-all cursor-pointer"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
