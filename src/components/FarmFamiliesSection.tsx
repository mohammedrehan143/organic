'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function FarmFamiliesSection() {
  return (
    <section id="farm-families" className="py-14 sm:py-24 px-4 sm:px-6 bg-white text-center border-b border-gray-100 text-[#173612]">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Florida Milk Victor Farm Emblem */}
        <div className="flex justify-center">
          <img
            src="/images/victor.png"
            alt="Organic Farm Families Emblem"
            className="w-20 sm:w-24 h-auto object-contain"
          />
        </div>

        {/* Section Header */}
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#0F240B] lowercase tracking-tight font-serif">
          our farm families
        </h2>

        {/* Narrative Paragraph */}
        <p className="text-sm sm:text-lg text-[#173612] leading-relaxed font-serif max-w-3xl mx-auto px-2">
          For generations, our organic dairy farm families have remained true to their values and committed to producing a fresh supply of wholesome, pure organic milk and farm-fresh produce. These hardworking men and women are caretakers of their pasture-raised cows, stewards of the land, and leaders in their communities.
        </p>

        {/* Action Button: responsive text prevents mobile overflow */}
        <div className="pt-2 sm:pt-4 flex justify-center">
          <Link
            href="/on-the-farm"
            className="btn-motive inline-flex items-center gap-2 px-6 sm:px-10 py-3.5 sm:py-4 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-full shadow-md hover:shadow-lg transition text-center"
          >
            <span className="hidden sm:inline">Meet some of our dedicated organic farm families</span>
            <span className="sm:hidden">Meet Our Farm Families</span>
            <ArrowRight className="w-4 h-4 text-[#173612] shrink-0" />
          </Link>
        </div>
      </div>
    </section>
  );
}
