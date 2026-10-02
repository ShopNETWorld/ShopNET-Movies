'use client';

import React, { useState } from 'react';
import { X, User, Shield, Video, Key, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'CREATOR' | 'ADMIN' | 'PRODUCER';
  credits: number;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: UserSession) => void;
}

export function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'quick' | 'signin' | 'register'>('quick');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'CREATOR' | 'PRODUCER'>('CREATOR');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleQuickLogin = (quickRole: 'CREATOR' | 'ADMIN' | 'PRODUCER') => {
    setIsLoading(true);
    setTimeout(() => {
      let session: UserSession;
      if (quickRole === 'CREATOR') {
        session = {
          id: 'usr_creator_demo',
          name: 'Kunle Adebayo',
          email: 'creator@shopnet.movies',
          role: 'CREATOR',
          credits: 500,
        };
      } else if (quickRole === 'ADMIN') {
        session = {
          id: 'usr_admin_demo',
          name: 'Super Admin',
          email: 'admin@shopnet.movies',
          role: 'ADMIN',
          credits: 99999,
        };
      } else {
        session = {
          id: 'usr_producer_demo',
          name: 'Ngozi Okonjo',
          email: 'producer@shopnet.movies',
          role: 'PRODUCER',
          credits: 1200,
        };
      }
      setIsLoading(false);
      onLoginSuccess(session);
      onClose();
    }, 400);
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      setIsLoading(false);
      const isPrivileged = email.includes('admin');
      const session: UserSession = {
        id: `usr_${Date.now()}`,
        name: email.split('@')[0],
        email,
        role: isPrivileged ? 'ADMIN' : 'CREATOR',
        credits: isPrivileged ? 99999 : 500,
      };
      onLoginSuccess(session);
      onClose();
    }, 500);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg('All fields are required.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      setIsLoading(false);
      const session: UserSession = {
        id: `usr_${Date.now()}`,
        name,
        email,
        role,
        credits: 250, // Welcome signup bonus
      };
      onLoginSuccess(session);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl glass-panel border border-border/80 bg-card p-6 shadow-2xl shadow-primary/10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-muted/60 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary to-accent mx-auto mb-3 flex items-center justify-center text-white shadow-lg shadow-primary/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-white">Access ShopNET Studio</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Test creator workflows or access administrative controls
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-background/60 rounded-xl mb-6 border border-border/50 text-xs font-medium">
          <button
            onClick={() => { setActiveTab('quick'); setErrorMsg(''); }}
            className={`py-2 rounded-lg transition ${
              activeTab === 'quick'
                ? 'bg-primary text-white font-semibold shadow'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            ⚡ Quick Test
          </button>
          <button
            onClick={() => { setActiveTab('signin'); setErrorMsg(''); }}
            className={`py-2 rounded-lg transition ${
              activeTab === 'signin'
                ? 'bg-primary text-white font-semibold shadow'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
            className={`py-2 rounded-lg transition ${
              activeTab === 'register'
                ? 'bg-primary text-white font-semibold shadow'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-lg bg-accent/10 border border-accent/30 text-accent text-xs">
            {errorMsg}
          </div>
        )}

        {/* TAB 1: Quick Test Accounts */}
        {activeTab === 'quick' && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground mb-3">
              Select a pre-configured role to immediately enter the studio with simulated credits and permissions:
            </p>

            <button
              onClick={() => handleQuickLogin('CREATOR')}
              disabled={isLoading}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/15 hover:border-primary transition group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                    Kunle Adebayo
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-mono font-bold">
                      CREATOR
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">Nollywood Director • 500 Credits</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={() => handleQuickLogin('ADMIN')}
              disabled={isLoading}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-gold/30 bg-gold/5 hover:bg-gold/15 hover:border-gold transition group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gold/20 flex items-center justify-center text-gold group-hover:scale-105 transition-transform">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                    Super Administrator
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gold/20 text-gold font-mono font-bold">
                      ADMIN
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">System Audit Logs, WAF &amp; Probes</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-gold group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={() => handleQuickLogin('PRODUCER')}
              disabled={isLoading}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-accent/30 bg-accent/5 hover:bg-accent/15 hover:border-accent transition group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent/20 flex items-center justify-center text-accent group-hover:scale-105 transition-transform">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                    Ngozi Okonjo
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/20 text-accent font-mono font-bold">
                      PRODUCER
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">Studio Budgeting • 1,200 Credits</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        )}

        {/* TAB 2: Standard Sign In */}
        {activeTab === 'signin' && (
          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="creator@shopnet.movies"
                className="w-full px-3.5 py-2.5 rounded-xl bg-background/80 border border-border text-sm text-white focus:outline-none focus:border-primary transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-background/80 border border-border text-sm text-white focus:outline-none focus:border-primary transition"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-sm transition shadow-lg shadow-primary/25 disabled:opacity-50"
            >
              {isLoading ? 'Authenticating...' : 'Sign In to Studio'}
            </button>
          </form>
        )}

        {/* TAB 3: Register */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Funke Akindele"
                className="w-full px-3.5 py-2.5 rounded-xl bg-background/80 border border-border text-sm text-white focus:outline-none focus:border-primary transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="funke@sceneone.tv"
                className="w-full px-3.5 py-2.5 rounded-xl bg-background/80 border border-border text-sm text-white focus:outline-none focus:border-primary transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-3.5 py-2.5 rounded-xl bg-background/80 border border-border text-sm text-white focus:outline-none focus:border-primary transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Filmmaker Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-background/80 border border-border text-sm text-white focus:outline-none focus:border-primary transition"
              >
                <option value="CREATOR">Director / Screenwriter (Creator)</option>
                <option value="PRODUCER">Studio Executive (Producer)</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white font-semibold text-sm transition shadow-lg shadow-primary/25 disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Get Started with 250 Free Credits'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
