'use client';

import React, { useState } from 'react';
import { 
  Users, DollarSign, Calendar, CheckCircle2, Clock, 
  ArrowRight, Download, Sliders, Film, Sparkles, FileText, Check, X
} from 'lucide-react';
import type { UserSession } from './AuthModal';

interface ProducerDashboardProps {
  session: UserSession;
  onOpenTopUp: () => void;
}

export function ProducerDashboard({ session, onOpenTopUp }: ProducerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'budget' | 'crew' | 'approvals' | 'callsheet'>('budget');

  const [approvalTakes, setApprovalTakes] = useState([
    {
      id: 'take_901',
      title: 'Scene 14: Rooftop Confrontation - Close Up',
      director: 'Kunle Adebayo',
      model: 'Google Veo 3.1 4K',
      cost: '₦35,000 (45 Credits)',
      status: 'pending',
    },
    {
      id: 'take_902',
      title: 'Scene 08: Balogun Market Pursuit - Tracking Shot',
      director: 'Kunle Adebayo',
      model: 'OpenAI Sora 2',
      cost: '₦42,000 (55 Credits)',
      status: 'approved',
    },
    {
      id: 'take_903',
      title: 'Scene 22: Lekki Bridge Sunset Aerial Dolly',
      director: 'Kunle Adebayo',
      model: 'Runway Gen-3 Alpha',
      cost: '₦28,000 (35 Credits)',
      status: 'pending',
    },
  ]);

  const handleApprove = (id: string) => {
    setApprovalTakes(prev => prev.map(t => t.id === id ? { ...t, status: 'approved' } : t));
  };

  const handleReject = (id: string) => {
    setApprovalTakes(prev => prev.map(t => t.id === id ? { ...t, status: 'rejected' } : t));
  };

  return (
    <div className="space-y-6">
      {/* Producer Executive Header Ribbon */}
      <div className="glass-panel p-6 rounded-3xl border border-accent/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30">
              EXECUTIVE PRODUCER CONSOLE
            </span>
            <span className="text-xs text-muted-foreground">Production House: Silverbird Nollywood Slate</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Project Financials &amp; Studio Operations</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Oversee production spend, approve director takes, and allocate AI compute budgets.
          </p>
        </div>

        <button
          onClick={onOpenTopUp}
          className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-xs shadow-lg shadow-accent/25 transition flex items-center gap-2"
        >
          <DollarSign className="w-4 h-4" />
          Fund Production Account
        </button>
      </div>

      {/* Producer Sub-navigation */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('budget')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'budget' ? 'bg-accent text-white shadow' : 'text-muted-foreground hover:text-white'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Budget &amp; Burn Rate
        </button>
        <button
          onClick={() => setActiveTab('approvals')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'approvals' ? 'bg-accent text-white shadow' : 'text-muted-foreground hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Director Takes Approval ({approvalTakes.filter(t => t.status === 'pending').length} Pending)
        </button>
        <button
          onClick={() => setActiveTab('crew')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'crew' ? 'bg-accent text-white shadow' : 'text-muted-foreground hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          Cast &amp; Crew Roster
        </button>
        <button
          onClick={() => setActiveTab('callsheet')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'callsheet' ? 'bg-accent text-white shadow' : 'text-muted-foreground hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Daily Call Sheet (Day 14/45)
        </button>
      </div>

      {/* TAB 1: BUDGET & BURN RATE */}
      {activeTab === 'budget' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-card border border-border">
              <div className="text-[11px] font-mono uppercase text-muted-foreground">Total Slate Budget</div>
              <div className="text-2xl font-extrabold text-white mt-1">₦18,500,000</div>
              <div className="text-[10px] text-muted-foreground font-mono mt-1">$22,500 USD Allocation</div>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border">
              <div className="text-[11px] font-mono uppercase text-muted-foreground">AI Compute Spent</div>
              <div className="text-2xl font-extrabold text-accent mt-1">₦2,450,000</div>
              <div className="text-[10px] text-emerald-400 font-mono mt-1">13.2% of Total Budget</div>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border">
              <div className="text-[11px] font-mono uppercase text-muted-foreground">Remaining Runway</div>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1">₦16,050,000</div>
              <div className="text-[10px] text-muted-foreground font-mono mt-1">31 Days Remaining</div>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border">
              <div className="text-[11px] font-mono uppercase text-muted-foreground">Avg Cost Per Shot</div>
              <div className="text-2xl font-extrabold text-gold mt-1">₦38,000</div>
              <div className="text-[10px] text-muted-foreground font-mono mt-1">45 Credits Average</div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-border">
            <h3 className="text-sm font-bold text-white mb-3">Recent Studio Billing Statements (Paystack &amp; Stripe)</h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-background/60 border border-border flex items-center justify-between">
                <div>
                  <span className="text-white font-bold">2,500 Credits Batch Allocation</span>
                  <span className="text-muted-foreground ml-3">Ref: pstk_stmt_20260920</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-white font-bold">₦120,000</span>
                  <button className="text-primary hover:underline flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" /> PDF Receipt
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-background/60 border border-border flex items-center justify-between">
                <div>
                  <span className="text-white font-bold">Pro Filmmaker Monthly Subscription</span>
                  <span className="text-muted-foreground ml-3">Ref: strp_sub_20260901</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-white font-bold">$49.00 USD</span>
                  <button className="text-primary hover:underline flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" /> PDF Receipt
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DIRECTOR TAKES APPROVAL */}
      {activeTab === 'approvals' && (
        <div className="glass-panel p-6 rounded-3xl border border-border space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-white">Executive Approval Queue</h3>
              <p className="text-xs text-muted-foreground">Approve completed takes before assembling into the film conform master.</p>
            </div>
            <span className="text-xs font-mono text-muted-foreground">Project: The Lagos Heist</span>
          </div>

          <div className="space-y-3">
            {approvalTakes.map((take) => (
              <div key={take.id} className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    {take.title}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase font-bold ${
                      take.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                      take.status === 'rejected' ? 'bg-accent/20 text-accent' :
                      'bg-gold/20 text-gold'
                    }`}>
                      {take.status}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Director: <strong className="text-gray-300">{take.director}</strong> • Model: {take.model} • Cost: {take.cost}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {take.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleApprove(take.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 transition"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(take.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-card border border-accent/40 text-accent hover:bg-accent/10 font-bold text-xs flex items-center gap-1 transition"
                      >
                        <X className="w-3.5 h-3.5" /> Re-render
                      </button>
                    </>
                  ) : (
                    <span className="text-xs font-mono text-gray-400">Archived in Master Reel</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CAST & CREW */}
      {activeTab === 'crew' && (
        <div className="glass-panel p-6 rounded-3xl border border-border space-y-4">
          <h3 className="text-base font-bold text-white">Active Production Team (RBAC Roster)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-mono">
            {[
              { name: 'Kunle Adebayo', role: 'Director', access: 'Creator & Shot Gen' },
              { name: 'Ngozi Okonjo', role: 'Executive Producer', access: 'Budget & Approvals' },
              { name: 'Chidinma Eze', role: 'Lead Screenwriter', access: 'Cultural Dialogue' },
              { name: 'Tunde Kelani Studios', role: 'Audio & Music', access: 'ElevenLabs Sync' },
              { name: 'AI Persona: Chief Odun', role: 'Digital Twin Lead', access: 'Consistent Character Model' },
              { name: 'Bimpe Pedro', role: 'Editor & Social', access: 'BullMQ Publisher' },
            ].map((c) => (
              <div key={c.name} className="p-4 rounded-xl bg-card border border-border">
                <div className="text-sm font-bold text-white">{c.name}</div>
                <div className="text-accent mt-0.5">{c.role}</div>
                <div className="text-muted-foreground mt-2">Perms: {c.access}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CALL SHEET */}
      {activeTab === 'callsheet' && (
        <div className="glass-panel p-6 rounded-3xl border border-border space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-base font-bold text-white">Daily Production Call Sheet — Day 14</h3>
            <span className="text-xs font-mono text-emerald-400">On Schedule</span>
          </div>
          <div className="text-xs font-mono text-gray-300 space-y-2 leading-relaxed">
            <div><strong>Location:</strong> Victoria Island Rooftop &amp; Marina Pier (AI Virtual Sets)</div>
            <div><strong>Weather Sim:</strong> Thunderstorm &amp; Rain-Slicked Neon Pavement</div>
            <div><strong>Target Takes:</strong> 12 Master Shots (Veo 3.1 &amp; Sora 2)</div>
            <div><strong>Subtitles Required:</strong> Nigerian Pidgin &amp; English [SDH]</div>
          </div>
        </div>
      )}
    </div>
  );
}
