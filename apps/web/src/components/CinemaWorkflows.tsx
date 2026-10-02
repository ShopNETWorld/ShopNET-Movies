'use client';

import React, { useState } from 'react';
import { Film, Video, Share2, Sparkles, Layers, CheckCircle2, ArrowRight } from 'lucide-react';

export function CinemaWorkflows({ onLaunchDemo }: { onLaunchDemo: () => void }) {
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = [
    {
      id: 'screenplay',
      title: '1. Culturally Nuanced Screenplay',
      badge: 'Nollywood & Global Dialogue',
      icon: Film,
      headline: 'Authentic Nigerian & International Screenplays in Seconds',
      description: 'Generate authentic character dialogue with true cultural idioms across Nigerian Pidgin, Yoruba, Igbo, Hausa, and English without losing cinematic dramatic tension.',
      previewText: `TUNDE\n(stepping out of the Lagos rain)\nYou think say this rain go wash away the fifty million? Street dey talk, and your time don expire.\n\nFEMI\n(smiles, pouring a drink)\nDetective, Nigeria na business, no be church.`,
      tags: ['Pidgin', 'Yoruba', 'Hollywood English', 'Character Arcs'],
    },
    {
      id: 'multimodel',
      title: '2. Multi-Model AI Video Routing',
      badge: 'Zero Vendor Lock-in',
      icon: Video,
      headline: 'Wan 2.1, Seedance 2.5, Veo 3.1, Sora 2 & Kling',
      description: 'Route prompts dynamically across top generative video engines: Alibaba Wan 2.1 (Qwen Video), ByteDance Seedance 2.5 with native audio sync, Google Veo 3.1, and Pollinations Free Agent for 5s to 30s creation.',
      previewText: `[Selected Model: Alibaba Wan 2.1 (Qwen Video) / ByteDance Seedance 2.5]\nPrompt: Tracking shot through Balogun Market in Lagos, golden hour light filtering through vibrant Ankara fabrics, dynamic camera dolly, anamorphic 2.39:1.\nStatus: 24 FPS • 5s-30s Master Rendered with Synced Audio`,
      tags: ['Wan 2.1 (Qwen)', 'Seedance 2.5', 'Kling AI', 'Google Veo 3.1', 'OpenAI Sora 2'],
    },
    {
      id: 'voice',
      title: '3. Voice Sync & Video Extension',
      badge: 'Audio-Visual Harmony',
      icon: Layers,
      headline: 'Voice Acting, Subtitling & Frame Interpolation',
      description: 'Add natural African accented voice acting via ElevenLabs, auto-generate burnt-in multilingual subtitles, and extend shots from 5s to 30s seamlessly.',
      previewText: `[Audio Track: ElevenLabs Custom Nollywood Voice]\nEmotion: High Suspense\nSubtitles: English [SDH] generated\nExtension: +5s continuous motion forward`,
      tags: ['ElevenLabs Voice', 'Auto Subtitles', 'Video Inpainting', 'Seamless Looping'],
    },
    {
      id: 'publishing',
      title: '4. Direct Multi-Platform Broadcast',
      badge: 'One-Click Distribution',
      icon: Share2,
      headline: 'Simultaneous Widescreen & Vertical Distribution',
      description: 'Transcode once and publish everywhere: YouTube 16:9 4K Cinema, TikTok 9:16 Vertical Reels, Instagram, and Facebook with scheduling and analytics.',
      previewText: `[BullMQ Social Fleet Active]\n✓ YouTube: Uploaded to 'ShopNET Nollywood Studios'\n✓ TikTok: Rendered 9:16 vertical crop with burnt-in captions\n✓ Instagram: Scheduled for prime evening release`,
      tags: ['YouTube 4K', 'TikTok 9:16', 'Instagram Reels', 'BullMQ Queues'],
    },
  ];

  const current = steps[activeStep];

  return (
    <section id="workflows" className="max-w-7xl mx-auto px-6 py-16 w-full">
      <div className="text-center mb-12">
        <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary uppercase tracking-wider">
          Complete Production Lifecycle
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mt-3">
          Cinema-Grade Filmmaking <span className="bg-gradient-to-r from-primary via-accent to-gold bg-clip-text text-transparent">From Script to Screen</span>
        </h2>
        <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto mt-2">
          Click any phase below to experience how ShopNET Movies automates the modern film production pipeline.
        </p>
      </div>

      {/* Step Selector Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => setActiveStep(idx)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                activeStep === idx
                  ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20 scale-[1.02]'
                  : 'border-border/70 bg-card/60 hover:border-primary/40 hover:bg-card'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activeStep === idx ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                  Step 0{idx + 1}
                </span>
              </div>
              <div className="text-xs font-bold text-white leading-snug">{s.title.split('. ')[1]}</div>
            </button>
          );
        })}
      </div>

      {/* Active Step Showcase Panel */}
      <div className="glass-panel rounded-3xl p-8 border border-border/80 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent">
            {current.badge}
          </span>
          <h3 className="text-2xl font-bold text-white mt-4 mb-3">{current.headline}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            {current.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-8">
            {current.tags.map((t) => (
              <span key={t} className="text-xs px-3 py-1 rounded-lg bg-card border border-border text-gray-300 font-mono">
                {t}
              </span>
            ))}
          </div>

          <button
            onClick={onLaunchDemo}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-xs shadow-lg shadow-primary/20 hover:opacity-90 transition flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Try This In Studio Demo
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Live Output Preview Box */}
        <div className="rounded-2xl bg-black/60 border border-border p-6 font-mono text-xs shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-border/50 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Pipeline Output Preview
            </span>
            <span>ShopNET Studio Engine</span>
          </div>

          <div className="bg-card/90 p-4 rounded-xl border border-border/60 text-gray-200 leading-relaxed whitespace-pre-line">
            {current.previewText}
          </div>

          <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Latency: &lt; 850ms</span>
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Verified Operational
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
