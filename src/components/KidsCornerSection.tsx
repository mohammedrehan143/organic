'use client';

import React from 'react';
import Link from 'next/link';

export function KidsCornerSection() {
  return (
    <section id="kids-corner" className="py-20 px-6 bg-[#EEEEEE] border-b border-gray-200">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Card 1: Kids Corner */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition p-8 text-center flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex justify-center h-44 items-center">
                <img
                  src="/images/article-01.png"
                  alt="SunnyBell Mascot"
                  className="max-h-40 w-auto object-contain hover:scale-105 transition-transform duration-300"
                />
              </div>

              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#252525] font-bebas leading-tight">
                Kids<br />Corner
              </h2>

              <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-sans max-w-md mx-auto">
                Hey kids, welcome to SunnyBell&apos;s Kids Corner. Using interactive video farm tours and activity sheets, follow SunnyBell as she explores her organic pasture farm while learning about the science behind organic dairy, happy cow breeds, and all about nutritious grass-fed milk.
              </p>
            </div>

            <div>
              <Link
                href="/in-the-schools"
                className="inline-block btn-violet px-8 py-3 rounded text-sm font-bold uppercase tracking-wider shadow transition"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Card 2: Contests and Sweepstakes */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition p-8 text-center flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex justify-center h-44 items-center">
                <img
                  src="/images/article-03.png"
                  alt="Organic Dairy Giveaways"
                  className="max-h-40 w-auto object-contain hover:scale-105 transition-transform duration-300"
                />
              </div>

              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#252525] font-bebas leading-tight">
                Contests <br />and Sweepstakes
              </h2>

              <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-sans max-w-md mx-auto">
                Throughout the year, Zafiroo Organic Store gives families the chance to win prizes, artisanal farm gift hampers, and delicious organic dairy subscriptions through seasonal farm challenges. Check out our latest giveaways and take part in the wholesome fun!
              </p>
            </div>

            <div>
              <Link
                href="/in-the-news"
                className="inline-block btn-red px-8 py-3 rounded text-sm font-bold uppercase tracking-wider shadow transition"
              >
                Enter Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
