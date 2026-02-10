import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authAPI } from '../utils/api';
import { useNotification } from '../utils/NotificationContext';
import BackgroundBeams from '../components/aceternity/BackgroundBeams';
import TextGenerateEffect from '../components/aceternity/TextGenerateEffect';
import MovingBorderButton from '../components/aceternity/MovingBorderButton';
import ThemeToggle from '../components/ThemeToggle';

const Signup: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { success, error: notifyError } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      const message = 'Passwords do not match';
      setError(message);
      notifyError(message);
      return;
    }

    if (username.length < 3 || username.length > 10) {
      const message = 'Username must be 3-10 characters';
      setError(message);
      notifyError(message);
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    if (!passwordRegex.test(password)) {
      const message = 'Password must include uppercase, lowercase, number, special char (8-20)';
      setError(message);
      notifyError(message);
      return;
    }

    setLoading(true);
    try {
      await authAPI.signup(username, password);
      success('Account created. Please sign in.');
      navigate('/login');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Signup failed. Please try again.';
      setError(message);
      notifyError(message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'peer w-full rounded-xl border border-slate-600 bg-slate-900/70 px-4 pb-2 pt-6 text-slate-100 placeholder-transparent focus:border-fuchsia-400 focus:outline-none';
  const labelClass =
    'absolute left-4 top-2 text-xs text-slate-400 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500 peer-focus:top-2 peer-focus:text-xs peer-focus:text-fuchsia-300';

  return (
    <div className="relative min-h-screen bg-slate-950 flex items-center justify-center p-4 overflow-hidden">
      <BackgroundBeams className="opacity-70" />
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle className="bg-slate-900/80 border-slate-700" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-white/15 bg-slate-900/70 backdrop-blur-xl p-8"
      >
        <TextGenerateEffect words="Create Your Account" className="text-3xl font-semibold text-slate-100" />
        <p className="mt-2 text-slate-300 text-sm">Start curating your knowledge graph today.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && <div className="rounded-lg bg-red-950/80 border border-red-700 text-red-200 px-3 py-2 text-sm">{error}</div>}

          <div className="relative">
            <input id="username" type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className={inputClass} required />
            <label htmlFor="username" className={labelClass}>Username</label>
          </div>

          <div className="relative">
            <input id="password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} required />
            <label htmlFor="password" className={labelClass}>Password</label>
          </div>

          <div className="relative">
            <input id="confirmPassword" type="password" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} required />
            <label htmlFor="confirmPassword" className={labelClass}>Confirm Password</label>
          </div>

          <MovingBorderButton type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating...' : 'Create Account'}
          </MovingBorderButton>
        </form>

        <p className="mt-6 text-sm text-slate-300 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-fuchsia-300 hover:text-fuchsia-200">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
