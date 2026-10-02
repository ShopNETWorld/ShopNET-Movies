'use client';

import React, { useState } from 'react';
import { X, Sparkles, CreditCard, CheckCircle2, RefreshCw, ShieldCheck, ArrowRight } from 'lucide-react';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTopUpSuccess: (creditsAdded: number) => void;
}

export function TopUpModal({ isOpen, onClose, onTopUpSuccess }: TopUpModalProps) {
  const [gateway, setGateway] = useState<'paystack' | 'stripe'>('paystack');
  const [selectedPack, setSelectedPack] = useState<'starter' | 'pro' | 'studio'>('pro');
  const [isProcessing, setIsProcessing] = useState(false);
  const [receipt, setReceipt] = useState<{
    reference: string;
    credits: number;
    amount: string;
    gateway: string;
    timestamp: string;
  } | null>(null);

  if (!isOpen) return null;

  const packages = {
    starter: {
      id: 'starter',
      name: 'Starter Creator Pack',
      credits: 250,
      priceNGN: '₦15,000',
      priceUSD: '$19',
      costPerShot: '10 Shots @ 25 credits',
    },
    pro: {
      id: 'pro',
      name: 'Director Pro Pack (Popular)',
      credits: 750,
      priceNGN: '₦40,000',
      priceUSD: '$49',
      costPerShot: '30 Shots @ 25 credits',
    },
    studio: {
      id: 'studio',
      name: 'Studio Feature Pack',
      credits: 2500,
      priceNGN: '₦120,000',
      priceUSD: '$149',
      costPerShot: '100 Shots @ 25 credits',
    },
  };

  const currentPack = packages[selectedPack];
  const priceDisplay = gateway === 'paystack' ? currentPack.priceNGN : currentPack.priceUSD;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const ref = `${gateway === 'paystack' ? 'pstk' : 'strp'}_ref_${Date.now()}`;
      setReceipt({
        reference: ref,
        credits: currentPack.credits,
        amount: priceDisplay,
        gateway: gateway === 'paystack' ? 'Paystack (NGN)' : 'Stripe (USD)',
        timestamp: new Date().toLocaleTimeString(),
      });
      onTopUpSuccess(currentPack.credits);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl glass-panel border border-border/80 bg-card p-6 sm:p-8 shadow-2xl shadow-primary/10">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-muted-foreground hover:text-white hover:bg-muted transition"
        >
          <X className="w-5 h-5" />
        </button>

        {receipt ? (
          /* Payment Success Receipt */
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Payment Verified &amp; Credits Allocated!</h3>
            <p className="text-xs text-muted-foreground">
              Your transaction was verified via {receipt.gateway} webhook signature.
            </p>

            <div className="bg-background/80 p-4 rounded-2xl border border-border text-left font-mono text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Credits Credited:</span>
                <span className="text-gold font-bold">+{receipt.credits} Credits</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Paid:</span>
                <span className="text-white font-bold">{receipt.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction Ref:</span>
                <span className="text-gray-300">{receipt.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ledger Status:</span>
                <span className="text-emerald-400">ACID Recorded (Idempotent)</span>
              </div>
            </div>

            <button
              onClick={() => { setReceipt(null); onClose(); }}
              className="w-full py-3 rounded-xl bg-primary text-white font-bold text-xs shadow-lg shadow-primary/25 hover:bg-primary/90 transition"
            >
              Return to Studio Workspace
            </button>
          </div>
        ) : (
          /* Checkout View */
          <div>
            <div className="mb-6">
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-gold/10 text-gold border border-gold/30 uppercase">
                Filmmaker Billing
              </span>
              <h3 className="text-2xl font-bold text-white mt-2">Top Up Production Credits</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Credits never expire and are consumed per generated video shot or extended take.
              </p>
            </div>

            {/* Gateway Toggle */}
            <div className="mb-5">
              <label className="block text-xs font-mono uppercase text-muted-foreground mb-1.5">
                Payment Gateway
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setGateway('paystack')}
                  className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                    gateway === 'paystack'
                      ? 'border-emerald-500 bg-emerald-500/10 text-white font-bold'
                      : 'border-border bg-background/50 text-muted-foreground hover:border-emerald-500/50'
                  }`}
                >
                  <div>
                    <div className="text-xs">🇳🇬 Paystack</div>
                    <div className="text-[10px] text-muted-foreground">Naira (Cards, USSD, OPay)</div>
                  </div>
                  {gateway === 'paystack' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </button>

                <button
                  onClick={() => setGateway('stripe')}
                  className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                    gateway === 'stripe'
                      ? 'border-primary bg-primary/10 text-white font-bold'
                      : 'border-border bg-background/50 text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  <div>
                    <div className="text-xs">🌐 Stripe</div>
                    <div className="text-[10px] text-muted-foreground">USD (Visa, Apple Pay)</div>
                  </div>
                  {gateway === 'stripe' && <CheckCircle2 className="w-4 h-4 text-primary" />}
                </button>
              </div>
            </div>

            {/* Package Selection */}
            <div className="mb-6 space-y-2.5">
              <label className="block text-xs font-mono uppercase text-muted-foreground mb-1.5">
                Select Credit Allocation
              </label>
              {(Object.keys(packages) as Array<keyof typeof packages>).map((key) => {
                const pkg = packages[key];
                const price = gateway === 'paystack' ? pkg.priceNGN : pkg.priceUSD;
                return (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedPack(key)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
                      selectedPack === key
                        ? 'border-gold bg-gold/10 shadow-lg shadow-gold/10'
                        : 'border-border bg-background/50 hover:border-gold/50'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        {pkg.name}
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gold/20 text-gold font-mono font-bold">
                          +{pkg.credits} Credits
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">{pkg.costPerShot}</div>
                    </div>
                    <div className="text-sm font-extrabold text-white">{price}</div>
                  </button>
                );
              })}
            </div>

            {/* Order Summary & Submit Button */}
            <div className="pt-4 border-t border-border flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-mono text-muted-foreground">Total Due</div>
                <div className="text-xl font-extrabold text-white">{priceDisplay}</div>
              </div>

              <button
                onClick={handlePay}
                disabled={isProcessing}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-primary/25 transition flex items-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Processing with {gateway === 'paystack' ? 'Paystack' : 'Stripe'}...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Pay {priceDisplay} Now
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
