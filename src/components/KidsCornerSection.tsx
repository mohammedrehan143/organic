'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function KidsCornerSection() {
  return (
    <section id="kids-corner" className="py-14 sm:py-20 px-4 sm:px-6 bg-[#F5FAF0] border-b border-[#EAF3E4] text-[#173612]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
          {/* Card 1: Kids Corner */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition p-5 sm:p-8 text-center flex flex-col justify-between space-y-4 sm:space-y-6 border border-[#EAF3E4]">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-center h-36 sm:h-44 items-center">
                <img
                  src="/images/article-01.png"
                  alt="SunnyBell Mascot"
                  className="max-h-32 sm:max-h-40 w-auto object-contain hover:scale-105 transition-transform duration-300"
                />
              </div>

              <h2 className="text-2xl xs:text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#0F240B] font-bebas leading-tight">
                Kids<br />Corner
              </h2>

              <p className="text-xs sm:text-base text-[#173612] leading-relaxed font-sans max-w-md mx-auto">
                Hey kids, welcome to SunnyBell&apos;s Kids Corner. Using interactive video farm tours and activity sheets, follow SunnyBell as she explores her organic pasture farm while learning about the science behind organic dairy, happy cow breeds, and all about nutritious grass-fed milk.
              </p>
            </div>

            <div className="pt-2 flex justify-center">
              <Link
                href="/in-the-schools"
                className="btn-violet px-6 sm:px-8 py-3 sm:py-3.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition inline-flex items-center gap-2"
              >
                <span>Learn More</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </Link>
            </div>
          </div>

          {/* Card 2: Contests and Sweepstakes */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition p-5 sm:p-8 text-center flex flex-col justify-between space-y-4 sm:space-y-6 border border-[#EAF3E4]">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-center h-36 sm:h-44 items-center">
                <img
                  src="/images/article-03.png"
                  alt="Organic Dairy Giveaways"
                  className="max-h-32 sm:max-h-40 w-auto object-contain hover:scale-105 transition-transform duration-300"
                />
              </div>

              <h2 className="text-2xl xs:text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#0F240B] font-bebas leading-tight">
                Contests <br />and Sweepstakes
              </h2>

              <p className="text-xs sm:text-base text-[#173612] leading-relaxed font-sans max-w-md mx-auto">
                Throughout the year, Zafiroo Organic Dairy Farm gives families the chance to win prizes, artisanal farm gift hampers, and delicious organic dairy subscriptions through seasonal farm challenges. Check out our latest giveaways and take part in the wholesome fun!
              </p>
            </div>

            <div className="pt-2 flex justify-center">
              <Link
                href="/in-the-news"
                className="btn-red px-6 sm:px-8 py-3 sm:py-3.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition inline-flex items-center gap-2"
              >
                <span>Enter Now</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
