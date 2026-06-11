import React from 'react';
import { BRAND } from '@/lib/constants';
import { ShieldCheck, Zap, Globe, LineChart, Lock, Users } from 'lucide-react';

const About: React.FC = () => {
  const features = [
    { icon: Zap, t: 'Automated Returns', d: 'Every active package pays its fixed return automatically every 24 hours — no action needed.' },
    { icon: ShieldCheck, t: 'Verified Transactions', d: 'All deposits and withdrawals are reviewed and approved by our admin team for maximum safety.' },
    { icon: Lock, t: 'Secure by Design', d: 'Powered by Firebase authentication, encrypted sessions and protected user data.' },
    { icon: Globe, t: 'USDT on BSC', d: 'Fast, low-cost transactions on the Binance Smart Chain (BEP-20) network.' },
    { icon: LineChart, t: 'Transparent Growth', d: 'Track your balance, returns and history in real time from a single dashboard.' },
    { icon: Users, t: 'Built for Everyone', d: 'From first-time investors to seasoned traders, our tiered plans scale with you.' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <img src={BRAND.logo} alt="logo" className="w-16 h-16 rounded-2xl mx-auto mb-5" />
        <h2 className="text-4xl font-extrabold text-white mb-3">{BRAND.name}</h2>
        <p className="text-xl bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent font-semibold mb-4">{BRAND.slogan}</p>
        <p className="text-slate-400 leading-relaxed">
          {BRAND.name} is a modern digital investment platform that lets you put your USDT to work through curated
          investment packages. Choose a plan, activate it instantly from your balance, and watch your portfolio grow with
          automated daily returns — all backed by a transparent, admin-verified transaction system.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f) => (
          <div key={f.t} className="rounded-2xl bg-slate-900/60 border border-white/10 p-6 hover:-translate-y-1 transition">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4">
              <f.icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-white mb-1.5">{f.t}</h3>
            <p className="text-sm text-slate-400">{f.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-3xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 p-8 text-center">
        <h3 className="text-2xl font-bold text-white mb-2">Start growing your capital today</h3>
        <p className="text-slate-300">Deposit USDT, activate a package and earn automated returns every single day.</p>
      </div>
    </div>
  );
};

export default About;
