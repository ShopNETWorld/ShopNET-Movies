'use client';

import React from 'react';
import { Film, Sparkles, User, LogIn, LogOut, Shield, Sliders, Compass } from 'lucide-react';
import type { UserSession } from './AuthModal';

interface HeaderProps {
  session: UserSession | null;
  currentView?: 'studio' | 'explore';
  onNavigate: (target: 'workflows' | 'models' | 'pricing' | 'studio') => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export function Header({ 
  session, 
  currentView = 'studio', 
  onNavigate, 
  onOpenAuth, 
  onLogout 
}: HeaderProps) {
  const handleNavClick = (e: React.MouseEvent, target: 'workflows' | 'models' | 'pricing') => {
    e.preventDefault();
    onNavigate(target);
  };

  return (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo Branding */}
        <div 
          onClick={() => onNavigate(session ? 'studio' : 'workflows')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            <Film className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            ShopNET <span className="text-primary font-extrabold">Movies</span>
          </span>
        </div>

        {/* Center Navigation Links (Works for both guest and logged-in users) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-muted-foreground">
          <button 
            onClick={(e) => handleNavClick(e, 'workflows')} 
            className="hover:text-white transition cursor-pointer"
          >
            Cinema Workflows
          </button>
          <button 
            onClick={(e) => handleNavClick(e, 'models')} 
            className="hover:text-white transition cursor-pointer"
          >
            AI Video Engines
          </button>
          <button 
            onClick={(e) => handleNavClick(e, 'pricing')} 
            className="hover:text-white transition cursor-pointer"
          >
            Pricing &amp; Credits
          </button>
          <a 
            href="http://localhost:3001/api/v1/health" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card border border-border/70 text-emerald-400 hover:border-emerald-400/40 transition"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            API Live Health
          </a>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          {session ? (
            /* Logged In User State */
            <div className="flex items-center gap-3">
              {/* Studio vs Explore Mode Switcher */}
              {currentView === 'explore' ? (
                <button
                  onClick={() => onNavigate('studio')}
                  className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 shadow-md shadow-primary/20 transition flex items-center gap-1.5"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>My Studio</span>
                </button>
              ) : (
                <button
                  onClick={() => onNavigate('workflows')}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-white text-xs font-medium transition"
                  title="Browse platform showcase and plans"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Explore Showcase</span>
                </button>
              )}

              {/* User Identity Pill */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border text-xs">
                {session.role === 'ADMIN' ? (
                  <Shield className="w-3.5 h-3.5 text-gold" />
                ) : session.role === 'PRODUCER' ? (
                  <User className="w-3.5 h-3.5 text-accent" />
                ) : (
                  <User className="w-3.5 h-3.5 text-primary" />
                )}
                <span className="font-semibold text-white max-w-[120px] truncate">{session.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  session.role === 'ADMIN' ? 'bg-gold/20 text-gold' :
                  session.role === 'PRODUCER' ? 'bg-accent/20 text-accent' :
                  'bg-primary/20 text-primary'
                }`}>
                  {session.role}
                </span>
              </div>

              {/* Sign Out */}
              <button
                onClick={onLogout}
                className="p-2 rounded-xl border border-border/60 hover:bg-muted text-muted-foreground hover:text-white transition text-xs"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Not Logged In State — Interactive Buttons */
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-white hover:bg-card border border-border/60 transition flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </button>

              <button
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-primary to-accent hover:opacity-95 shadow-lg shadow-primary/20 transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Launch Studio
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
