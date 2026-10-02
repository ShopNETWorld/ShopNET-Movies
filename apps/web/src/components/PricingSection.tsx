'use client';

import React, { useState } from 'react';
import { CheckCircle2, Sparkles, CreditCard, ArrowRight } from 'lucide-react';

export function PricingSection({ onSelectPlan }: { onSelectPlan: (plan: string) => void }) {
  const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN');

  const plans = [
    {
      id: 'starter',
      name: 'Starter Creator',
      desc: 'Ideal for independent screenwriters and short-form video creators.',
      price: currency === 'NGN' ? '₦15,000' : '$19',
      period: '/ month',
      credits: '250 Credits',
      popular: false,
      features: [
        '250 Monthly AI Video & Script Credits',
        'Google Veo 3.1 & Runway Gen-3 access',
        'Yoruba, Pidgin & English Screenplays',
        '1080p Full HD Video Exports',
        'TikTok & Instagram Direct Publishing',
      ],
    },
    {
      id: 'pro',
      name: 'Pro Filmmaker',
      desc: 'For Nollywood directors, commercial studios, and production crews.',
      price: currency === 'NGN' ? '₦40,000' : '$49',
      period: '/ month',
      credits: '750 Credits',
      popular: true,
      features: [
        '750 Monthly AI Video & Script Credits',
        'OpenAI Sora 2 & Google Veo 3.1 4K HDR',
        'Voice acting & character face consistency',
        '4K Cinema Master exports (24 FPS / 60 FPS)',
        'Full multi-platform social broadcast queue',
        'Priority rendering speed',
      ],
    },
    {
      id: 'studio',
      name: 'Studio House',
      desc: 'For film production houses producing episodic series and features.',
      price: currency === 'NGN' ? '₦120,000' : '$149',
      period: '/ month',
      credits: '2,500 Credits',
      popular: false,
      features: [
        '2,500 Monthly AI Video & Script Credits',
        'Multi-user team workspaces & RBAC',
        'Dedicated BullMQ worker rendering queues',
        'Custom voice cloning & character libraries',
        'Paystack & Stripe dedicated invoicing',
        '24/7 Priority engineering SLA',
      ],
    },
  ];

  return (
    <section id="pricing" className="max-w-7xl mx-auto px-6 py-16 w-full">
      <div className="text-center mb-10">
        <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold uppercase tracking-wider">
          Flexible Filmmaker Pricing
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mt-3">
          Predictable Credit Tiers for <span className="text-gold">Every Production</span>
        </h2>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto mt-2">
          Transparent pricing supported natively in Nigerian Naira (Paystack) and US Dollars (Stripe).
        </p>

        {/* Currency Switcher */}
        <div className="inline-flex items-center gap-1.5 p-1 rounded-2xl bg-card border border-border mt-6">
          <button
            onClick={() => setCurrency('NGN')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              currency === 'NGN'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            🇳🇬 Paystack (NGN ₦)
          </button>
          <button
            onClick={() => setCurrency('USD')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              currency === 'USD'
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            🌐 Stripe (USD $)
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all ${
              plan.popular
                ? 'glass-panel border-2 border-primary shadow-2xl shadow-primary/15 scale-[1.03]'
                : 'glass-panel border border-border/80 hover:border-border'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-white text-[11px] font-bold uppercase tracking-wider shadow">
                Most Popular for Directors
              </div>
            )}

            <div>
              <h3 className="text-lg font-bold text-white">{plan.name}</h3>
              <p className="text-xs text-muted-foreground mt-1 min-h-[32px]">{plan.desc}</p>

              <div className="mt-6 mb-2 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white tracking-tight">{plan.price}</span>
                <span className="text-xs text-muted-foreground">{plan.period}</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gold/10 text-gold text-xs font-mono font-bold mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                {plan.credits}
              </div>

              <div className="space-y-3 pt-6 border-t border-border/60">
                {plan.features.map((feat) => (
                  <div key={feat} className="flex items-start gap-2.5 text-xs text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => onSelectPlan(plan.id)}
              className={`w-full mt-8 py-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                plan.popular
                  ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25'
                  : 'bg-card border border-border hover:border-primary text-white hover:bg-muted'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Subscribe with {currency === 'NGN' ? 'Paystack' : 'Stripe'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
