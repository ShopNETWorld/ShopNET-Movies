'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Sparkles, Video, ArrowRight, Shield, Film } from 'lucide-react';

interface HeroSliderProps {
  onQuickCreator: () => void;
  onQuickProducer: () => void;
  onQuickAdmin: () => void;
  onOpenAuth: () => void;
}

export function HeroSlider({ onQuickCreator, onQuickProducer, onQuickAdmin, onOpenAuth }: HeroSliderProps) {
  const slides = [
    {
      id: 1,
      image: '/movies/slide1.jpg',
      tag: 'Nollywood Action Thriller',
      title: 'The Lagos Heist',
      logline: 'A sharp detective confronts international syndicates across the neon-lit, rain-slicked streets of Lagos.',
      engine: 'Synthesized with Google Veo 3.1 & Gemini Omni Flash',
      aspect: '2.39:1 Anamorphic',
    },
    {
      id: 2,
      image: '/movies/slide2.jpg',
      tag: 'African Historical Epic',
      title: 'Kingdom of Benin: The Golden Scepter',
      logline: 'Royal court intrigue and legendary warriors defend the ancient empire in an epic tale of honor and power.',
      engine: 'Synthesized with OpenAI Sora 2 4K Cinema Master',
      aspect: '70mm IMAX Master',
    },
    {
      id: 3,
      image: '/movies/slide3.jpg',
      tag: 'Cyber-Noir Supercar Chase',
      title: 'Lekki Midnight Run',
      logline: 'High-speed vehicular pursuit across the illuminated cable-stayed bridge during a fiery Lagos sunset.',
      engine: 'Synthesized with Runway Gen-3 Alpha & ElevenLabs Audio',
      aspect: '16:9 4K HDR 60fps',
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance slides every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const current = slides[currentSlide];

  return (
    <section className="relative w-full min-h-[640px] md:min-h-[720px] overflow-hidden flex items-center justify-center">
      {/* Background Movie Images Slider */}
      {slides.map((s, idx) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
          } transform transition-transform duration-1000`}
        >
          {/* Real Movie Still Image */}
          <img
            src={s.image}
            alt={s.title}
            className="w-full h-full object-cover object-center"
          />

          {/* Cinematic Vignette Overlays for Maximum Contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-black/50" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
        </div>
      ))}

      {/* Foreground Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-left w-full flex flex-col justify-end">
        <div className="max-w-3xl">
          {/* Movie Still Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel text-xs text-muted-foreground mb-4 border border-white/10 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="font-mono text-gold font-bold">{current.tag}</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-300 font-mono">{current.aspect}</span>
          </div>

          {/* Movie Title & Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08] drop-shadow-md">
            AI-Powered Film Studio for{' '}
            <span className="text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]">
              Modern Filmmakers
            </span>
          </h1>

          {/* Subtext with Active Slide Info */}
          <p className="mt-5 text-base sm:text-lg text-gray-200 leading-relaxed max-w-2xl drop-shadow">
            {current.logline}
          </p>

          <div className="text-xs font-mono text-gray-300 mt-2 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>Currently Featuring: <strong className="text-white">{current.title}</strong> — {current.engine}</span>
          </div>

          {/* Interactive Hero Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={onQuickCreator}
              className="px-6 py-3.5 rounded-2xl bg-white text-black hover:bg-gray-200 font-extrabold text-sm shadow-2xl transition-all hover:scale-105 flex items-center gap-2"
            >
              <Video className="w-4 h-4 text-black" />
              Test Creator Account (500 Credits)
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onQuickProducer}
              className="px-6 py-3.5 rounded-2xl glass-panel hover:bg-card/90 border border-accent/50 text-accent font-bold text-sm shadow-lg transition-all hover:scale-105 flex items-center gap-2"
            >
              <Film className="w-4 h-4 text-accent" />
              Test Producer Slate (1,200 Credits)
            </button>

            <button
              onClick={onQuickAdmin}
              className="px-6 py-3.5 rounded-2xl glass-panel hover:bg-card/90 border border-gold/50 text-gold font-bold text-sm shadow-lg transition-all hover:scale-105 flex items-center gap-2"
            >
              <Shield className="w-4 h-4 text-gold" />
              Test Admin Console
            </button>

            <button
              onClick={onOpenAuth}
              className="px-5 py-3.5 rounded-2xl glass-panel border border-white/20 hover:bg-white/10 text-white text-sm font-semibold transition"
            >
              Sign In / Register
            </button>
          </div>
        </div>

        {/* Slider Controls Ribbon */}
        <div className="mt-12 flex items-center justify-between border-t border-white/10 pt-4">
          {/* Slide Dots */}
          <div className="flex items-center gap-3">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentSlide(idx)}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentSlide
                    ? 'w-8 h-2 bg-white'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Prev / Next Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevSlide}
              className="p-2 rounded-xl glass-panel border border-white/10 text-white hover:bg-white/20 transition"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextSlide}
              className="p-2 rounded-xl glass-panel border border-white/10 text-white hover:bg-white/20 transition"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
