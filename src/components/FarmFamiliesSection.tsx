'use client';

import React from 'react';
import Link from 'next/link';

export function FarmFamiliesSection() {
  return (
    <section id="farm-families" className="py-24 px-6 bg-white text-center border-b border-gray-100">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Florida Milk Victor Farm Emblem */}
        <div className="flex justify-center">
          <img
            src="/images/victor.png"
            alt="Organic Farm Families Emblem"
            className="w-24 h-auto object-contain"
          />
        </div>

        {/* Section Header matching Florida Milk exact typography */}
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#252525] lowercase tracking-tight font-serif">
          our farm families
        </h2>

        {/* Narrative Paragraph */}
        <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-serif max-w-3xl mx-auto">
          For generations, our organic dairy farm families have remained true to their values and committed to producing a fresh supply of wholesome, pure organic milk and farm-fresh produce. These hardworking men and women are caretakers of their pasture-raised cows, stewards of the land, and leaders in their communities.
        </p>

        {/* Florida Milk .btn-motive Button */}
        <div className="pt-4">
          <Link
            href="/on-the-farm"
            className="inline-block btn-motive px-8 sm:px-10 py-4 text-xs sm:text-sm font-bold uppercase tracking-wider rounded shadow hover:shadow-md transition"
          >
            Meet some of our dedicated organic farm families
          </Link>
        </div>
      </div>
    </section>
  );
}
