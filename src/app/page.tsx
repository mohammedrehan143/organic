'use client';

import React from 'react';
import { ZafirooHero } from '@/components/ZafirooHero';
import { FarmFamiliesSection } from '@/components/FarmFamiliesSection';
import { KidsCornerSection } from '@/components/KidsCornerSection';
import { FeaturedRecipesSection } from '@/components/FeaturedRecipesSection';
import { FarmShopSection } from '@/components/FarmShopSection';
import { MilkBlogSection } from '@/components/MilkBlogSection';

export default function HomePage() {
  return (
    <div className="w-full bg-white text-[#252525]">
      {/* 1. Florida Milk Parallax Hero with Video Background & Iconic Yellow Emblem */}
      <ZafirooHero />

      {/* 2. Florida Milk "our farm families" Section */}
      <FarmFamiliesSection />

      {/* 3. Florida Milk Kids Corner & Contests / Sweepstakes */}
      <KidsCornerSection />

      {/* 4. Florida Milk Featured Recipe Section */}
      <FeaturedRecipesSection />

      {/* 5. Direct Organic Farm Store (Shop Fresh Milk, Butter, Ghee, Eggs) */}
      <FarmShopSection />

      {/* 6. Florida Milk Green "Milk Blog" Section */}
      <MilkBlogSection />
    </div>
  );
}
