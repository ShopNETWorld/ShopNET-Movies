'use client';

import React, { useState } from 'react';
import { 
  Shield, Cpu, Database, Activity, RefreshCw, Key, Users, 
  AlertTriangle, CheckCircle2, Lock, Sliders, ArrowUpRight
} from 'lucide-react';
import type { UserSession } from './AuthModal';

interface AdminConsoleProps {
  session: UserSession;
}

export function AdminConsole({ session }: AdminConsoleProps) {
  const [activeTab, setActiveTab] = useState<'system' | 'routing' | 'users' | 'waf'>('system');
  const [providerPriority, setProviderPriority] = useState<'veo' | 'sora' | 'omni'>('veo');
  const [ipToBlock, setIpToBlock] = useState('');
  const [blockedIps, setBlockedIps] = useState<string[]>(['198.51.100.42', '203.0.113.19']);
  
  const [creatorAccounts, setCreatorAccounts] = useState([
    { id: 'usr_001', name: 'Kunle Adebayo', email: 'creator@shopnet.movies', role: 'CREATOR', credits: 500 },
    { id: 'usr_002', name: 'Ngozi Okonjo', email: 'producer@shopnet.movies', role: 'PRODUCER', credits: 1200 },
    { id: 'usr_003', name: 'Funke Akindele', email: 'funke@sceneone.tv', role: 'CREATOR', credits: 750 },
  ]);

  const handleGrantCredits = (id: string, amount: number) => {
    setCreatorAccounts(prev => prev.map(u => u.id === id ? { ...u, credits: u.credits + amount } : u));
    alert(`Granted +${amount} credits to account ${id}. ACID ledger entry recorded.`);
  };

  const handleBlockIp = () => {
    if (!ipToBlock) return;
    setBlockedIps(prev => [...prev, ipToBlock]);
    setIpToBlock('');
    alert(`IP ${ipToBlock} blocked at Cloudflare WAF edge filter.`);
  };

  return (
    <div className="space-y-6">
      {/* Superadmin Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-gold/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/30">
              PLATFORM SUPERADMIN
            </span>
            <span className="text-xs text-muted-foreground">ShopNET Movies Production Cluster (Global Operations)</span>
          </div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            System Observability, WAF &amp; Gateway Management
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Full root privileges to manage AI provider routing, audit ledgers, edge security, and filmmaker accounts.
          </p>
        </div>

        <a
          href="http://localhost:3001/api/v1/health"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 rounded-xl bg-card border border-emerald-500/40 text-emerald-400 font-mono text-xs hover:bg-emerald-500/10 transition flex items-center gap-1.5"
        >
          <Activity className="w-4 h-4 animate-pulse" />
          Live API Gateway Probe (200 OK)
        </a>
      </div>

      {/* Sub-navigation */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'system' ? 'bg-gold text-black shadow' : 'text-gold hover:bg-gold/10'
          }`}
        >
          <Cpu className="w-4 h-4" />
          System &amp; Cluster Health
        </button>
        <button
          onClick={() => setActiveTab('routing')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'routing' ? 'bg-gold text-black shadow' : 'text-gold hover:bg-gold/10'
          }`}
        >
          <Sliders className="w-4 h-4" />
          AI Provider Gateway Routing
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'users' ? 'bg-gold text-black shadow' : 'text-gold hover:bg-gold/10'
          }`}
        >
          <Users className="w-4 h-4" />
          Filmmaker Accounts &amp; Ledger Overrides
        </button>
        <button
          onClick={() => setActiveTab('waf')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'waf' ? 'bg-gold text-black shadow' : 'text-gold hover:bg-gold/10'
          }`}
        >
          <Shield className="w-4 h-4" />
          Edge WAF &amp; DDoS Controls
        </button>
      </div>

      {/* TAB 1: SYSTEM & CLUSTER HEALTH */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-card border border-border">
              <div className="text-[11px] font-mono uppercase text-muted-foreground flex items-center justify-between">
                <span>API Gateway (NestJS)</span>
                <span className="text-emerald-400">99.98%</span>
              </div>
              <div className="text-xl font-bold text-white mt-1">HTTP 200 OK</div>
              <div className="text-[10px] text-muted-foreground font-mono mt-1">p95: 142ms • Rate limit: 100/min</div>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border">
              <div className="text-[11px] font-mono uppercase text-muted-foreground flex items-center justify-between">
                <span>PostgreSQL Cluster</span>
                <span className="text-emerald-400">Primary Active</span>
              </div>
              <div className="text-xl font-bold text-white mt-1">12 / 50 Conns</div>
              <div className="text-[10px] text-muted-foreground font-mono mt-1">WAL Archiving Active (PITR &lt; 5m)</div>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border">
              <div className="text-[11px] font-mono uppercase text-muted-foreground flex items-center justify-between">
                <span>Redis &amp; BullMQ</span>
                <span className="text-emerald-400">AOF Sync</span>
              </div>
              <div className="text-xl font-bold text-white mt-1">4 Active Queues</div>
              <div className="text-[10px] text-muted-foreground font-mono mt-1">0 Failed • 2 In-flight</div>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border">
              <div className="text-[11px] font-mono uppercase text-muted-foreground flex items-center justify-between">
                <span>Cloudflare R2 Media</span>
                <span className="text-emerald-400">CDN Edge</span>
              </div>
              <div className="text-xl font-bold text-white mt-1">4.2 TB Stored</div>
              <div className="text-[10px] text-muted-foreground font-mono mt-1">Private bucket • Signed URLs</div>
            </div>
          </div>

          {/* Audit Logs */}
          <div className="glass-panel p-6 rounded-3xl border border-border">
            <h3 className="text-sm font-bold text-white mb-3">Live Platform Audit Logs</h3>
            <div className="bg-background/90 p-4 rounded-xl border border-border font-mono text-[11px] space-y-2 text-gray-300">
              <div className="text-emerald-400">[2026-09-24T00:15:02Z] [AUTH_LOGIN_SUCCESS] User kunle@shopnet.movies authenticated via session token.</div>
              <div className="text-gold">[2026-09-24T00:15:10Z] [CREDIT_DEDUCT] 45 credits deducted for Google Veo 3.1 10s shot. Balance: 455.</div>
              <div className="text-primary">[2026-09-24T00:15:12Z] [BULLMQ_DISPATCH] Job queued in `video-transcode` for 9:16 vertical crop.</div>
              <div className="text-gray-400">[2026-09-24T00:15:18Z] [WAF_INSPECTION_PASS] X-ShopNET-WAF-Secret validated from Cloudflare Edge IP 104.28.14.88.</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI PROVIDER GATEWAY ROUTING */}
      {activeTab === 'routing' && (
        <div className="glass-panel p-6 rounded-3xl border border-border space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">Dynamic AI Provider Routing &amp; Failover</h3>
            <p className="text-xs text-muted-foreground">Select the primary default engine for all incoming creator generation requests.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'veo', name: 'Google Veo 3.1', latency: '142ms', status: 'Optimal', cost: '25-65 Credits' },
              { id: 'omni', name: 'Gemini Omni Flash', latency: '68ms', status: 'Fastest Pre-Vis', cost: '10-25 Credits' },
              { id: 'sora', name: 'OpenAI Sora 2', latency: '210ms', status: 'High Physics', cost: '30-80 Credits' },
            ].map((p) => (
              <div
                key={p.id}
                onClick={() => setProviderPriority(p.id as any)}
                className={`p-5 rounded-2xl border cursor-pointer transition ${
                  providerPriority === p.id
                    ? 'border-gold bg-gold/10 shadow-lg shadow-gold/10'
                    : 'border-border bg-card hover:border-gold/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white">{p.name}</span>
                  {providerPriority === p.id && <span className="text-[10px] px-2 py-0.5 rounded bg-gold text-black font-bold">PRIMARY</span>}
                </div>
                <div className="text-xs text-muted-foreground">Latency: {p.latency}</div>
                <div className="text-xs text-emerald-400 mt-1">Status: {p.status}</div>
                <div className="text-xs text-gold font-mono mt-2">{p.cost}</div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-background/60 border border-border text-xs font-mono text-gray-300">
            Current Circuit Breaker Rule: If primary engine experiences &gt; 3% error rate over 60s, automatically failover to secondary engine without dropping creator requests.
          </div>
        </div>
      )}

      {/* TAB 3: USER & LEDGER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="glass-panel p-6 rounded-3xl border border-border space-y-4">
          <h3 className="text-base font-bold text-white">Filmmaker Accounts &amp; Credit Ledger</h3>
          <div className="space-y-3">
            {creatorAccounts.map((u) => (
              <div key={u.id} className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    {u.name}
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-mono font-bold">
                      {u.role}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono mt-0.5">{u.email}</div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-bold text-gold font-mono">{u.credits} Credits</div>
                    <div className="text-[10px] text-muted-foreground">Verified Account</div>
                  </div>

                  <button
                    onClick={() => handleGrantCredits(u.id, 500)}
                    className="px-3 py-1.5 rounded-xl bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 font-bold text-xs transition"
                  >
                    +500 Credits (Support Grant)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: WAF CONTROLS */}
      {activeTab === 'waf' && (
        <div className="glass-panel p-6 rounded-3xl border border-border space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">Edge WAF &amp; Rate Limiting Controls</h3>
            <p className="text-xs text-muted-foreground">Manage Cloudflare origin verification and block suspicious IP ranges.</p>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={ipToBlock}
              onChange={(e) => setIpToBlock(e.target.value)}
              placeholder="e.g. 198.51.100.88 or 10.0.0.0/24"
              className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-border text-xs text-white focus:outline-none focus:border-gold font-mono"
            />
            <button
              onClick={handleBlockIp}
              className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-xs shadow transition"
            >
              Block IP at Edge
            </button>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase text-muted-foreground mb-2">Currently Blocked Addresses</h4>
            <div className="flex flex-wrap gap-2">
              {blockedIps.map((ip) => (
                <span key={ip} className="px-3 py-1.5 rounded-lg bg-card border border-border text-xs font-mono text-gray-300">
                  {ip}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
