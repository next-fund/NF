import React, { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { BRAND } from '@/lib/constants';
import { isFirebaseConfigured } from '@/lib/firebase';
import { Loader2, ShieldCheck, TrendingUp, Lock } from 'lucide-react';

type Mode = 'signin' | 'signup' | 'forgot';

const AuthPage: React.FC = () => {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFirebaseConfigured) {
      toast.error('Add your Firebase config in src/lib/firebase.ts first.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'signup') {
        if (!name.trim()) throw new Error('Please enter your name');
        await signUp(email.trim(), password, name.trim());
        toast.success('Account created. Welcome to NexFund!');
      } else if (mode === 'signin') {
        await signIn(email.trim(), password);
        toast.success('Signed in successfully');
      } else {
        await resetPassword(email.trim());
        toast.success('Password reset email sent. Check your inbox.');
        setMode('signin');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      toast.error(msg.replace('Firebase:', '').replace(/\(auth.*\)/, '').trim() || 'Authentication failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-950 text-white">
      {/* Brand / hero side */}
      <div
        className="relative lg:w-1/2 flex flex-col justify-center px-8 py-16 lg:px-16 overflow-hidden"
        style={{ backgroundImage: `url(${BRAND.hero})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-indigo-950/80 to-purple-950/85" />
        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <img src={BRAND.logo} alt="logo" className="w-14 h-14 rounded-2xl shadow-lg shadow-indigo-500/30" />
            <span className="text-3xl font-bold tracking-tight">{BRAND.name}</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-4 bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
            {BRAND.slogan}
          </h1>
          <p className="text-slate-300 text-lg mb-10">
            Grow your capital with curated USDT investment plans that pay automated daily returns — secured, transparent, effortless.
          </p>
          <div className="space-y-4">
            {[
              { icon: TrendingUp, t: 'Automated 24h returns', d: 'Earn daily on every active package.' },
              { icon: ShieldCheck, t: 'Admin-verified transactions', d: 'Every deposit & withdrawal is reviewed.' },
              { icon: Lock, t: 'Firebase secured auth', d: 'Bank-grade authentication & storage.' },
            ].map((f) => (
              <div key={f.t} className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white/10 backdrop-blur">
                  <f.icon className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <p className="font-semibold">{f.t}</p>
                  <p className="text-sm text-slate-400">{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="lg:w-1/2 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="bg-slate-900/70 border border-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-1">
              {mode === 'signin' && 'Welcome back'}
              {mode === 'signup' && 'Create your account'}
              {mode === 'forgot' && 'Reset your password'}
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              {mode === 'signin' && 'Sign in to access your dashboard'}
              {mode === 'signup' && 'Start investing in minutes'}
              {mode === 'forgot' && "We'll email you a reset link"}
            </p>

            {!isFirebaseConfigured && (
              <div className="mb-5 text-xs rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 p-3">
                Edit <code className="font-mono">src/lib/firebase.ts</code> with your Firebase project keys to enable login.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <Field label="Full name" value={name} onChange={setName} placeholder="John Doe" />
              )}
              <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@email.com" />
              {mode !== 'forgot' && (
                <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
              )}

              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-sm text-indigo-400 hover:text-indigo-300"
                >
                  Forgot password?
                </button>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 py-3 font-semibold transition shadow-lg shadow-indigo-600/30 disabled:opacity-60"
              >
                {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                {mode === 'signin' && 'Sign In'}
                {mode === 'signup' && 'Sign Up'}
                {mode === 'forgot' && 'Send Reset Link'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-400">
              {mode === 'signin' && (
                <>Don't have an account?{' '}
                  <button onClick={() => setMode('signup')} className="text-indigo-400 font-semibold hover:text-indigo-300">Sign up</button>
                </>
              )}
              {mode === 'signup' && (
                <>Already registered?{' '}
                  <button onClick={() => setMode('signin')} className="text-indigo-400 font-semibold hover:text-indigo-300">Sign in</button>
                </>
              )}
              {mode === 'forgot' && (
                <button onClick={() => setMode('signin')} className="text-indigo-400 font-semibold hover:text-indigo-300">Back to sign in</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Field: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}> = ({ label, value, onChange, type = 'text', placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required
      className="w-full rounded-xl bg-slate-800/80 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  </div>
);

export default AuthPage;
