'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Newspaper, Trophy, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

const NEWS_ARTICLES = [
  {
    id: 'n1',
    title: 'Zafiroo Organic Farm Awarded National Regenerative Agriculture Certification',
    category: 'Press Release',
    date: 'September 2026',
    image: '/images/blog-1.png',
    excerpt: 'Recognized for pioneering solar-powered rotational grazing that reduces groundwater depletion by 40% and achieves 100% pesticide-free pastures.',
  },
  {
    id: 'n2',
    title: 'How High-Quality Protein in Organic A2 Dairy Can Transform Your Metabolism',
    category: 'Milk Blog',
    date: 'August 2026',
    image: '/images/blog-2.png',
    excerpt: 'A deep-dive nutritional analysis comparing non-homogenized natural milk proteins against processed synthetic protein isolates.',
  },
  {
    id: 'n3',
    title: 'Florida Dairy Farmers Checkoff Promotion Partners with Organic Artisan Network',
    category: 'Industry Alliance',
    date: 'July 2026',
    image: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=80&w=800&auto=format&fit=crop',
    excerpt: 'Expanding local farm-to-doorstep distribution channels to ensure family dairies receive fair trade prices for their morning harvests.',
  },
];

export default function InTheNewsPage() {
  const [enteredContest, setEnteredContest] = useState(false);
  const [contestName, setContestName] = useState('');
  const [contestEmail, setContestEmail] = useState('');

  const handleContestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contestName && contestEmail) {
      setEnteredContest(true);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#173612]">
      {/* 1. Header Banner */}
      <header className="py-12 sm:py-20 px-4 sm:px-6 bg-[#FAF9F6] border-b border-[#EAF3E4] text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-white border-2 border-[#173612] p-2 flex items-center justify-center shadow-md">
              <Newspaper className="w-8 h-8 text-[#173612]" />
            </div>
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#43670F]">
            Harvest Updates, Science & Community
          </span>
          <h1 className="text-4xl sm:text-6xl font-black uppercase text-[#0F240B] font-bebas tracking-tight">
            In The News
          </h1>
          <p className="text-base sm:text-lg text-[#173612] max-w-2xl mx-auto font-serif leading-relaxed">
            Stay informed with the latest updates from our dairy farms, evidence-based nutrition science, and seasonal giveaways.
          </p>
        </div>
      </header>

      {/* 2. Featured News Grid */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-8 sm:space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-[#0F240B] font-bebas">
            Latest Farm Dispatches
          </h2>
          <p className="text-sm text-[#173612]">Fresh journalism and farm research from our agricultural experts.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {NEWS_ARTICLES.map((art) => (
            <div
              key={art.id}
              className="bg-white rounded-2xl overflow-hidden border border-[#EAF3E4] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative w-full h-56 bg-gray-100 overflow-hidden">
                <img
                  src={art.image}
                  alt={art.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-[#173612] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow">
                  {art.category}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-[#43670F] font-semibold">
                    <span>{art.date}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#0F240B] mt-1 font-serif">
                    {art.title}
                  </h3>
                  <p className="text-xs text-[#173612]/80 mt-2 leading-relaxed">
                    {art.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#173612] uppercase tracking-wider flex items-center gap-1 hover:text-[#43670F] transition cursor-pointer">
                    Read Article <ArrowRight className="w-3.5 h-3.5 text-[#43670F]" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Contests & Sweepstakes */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-[#F5FAF0] border-t border-[#EAF3E4]">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl p-5 sm:p-12 border border-[#EAF3E4] shadow-xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5 text-center">
            <img
              src="/images/article-03.png"
              alt="Contests & Sweepstakes"
              className="w-56 h-auto object-contain mx-auto"
            />
            <span className="inline-block mt-3 px-4 py-1.5 rounded-full bg-[#b2101c] text-white text-xs font-bold uppercase tracking-wider shadow-sm">
              Annual Sweepstakes
            </span>
          </div>

          <div className="md:col-span-7 space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#b2101c]">
                Giveaways & Prizes
              </span>
              <h3 className="text-3xl sm:text-4xl font-black uppercase text-[#0F240B] font-bebas tracking-tight mt-1">
                Win a Year of Free Organic Farm Milk!
              </h3>
            </div>

            <p className="text-sm text-[#173612] font-serif leading-relaxed">
              Enter our seasonal harvest giveaway for your chance to win a 1-year weekly delivery subscription of pure A2 grass-fed milk, cultured butter, and artisanal cheeses delivered to your doorstep.
            </p>

            {enteredContest ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-sm font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>You are officially entered into the sweepstakes! Winner announced October 15.</span>
              </div>
            ) : (
              <form onSubmit={handleContestSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name"
                    value={contestName}
                    onChange={(e) => setContestName(e.target.value)}
                    className="px-4 py-3 rounded-xl border border-gray-300 text-xs font-semibold text-[#173612] focus:outline-none focus:border-[#173612]"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Your Email Address"
                    value={contestEmail}
                    onChange={(e) => setContestEmail(e.target.value)}
                    className="px-4 py-3 rounded-xl border border-gray-300 text-xs font-semibold text-[#173612] focus:outline-none focus:border-[#173612]"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-red w-full sm:w-auto px-6 sm:px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition inline-flex items-center justify-center gap-2 text-center"
                >
                  <span>Enter Sweepstakes Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
