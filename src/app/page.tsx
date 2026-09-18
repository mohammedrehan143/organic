'use client';

import React from 'react';
import { ZafirooHero } from '@/components/ZafirooHero';
import { FarmShopSection } from '@/components/FarmShopSection';

export default function HomePage() {
  return (
    <div className="w-full bg-white text-[#173612]">
      {/* 1. Hero with Video Background & Open Header */}
      <ZafirooHero />

      {/* 2. Direct Organic Farm Store (Shop Fresh Milk, Ghee, White Eggs) */}
      <FarmShopSection />
    </div>
  );
}
