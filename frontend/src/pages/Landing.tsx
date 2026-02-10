import React from 'react';
import { Link } from 'react-router-dom';
import { FiArchive, FiCpu, FiGlobe, FiLayers, FiShield, FiZap } from 'react-icons/fi';
import AuroraBackground from '../components/aceternity/AuroraBackground';
import { BentoCard, BentoGrid } from '../components/aceternity/BentoGrid';
import Card3D from '../components/aceternity/Card3D';
import TextGenerateEffect from '../components/aceternity/TextGenerateEffect';
import MovingBorderButton from '../components/aceternity/MovingBorderButton';
import Spotlight from '../components/aceternity/Spotlight';
import ThemeToggle from '../components/ThemeToggle';

const GlobeIcon = FiGlobe as React.ComponentType<{ className?: string }>;
const LayersIcon = FiLayers as React.ComponentType<{ className?: string }>;
const ArchiveIcon = FiArchive as React.ComponentType<{ className?: string }>;
const ZapIcon = FiZap as React.ComponentType<{ className?: string }>;
const ShieldIcon = FiShield as React.ComponentType<{ className?: string }>;
const CpuIcon = FiCpu as React.ComponentType<{ className?: string }>;

const Landing: React.FC = () => {
  return (
    <AuroraBackground className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" />
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Second Brain</div>
        <ThemeToggle className="bg-white/50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-700" />
      </header>

      <main className="max-w-7xl mx-auto px-6 pb-20">
        <section className="pt-14 md:pt-20 text-center relative z-10">
          <TextGenerateEffect
            words="Build a living knowledge system with cinematic interactions"
            className="text-4xl md:text-6xl font-semibold leading-tight max-w-4xl mx-auto text-slate-900 dark:text-white"
          />
          <p className="mt-6 text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-lg">
            Capture links, videos, notes, and ideas. Organize with collections, metadata previews, and a gorgeous interface built for your portfolio.
          </p>

          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Link to="/signup">
              <MovingBorderButton className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800">
                Create Account
              </MovingBorderButton>
            </Link>
            <Link to="/login">
              <button className="px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-400 transition text-slate-700 dark:text-slate-200 font-medium bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">
                Sign In
              </button>
            </Link>
          </div>
        </section>

        <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {['Lightning fast search', 'Visual second brain', 'Designed for creators'].map((label) => (
            <Card3D key={label} className="rounded-2xl">
              <div className="rounded-2xl border border-slate-200 dark:border-white/15 bg-white/40 dark:bg-slate-900/60 backdrop-blur-xl p-6 h-full hover:bg-white/60 dark:hover:bg-slate-900/80 transition-colors">
                <p className="text-cyan-600 dark:text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2">Feature</p>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{label}</h3>
                <p className="mt-3 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">Save anything, retrieve everything, and present your thinking beautifully.</p>
              </div>
            </Card3D>
          ))}
        </section>

        <section className="mt-24 relative z-10">
          <h2 className="text-2xl md:text-4xl font-bold mb-8 text-center text-slate-900 dark:text-white">What makes it stand out</h2>
          <BentoGrid>
            <BentoCard title="Metadata Intelligence" description="Auto-enriched previews with title, thumbnail, and domain context." icon={<GlobeIcon />} className="md:col-span-2" />
            <BentoCard title="Collections" description="Structure your knowledge into curated folders." icon={<LayersIcon />} />
            <BentoCard title="Import Ready" description="Bring your existing data from JSON or CSV in seconds." icon={<ArchiveIcon />} />
            <BentoCard title="Cinematic UI" description="Aurora layers, spotlight gradients, and 3D card depth." icon={<ZapIcon />} className="md:col-span-2" />
            <BentoCard title="Secure by Default" description="JWT auth, CORS controls, and request rate limiting." icon={<ShieldIcon />} />
            <BentoCard title="Motion at 60fps" description="Framer Motion micro-interactions tuned for smoothness." icon={<CpuIcon />} />
          </BentoGrid>
        </section>
        <footer className="relative z-10 border-t border-slate-200 dark:border-white/10 mt-20 pt-16 pb-8 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">Second Brain</div>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Your digital extension for capturing, organizing, and retrieving knowledge.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="#" className="hover:text-cyan-500 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-cyan-500 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-cyan-500 transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-cyan-500 transition-colors">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="#" className="hover:text-cyan-500 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-cyan-500 transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-cyan-500 transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-cyan-500 transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="#" className="hover:text-cyan-500 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-cyan-500 transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-cyan-500 transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 border-t border-slate-200 dark:border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              © {new Date().getFullYear()} Second Brain. All rights reserved.
            </p>
            <div className="flex gap-6">
              {['Twitter', 'GitHub', 'Discord'].map((social) => (
                <a key={social} href="#" className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors text-sm">
                  {social}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </main>
    </AuroraBackground>
  );
};

export default Landing;
