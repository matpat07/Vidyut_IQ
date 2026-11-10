import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, Zap, AlertCircle, Loader2, ShieldCheck, School, GraduationCap } from 'lucide-react';
import { useAuth, UserRole } from '../../context/AuthContext';

export const LoginView: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, role, fullName);
        if (error) throw error;
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-slate-100 p-4 relative overflow-hidden select-none">
      {/* Background radial energy aura matching Vidyut IQ dark radar */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-8 shadow-2xl relative z-10"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-7">
          <div className="w-13 h-13 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3.5 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <Zap className="w-6 h-6 fill-cyan-400/20" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-1.5">
            Vidyut <span className="text-cyan-400">IQ</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium tracking-wide">
            Intelligent Energy Telemetry & Campus Radar
          </p>
        </div>

        {/* Error notification */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 bg-red-950/40 border border-red-800/60 rounded-xl flex items-start gap-2.5 text-xs text-red-300"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                placeholder="Enter full name"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Campus Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all"
              placeholder="user@pccoe.edu.in"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all"
              placeholder="••••••••"
            />
          </div>

          {isSignUp && (
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Role & Access Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'STUDENT', label: 'Student', icon: GraduationCap },
                  { id: 'TEACHER', label: 'Faculty', icon: School },
                  { id: 'ADMIN', label: 'Admin', icon: ShieldCheck },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setRole(id as UserRole)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      role === id
                        ? 'bg-cyan-500/15 border-cyan-500/60 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 disabled:opacity-50 text-slate-950 font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.35)] cursor-pointer"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
            ) : isSignUp ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Vidyut Account</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to Portal</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg(null);
            }}
            className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
          >
            {isSignUp ? 'Already have credentials? Sign In' : "Don't have access? Create an account"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
