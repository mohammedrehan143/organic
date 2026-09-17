'use client';

import React from 'react';
import Link from 'next/link';
import { Trophy, BookOpen, Smile, CheckCircle, ArrowRight } from 'lucide-react';

const COW_BREEDS = [
  {
    name: 'Gir Cow',
    origin: 'Heritage Indigenous Breed',
    badge: 'A2 Beta-Casein Champion',
    traits: 'Distinctive curved horns and broad forehead. Famous for producing gentle, easily digestible A2 milk with high butterfat content.',
  },
  {
    name: 'Sahiwal Cow',
    origin: 'North-West Pastures',
    badge: 'Heat Tolerant & Hardy',
    traits: 'Reddish-brown coat with sweet temperament. Excellent grazer thriving on diverse wildflowers, clover, and organic grasses.',
  },
  {
    name: 'Jersey Cow',
    origin: 'Channel Islands Heritage',
    badge: 'High Butterfat Legend',
    traits: 'Fawn colored with huge soulful eyes. Produces golden milk renowned for making the highest quality cultured yellow butter.',
  },
];

const SCHOOL_PROGRAMS = [
  {
    title: 'Farm-To-School Fresh Milk Cartons',
    icon: Smile,
    desc: 'Delivering cold, unflavored whole organic milk and chocolate dairy cartons to regional schools within 6 hours of morning pasteurization.',
  },
  {
    title: 'Mooga & Athletic Performance',
    icon: Trophy,
    desc: 'Teaches young student athletes the proven science of refuel: chocolate milk provides the ideal 3:1 carb-to-protein ratio for muscle recovery.',
  },
  {
    title: 'Interactive Farm Virtual Field Trips',
    icon: BookOpen,
    desc: 'SunnyBell leads elementary classes through automated milking robots, maternity barns, and regenerative compost testing laboratories.',
  },
];

export default function InTheSchoolsPage() {
  return (
    <div className="min-h-screen bg-white text-[#173612]">
      {/* 1. Header Banner */}
      <header className="py-12 sm:py-20 px-4 sm:px-6 bg-[#FAF9F6] border-b border-[#EAF3E4] text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-[#FEEF30] border-2 border-[#173612] p-2 flex items-center justify-center shadow-md">
              <BookOpen className="w-8 h-8 text-[#173612]" />
            </div>
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#43670F]">
            Nourishing Growing Minds & Bodies
          </span>
          <h1 className="text-4xl sm:text-6xl font-black uppercase text-[#0F240B] font-bebas tracking-tight">
            In The Schools
          </h1>
          <p className="text-base sm:text-lg text-[#173612] max-w-2xl mx-auto font-serif leading-relaxed">
            Empowering students, educators, and athletes with science-backed dairy nutrition, free classroom resources, and interactive farm fun.
          </p>
        </div>
      </header>

      {/* 2. SunnyBell's Kids Corner Spotlight */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-[#F5FAF0] border-b border-[#EAF3E4]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-10 items-center">
          <div className="md:col-span-5 flex justify-center">
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-lg border border-[#EAF3E4] text-center">
              <img
                src="/images/article-01.png"
                alt="SunnyBell Mascot"
                className="w-52 sm:w-64 h-auto object-contain mx-auto hover:scale-105 transition-transform duration-300"
              />
              <span className="inline-block mt-4 px-4 py-1.5 rounded-full bg-[#7059a6] text-white text-xs font-bold uppercase tracking-wider shadow-sm">
                Official Farm Mascot
              </span>
            </div>
          </div>

          <div className="md:col-span-7 space-y-6">
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-sm font-bold uppercase tracking-wider text-[#7059a6]">
                  Fun Farm Learning
                </span>
                <span className="text-3xl font-black uppercase text-[#0F240B] font-bebas">
                  Kids Corner
                </span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black uppercase text-[#0F240B] font-bebas">
                SunnyBell&apos;s Dairy Discovery
              </h2>
            </div>

            <p className="text-sm sm:text-base text-[#173612] font-serif leading-relaxed">
              Meet SunnyBell, Florida Dairy&apos;s beloved calf! Discover fun interactive games, printable coloring books, and educational experiments about how cows turn sunshine and fresh grass into nutritious milk.
            </p>

            <div className="space-y-3">
              <div className="bg-white p-4 rounded-xl border border-[#EAF3E4] shadow-sm flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#7059a6] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs uppercase text-[#0F240B]">Coloring & Activity Books</h4>
                  <p className="text-xs text-[#385A2A] mt-0.5">Free printable PDF activity sheets for ages 5–12.</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#EAF3E4] shadow-sm flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#7059a6] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs uppercase text-[#0F240B]">Farm Science Experiments</h4>
                  <p className="text-xs text-[#385A2A] mt-0.5">Learn how to make homemade butter in a mason jar.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/menu"
                className="btn-violet px-5 sm:px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition inline-flex items-center justify-center gap-2 text-center"
              >
                <span>
                  <span className="hidden sm:inline">Order Kids Organic Strawberry Milk</span>
                  <span className="sm:hidden">Order Strawberry Milk</span>
                </span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Meet the Cow Breeds */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-8 sm:space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="flex justify-center">
            <img src="/images/icon-cow.png" alt="Cow icon" className="w-12 h-12 object-contain" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-[#0F240B] font-bebas">
            Learn About Cow Breeds
          </h2>
          <p className="text-sm sm:text-base text-[#173612] font-sans">
            Every dairy cow breed has unique characteristics, pasture preferences, and butterfat qualities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {COW_BREEDS.map((breed, idx) => (
            <div
              key={idx}
              className="bg-white p-8 rounded-3xl border border-[#EAF3E4] shadow-sm space-y-4 flex flex-col justify-between hover:shadow-lg transition"
            >
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#43670F] bg-[#F5FAF0] border border-[#CBE0A3] px-3 py-1 rounded-full">
                  {breed.badge}
                </span>
                <h3 className="text-2xl font-black uppercase text-[#0F240B] font-bebas">{breed.name}</h3>
                <p className="text-xs font-bold text-[#385A2A]">{breed.origin}</p>
                <p className="text-xs text-[#173612]/80 leading-relaxed font-sans">{breed.traits}</p>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <span className="text-[11px] font-bold text-[#173612] flex items-center gap-1">
                  ✓ Protected Under Organic Standards
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. School Dairy & Sports Programs */}
      <section className="py-20 px-6 bg-[#FAF9F6] border-t border-[#EAF3E4]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-[#0F240B] font-bebas">
              School Nutrition & Sports Programs
            </h2>
            <p className="text-sm sm:text-base text-[#173612]">
              Supporting student performance on the field and in the classroom.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SCHOOL_PROGRAMS.map((prog, idx) => {
              const Icon = prog.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-8 rounded-2xl border border-[#EAF3E4] shadow-sm space-y-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#FEEF30] border border-[#173612]/20 flex items-center justify-center text-[#173612]">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0F240B] font-serif">{prog.title}</h3>
                  <p className="text-xs text-[#173612]/80 leading-relaxed">{prog.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
