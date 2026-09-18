'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, ShieldCheck, Heart, Sun, Droplets, CheckCircle2 } from 'lucide-react';

const FARMERS = [
  {
    name: 'The Larson Family',
    location: 'Okeechobee Pastures',
    cows: '180 Grass-Fed Gir Cows',
    experience: '3rd Generation Dairy Stewardship',
    image: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?q=80&w=800&auto=format&fit=crop',
    quote: 'Our cows graze freely under open skies. When cows are calm, healthy, and pasture-fed, the milk they produce is naturally sweeter, creamier, and richer in nutrients.',
  },
  {
    name: 'The Shenandoah Farm Collective',
    location: 'Highland Meadows',
    cows: '220 Free-Range Sahiwal Herd',
    experience: 'Certified Organic Since 1994',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop',
    quote: 'We believe true dairy farming means honoring the soil and water. We rotate our pastures daily so the grasses regenerate naturally without synthetic chemicals.',
  },
  {
    name: 'The Roff & Sons Dairy',
    location: 'Green Valley Watershed',
    cows: '140 Indigenous A2 Cows',
    experience: 'Vedic Bilona & Raw Milk Specialists',
    image: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=80&w=800&auto=format&fit=crop',
    quote: 'Every single batch of our morning harvest is tested for zero antibiotics and zero adulteration before it is poured into sterile reusable glass bottles.',
  },
];

const PRACTICES = [
  {
    title: 'Humane Pasture Care',
    icon: Heart,
    desc: 'Our cows spend 300+ days a year on lush green pastures with 24/7 access to clean spring water, shade groves, and soft bedding barns.',
  },
  {
    title: 'Zero Hormones or rBST',
    icon: ShieldCheck,
    desc: 'Strictly zero synthetic growth hormones, preventative antibiotics, or artificial stimulants. Only wholesome natural grain and clover diets.',
  },
  {
    title: 'Solar Powered Dairies',
    icon: Sun,
    desc: 'Our farm cooling tanks and solar milking parlors operate with 100% renewable rooftop solar arrays, reducing carbon emissions by 65%.',
  },
  {
    title: 'Water Recycling & Composting',
    icon: Droplets,
    desc: '100% of farm organic waste is converted into nutrient-dense bio-fertilizer for our heirloom fodder fields, creating a closed-loop ecosystem.',
  },
];

export default function OnTheFarmPage() {
  return (
    <div className="min-h-screen bg-white text-[#173612]">
      {/* 1. Subpage Header Banner with Florida Milk Emblem Style */}
      <header className="relative w-full py-12 sm:py-20 px-4 sm:px-6 bg-[#FAF9F6] border-b border-[#EAF3E4] text-center overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-white border-2 border-[#173612] p-2 flex items-center justify-center shadow-md">
              <img src="/images/icon-cow.png" alt="Cow icon" className="w-12 h-12 object-contain" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#43670F]">
              Generations of Dedicated Dairy Stewards
            </span>
            <h1 className="text-4xl sm:text-6xl font-black uppercase text-[#0F240B] font-bebas tracking-tight">
              On The Farm
            </h1>
            <p className="text-base sm:text-lg text-[#173612] max-w-2xl mx-auto font-serif leading-relaxed">
              Delivering wholesome dairy products from our family farms to your table with unyielding love for our land and cows.
            </p>
          </div>
        </div>
      </header>

      {/* 2. Meet Our Farmers Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="flex justify-center">
            <img src="/images/victor.png" alt="Farm families" className="w-20 h-auto object-contain" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-black lowercase tracking-tight text-[#0F240B] font-serif">
            meet our farmers
          </h2>
          <p className="text-sm sm:text-base text-[#173612]">
            Get to know the dedicated multigenerational farm families who wake up before dawn every day to harvest your fresh milk.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FARMERS.map((farmer, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl overflow-hidden border border-[#EAF3E4] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative w-full h-64 overflow-hidden bg-gray-100">
                <img
                  src={farmer.image}
                  alt={farmer.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold text-[#173612] shadow border border-[#173612]/20">
                  {farmer.location}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-[#0F240B] font-serif">{farmer.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-[#43670F] font-bold mt-1">
                    <span>{farmer.experience}</span>
                    <span>•</span>
                    <span>{farmer.cows}</span>
                  </div>
                  <p className="text-xs text-[#173612]/80 italic mt-3 leading-relaxed">
                    &ldquo;{farmer.quote}&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <span className="text-[11px] font-bold text-[#173612] uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#43670F]" />
                    Verified Organic Pastures
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Sustainable Farm Practices */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-[#F5FAF0] border-y border-[#EAF3E4]">
        <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#0F240B] font-bebas">
              Farm Practices & Cow Care
            </h2>
            <p className="text-sm sm:text-base text-[#173612] font-sans">
              Our organic farming standards exceed national standards. We hold animal welfare, soil health, and milk purity above all else.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRACTICES.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-7 rounded-2xl border border-[#EAF3E4] shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#F5FAF0] border border-[#173612]/20 flex items-center justify-center text-[#173612]">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#0F240B] font-serif">{p.title}</h3>
                    <p className="text-xs text-[#173612]/80 mt-2 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Pipeline: From Farm to Fridge */}
      <section className="py-14 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto space-y-8 sm:space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-[#0F240B] font-bebas">
            From The Farm To Your Fridge
          </h2>
          <p className="text-sm sm:text-base text-[#173612]">
            How our wholesome organic dairy travels from our happy cows into your morning cup in under 12 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div className="bg-white p-6 rounded-2xl border border-[#EAF3E4] shadow-sm space-y-3">
            <span className="w-10 h-10 rounded-full bg-[#173612] text-white font-bold flex items-center justify-center mx-auto text-sm">
              1
            </span>
            <h4 className="font-bold text-base text-[#0F240B]">Gentle Milking</h4>
            <p className="text-xs text-[#173612]/80 leading-relaxed">
              Cows enter clean, temperature-controlled milking parlors calmly at their own pace.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#EAF3E4] shadow-sm space-y-3">
            <span className="w-10 h-10 rounded-full bg-[#173612] text-white font-bold flex items-center justify-center mx-auto text-sm">
              2
            </span>
            <h4 className="font-bold text-base text-[#0F240B]">Immediate 4°C Chilling</h4>
            <p className="text-xs text-[#173612]/80 leading-relaxed">
              Milk is filtered and cooled to 4°C within seconds to protect natural enzymes and freshness.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#EAF3E4] shadow-sm space-y-3">
            <span className="w-10 h-10 rounded-full bg-[#173612] text-white font-bold flex items-center justify-center mx-auto text-sm">
              3
            </span>
            <h4 className="font-bold text-base text-[#0F240B]">Glass Bottle Sealing</h4>
            <p className="text-xs text-[#173612]/80 leading-relaxed">
              Bottled in sanitized glass bottles with tamper-evident seals to prevent microplastics.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#EAF3E4] shadow-sm space-y-3">
            <span className="w-10 h-10 rounded-full bg-[#173612] text-white font-bold flex items-center justify-center mx-auto text-sm">
              4
            </span>
            <h4 className="font-bold text-base text-[#0F240B]">Strict OTP Handover</h4>
            <p className="text-xs text-[#173612]/80 leading-relaxed">
              Dispatched in thermal boxes and delivered directly to your doorstep with 4-digit verification.
            </p>
          </div>
        </div>

        {/* CTA with balanced button layout */}
        <div className="text-center pt-8 flex justify-center">
          <Link
            href="/menu"
            className="btn-motive inline-flex items-center justify-center gap-2 px-6 sm:px-10 py-3.5 sm:py-4 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition transform hover:scale-105 text-[#173612]"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>
              <span className="hidden sm:inline">Order Pure Farm Milk & Goods Now</span>
              <span className="sm:hidden">Order Pure Farm Milk</span>
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
