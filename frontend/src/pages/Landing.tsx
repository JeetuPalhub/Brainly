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
    <AuroraBackground className="min-h-screen bg-slate-950 text-slate-100">
      <Spotlight />
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="text-xl font-bold tracking-tight">Second Brain</div>
        <ThemeToggle className="bg-slate-900/80 border-slate-700" />
      </header>

      <main className="max-w-7xl mx-auto px-6 pb-20">
        <section className="pt-14 md:pt-20 text-center">
          <TextGenerateEffect
            words="Build a living knowledge system with cinematic interactions"
            className="text-4xl md:text-6xl font-semibold leading-tight max-w-4xl mx-auto"
          />
          <p className="mt-6 text-slate-300 max-w-2xl mx-auto">
            Capture links, videos, notes, and ideas. Organize with collections, metadata previews, and a gorgeous interface built for your portfolio.
          </p>

          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Link to="/signup">
              <MovingBorderButton>Create Account</MovingBorderButton>
            </Link>
            <Link to="/login">
              <button className="px-5 py-2.5 rounded-xl border border-slate-600 hover:border-slate-400 transition text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">
                Sign In
              </button>
            </Link>
          </div>
        </section>

        <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Lightning fast search', 'Visual second brain', 'Designed for creators'].map((label) => (
            <Card3D key={label} className="rounded-2xl">
              <div className="rounded-2xl border border-white/15 bg-slate-900/60 backdrop-blur-xl p-6">
                <p className="text-cyan-300 text-sm uppercase tracking-wider">Feature</p>
                <h3 className="text-xl font-semibold mt-2">{label}</h3>
                <p className="mt-3 text-slate-300 text-sm">Save anything, retrieve everything, and present your thinking beautifully.</p>
              </div>
            </Card3D>
          ))}
        </section>

        <section className="mt-20">
          <h2 className="text-2xl md:text-3xl font-semibold mb-6">What makes it stand out</h2>
          <BentoGrid>
            <BentoCard title="Metadata Intelligence" description="Auto-enriched previews with title, thumbnail, and domain context." icon={<GlobeIcon />} className="md:col-span-2" />
            <BentoCard title="Collections" description="Structure your knowledge into curated folders." icon={<LayersIcon />} />
            <BentoCard title="Import Ready" description="Bring your existing data from JSON or CSV in seconds." icon={<ArchiveIcon />} />
            <BentoCard title="Cinematic UI" description="Aurora layers, spotlight gradients, and 3D card depth." icon={<ZapIcon />} className="md:col-span-2" />
            <BentoCard title="Secure by Default" description="JWT auth, CORS controls, and request rate limiting." icon={<ShieldIcon />} />
            <BentoCard title="Motion at 60fps" description="Framer Motion micro-interactions tuned for smoothness." icon={<CpuIcon />} />
          </BentoGrid>
        </section>
      </main>
    </AuroraBackground>
  );
};

export default Landing;
