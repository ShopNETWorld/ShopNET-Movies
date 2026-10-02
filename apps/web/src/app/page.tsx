'use client';

import React, { useState } from 'react';
import { 
  Film, Sparkles, Video, Share2, Shield, Layers, Cpu, Database, 
  ArrowRight, CheckCircle2, User, Key, Play, Zap, Globe, Lock, Sliders
} from 'lucide-react';
import { Header } from '../components/Header';
import { AuthModal, type UserSession } from '../components/AuthModal';
import { StudioDashboard } from '../components/StudioDashboard';
import { HeroSlider } from '../components/HeroSlider';
import { CinemaWorkflows } from '../components/CinemaWorkflows';
import { PricingSection } from '../components/PricingSection';
import { TopUpModal } from '../components/TopUpModal';

export default function HomePage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [currentView, setCurrentView] = useState<'studio' | 'explore'>('studio');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  // Quick 1-click test roles
  const handleQuickCreatorLogin = () => {
    setSession({
      id: 'usr_creator_instant',
      name: 'Kunle Adebayo',
      email: 'creator@shopnet.movies',
      role: 'CREATOR',
      credits: 500,
    });
    setCurrentView('studio');
  };

  const handleQuickProducerLogin = () => {
    setSession({
      id: 'usr_producer_instant',
      name: 'Ngozi Okonjo',
      email: 'producer@shopnet.movies',
      role: 'PRODUCER',
      credits: 1200,
    });
    setCurrentView('studio');
  };

  const handleQuickAdminLogin = () => {
    setSession({
      id: 'usr_admin_instant',
      name: 'Super Administrator',
      email: 'admin@shopnet.movies',
      role: 'ADMIN',
      credits: 99999,
    });
    setCurrentView('studio');
  };

  const handleLogout = () => {
    setSession(null);
    setCurrentView('studio');
  };

  // Seamless navigation across anchors & views whether logged in or out
  const handleNavigate = (target: 'workflows' | 'models' | 'pricing' | 'studio') => {
    if (target === 'studio') {
      setCurrentView('studio');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (session) {
      setCurrentView('explore');
    }

    setTimeout(() => {
      const element = document.getElementById(target);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 60);
  };

  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30">
      {/* Top Navigation */}
      <Header
        session={session}
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      {session && currentView === 'studio' ? (
        /* Authenticated Interactive Studio Dashboard */
        <StudioDashboard
          session={session}
          onLogout={handleLogout}
          onSwitchToExplore={() => setCurrentView('explore')}
        />
      ) : (
        /* Cinematic Showcase & Landing Page (shown for guests OR when logged-in user clicks Explore) */
        <>
          {/* Authenticated Mode Banner when browsing showcase */}
          {session && (
            <div className="bg-primary/10 border-b border-primary/20 px-6 py-2.5 flex items-center justify-between text-xs max-w-7xl mx-auto w-full sticky top-16 z-40 backdrop-blur-md">
              <div className="flex items-center gap-2 text-white">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  Browsing Platform Showcase as <strong>{session.name}</strong> ({session.role} • {session.credits.toLocaleString()} Credits)
                </span>
              </div>
              <button
                onClick={() => setCurrentView('studio')}
                className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold transition flex items-center gap-1.5 shadow"
              >
                <Sliders className="w-3.5 h-3.5" />
                Return to Studio &rarr;
              </button>
            </div>
          )}

          {/* Hero Movie Slider — Real Movie Stills, No Gradients */}
          <HeroSlider
            onQuickCreator={handleQuickCreatorLogin}
            onQuickProducer={handleQuickProducerLogin}
            onQuickAdmin={handleQuickAdminLogin}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />

          {/* Interactive Cinema Workflows Section */}
          <CinemaWorkflows onLaunchDemo={handleQuickCreatorLogin} />

          {/* Multi-Model Video Engine Comparison */}
          <section id="models" className="max-w-7xl mx-auto px-6 py-16 w-full">
            <div className="text-center mb-12">
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent uppercase tracking-wider">
                Multi-Model Infrastructure
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mt-3">
                Intelligent Generative Routing
              </h2>
              <p className="text-sm text-muted-foreground max-w-2xl mx-auto mt-2">
                ShopNET AI Gateway abstracts multiple foundation providers to give filmmakers uninterrupted uptime, photorealism, and rapid pre-vis prototyping.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Omni Flash */}
              <div className="glass-panel p-6 rounded-3xl border border-primary/40 hover:border-primary transition group flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-105 transition-transform">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Gemini Omni Flash</h3>
                  <div className="text-[11px] font-mono text-primary font-semibold mb-3">Rapid Pre-Vis &amp; Animatics</div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    Ultra-low latency storyboard previews, draft pacing, and real-time concept iteration for agile writers and directors.
                  </p>
                </div>
                <div className="pt-4 border-t border-border/60 text-[11px] text-muted-foreground font-mono flex items-center justify-between">
                  <span>Latency: ~4s</span>
                  <span className="text-emerald-400 font-semibold">10-25 Credits</span>
                </div>
              </div>

              {/* Veo 3.1 */}
              <div className="glass-panel p-6 rounded-3xl border border-border/80 hover:border-primary/50 transition group flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-105 transition-transform">
                    <Video className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Google Veo 3.1</h3>
                  <div className="text-[11px] font-mono text-primary font-semibold mb-3">Primary Cinematic Master</div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    Ultra-realistic lighting, complex prompt adherence, and rich cultural skin tone reproduction for Nollywood features.
                  </p>
                </div>
                <div className="pt-4 border-t border-border/60 text-[11px] text-muted-foreground font-mono flex items-center justify-between">
                  <span>Latency: ~12s</span>
                  <span className="text-emerald-400 font-semibold">25-65 Credits</span>
                </div>
              </div>

              {/* Sora 2 */}
              <div className="glass-panel p-6 rounded-3xl border border-border/80 hover:border-accent/50 transition group flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-4 group-hover:scale-105 transition-transform">
                    <Film className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">OpenAI Sora 2</h3>
                  <div className="text-[11px] font-mono text-accent font-semibold mb-3">Action Physics Engine</div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    Dynamic camera dolly tracking, complex vehicle chases, and atmospheric particle effects with high temporal coherence.
                  </p>
                </div>
                <div className="pt-4 border-t border-border/60 text-[11px] text-muted-foreground font-mono flex items-center justify-between">
                  <span>Latency: ~18s</span>
                  <span className="text-emerald-400 font-semibold">30-80 Credits</span>
                </div>
              </div>

              {/* Runway Gen-3 */}
              <div className="glass-panel p-6 rounded-3xl border border-border/80 hover:border-gold/50 transition group flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold mb-4 group-hover:scale-105 transition-transform">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Runway Gen-3 Alpha</h3>
                  <div className="text-[11px] font-mono text-gold font-semibold mb-3">Rapid Motion &amp; Extension</div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    Seamless shot inpainting, frame rate upscaling, and video extensions up to 30 seconds for broadcast masters.
                  </p>
                </div>
                <div className="pt-4 border-t border-border/60 text-[11px] text-muted-foreground font-mono flex items-center justify-between">
                  <span>Latency: ~8s</span>
                  <span className="text-emerald-400 font-semibold">20-50 Credits</span>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing Section with Paystack & Stripe Currency Toggles */}
          <PricingSection
            onSelectPlan={() => {
              if (session) {
                setIsTopUpOpen(true);
              } else {
                setIsAuthModalOpen(true);
              }
            }}
          />
        </>
      )}

      {/* Auth & Demo Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(newSession) => {
          setSession(newSession);
          setCurrentView('studio');
        }}
      />

      {/* Top-Up & Checkout Modal */}
      {session && (
        <TopUpModal
          isOpen={isTopUpOpen}
          onClose={() => setIsTopUpOpen(false)}
          onTopUpSuccess={(added) => {
            setSession(prev => prev ? { ...prev, credits: prev.credits + added } : null);
          }}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-border/60 py-10 px-6 text-center text-xs text-muted-foreground bg-background">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-primary" />
            <span className="font-bold text-white">ShopNET Movies</span>
            <span>&copy; 2026. Built for African &amp; Global Cinema.</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="http://localhost:3001/api/v1/health" target="_blank" rel="noreferrer" className="hover:text-white transition">
              Live API Status
            </a>
            <button onClick={() => handleNavigate('workflows')} className="hover:text-white transition">
              Workflows
            </button>
            <button onClick={() => handleNavigate('pricing')} className="hover:text-white transition">
              Pricing
            </button>
            <button 
              onClick={() => {
                if (session) {
                  setCurrentView('studio');
                } else {
                  setIsAuthModalOpen(true);
                }
              }} 
              className="hover:text-white transition"
            >
              {session ? 'Go to Studio' : 'Sign In'}
            </button>
          </div>
        </div>
      </footer>
    </main>
  );
}
