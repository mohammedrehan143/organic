'use client';

import React from 'react';
import { Sparkles, CheckCircle2, ShieldCheck, Clock, RefreshCw, MessageSquare, PhoneCall } from 'lucide-react';
import { CAFE_METADATA } from '@/data/cafeData';

export function MembershipSection() {
  const perks = [
    {
      icon: Clock,
      title: 'Daily 6:30 AM Morning Delivery',
      desc: 'Wake up to freshly bottled A2 pasture milk chilled and waiting at your doorstep before breakfast.',
    },
    {
      icon: RefreshCw,
      title: 'Doorstep Glass Bottle Exchange',
      desc: 'Eco-friendly sterilized glass bottles replaced every morning. Zero single-use plastic waste.',
    },
    {
      icon: ShieldCheck,
      title: 'Guaranteed Fresh Stock Allocation',
      desc: 'Members receive priority allocation of fresh daily milk, normal white eggs & authentic Nati eggs.',
    },
    {
      icon: MessageSquare,
      title: 'Flexible WhatsApp Management',
      desc: 'Going on holiday? Pause or resume your daily milk subscription anytime with a quick WhatsApp message.',
    },
  ];

  return (
    <section id="membership" className="py-16 sm:py-24 px-4 sm:px-6 bg-[#0F240B] text-white relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#43670F]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-[#173612] text-xs font-black uppercase tracking-wider shadow-lg">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>Farm Direct Club</span>
          </div>

          <h2 className="text-3xl xs:text-4xl sm:text-6xl font-black uppercase tracking-tight text-white font-bebas">
            Zafiroo Farm Membership Available
          </h2>

          <p className="text-sm sm:text-base text-white/85 max-w-2xl mx-auto leading-relaxed">
            Join the Zafiroo Daily Membership for unadulterated A2 milk in sterilized glass bottles and fresh white table eggs delivered cold to your home in Bylanarasapura, Hoskote and surrounding Bangalore areas.
          </p>
        </div>

        {/* Perks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {perks.map((perk, idx) => {
            const Icon = perk.icon;
            return (
              <div
                key={idx}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-emerald-400/50 transition-all duration-300 space-y-3 group"
              >
                <div className="w-12 h-12 rounded-xl bg-white text-[#173612] flex items-center justify-center font-bold shadow-md group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white font-serif">
                  {perk.title}
                </h3>
                <p className="text-xs text-white/70 leading-relaxed">
                  {perk.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Membership CTA Banner */}
        <div className="bg-[#173612] border-2 border-emerald-600/30 rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs uppercase font-black tracking-widest text-emerald-300">
              Zero Commitment • Free Cancellation • Free Delivery
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white font-bebas tracking-wide">
              Start Your Daily Pure Milk & Eggs Plan
            </h3>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              Connect with our farm coordinator to select your daily quantity (1L / 500ml milk, 12 / 30 eggs) and preferred morning drop time.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
            <a
              href={`https://wa.me/${CAFE_METADATA.whatsapp.replace(/[^0-9]/g, '')}?text=Hi%20Zafiroo,%20I%20would%20like%20to%20inquire%20about%20the%20Daily%20Farm%20Membership%20for%20fresh%20milk%20and%20eggs.`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-7 py-4 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 fill-white text-white" />
              <span>Join Membership On WhatsApp</span>
            </a>

            <a
              href={`tel:${CAFE_METADATA.phone.replace(/[^0-9+]/g, '')}`}
              className="w-full sm:w-auto px-6 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm uppercase tracking-wider border border-white/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-white" />
              <span>Call: {CAFE_METADATA.phone}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
