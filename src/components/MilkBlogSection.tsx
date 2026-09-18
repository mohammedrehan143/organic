'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  category: string;
  image: string;
  excerpt: string;
  readTime: string;
}

const POSTS: BlogPost[] = [
  {
    id: 'b1',
    title: 'How Dairy Milk Boosts Performance: Benefits for Bone, Muscle & Energy',
    category: 'Nutrition & Athletics',
    image: '/images/blog-1.png',
    excerpt: 'Science-backed insights on how the natural electrolyte balance, calcium bioavailability, and whey-casein matrix in organic whole milk refuel endurance athletes and active families.',
    readTime: '4 min read',
  },
  {
    id: 'b2',
    title: 'How the High-Quality Protein in Dairy Can Transform Your Diet',
    category: 'Health & Wellness',
    image: '/images/blog-2.png',
    excerpt: 'Unlike synthetic isolate powders, unadulterated pasture milk delivers all 9 essential amino acids alongside vital micronutrients like Vitamin B12, riboflavin, and bio-zinc.',
    readTime: '5 min read',
  },
];

export function MilkBlogSection() {
  return (
    <section id="blog" className="py-14 sm:py-24 px-4 sm:px-6 bg-[#173612] text-white">
      <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12">
        {/* Florida Milk Blog Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-baseline justify-between gap-3 text-center sm:text-left border-b border-white/20 pb-4 sm:pb-6">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <img
              src="/images/milk.png"
              alt="Milk Bottle Icon"
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain filter invert"
            />
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-lg sm:text-2xl font-bold uppercase tracking-wider text-white">
                Milk
              </span>
              <span className="text-3xl sm:text-5xl font-black uppercase text-white font-bebas">
                Blog
              </span>
            </div>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
          {POSTS.map((post) => (
            <div
              key={post.id}
              className="bg-black/25 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/15 hover:border-white/50 transition duration-300 flex flex-col justify-between"
            >
              {/* Image */}
              <div className="relative w-full h-48 sm:h-56 bg-black/40 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-white/95 text-[#173612] px-3 py-0.5 sm:py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow">
                  {post.category}
                </div>
              </div>

              {/* Text */}
              <div className="p-5 sm:p-7 space-y-3 sm:space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl sm:text-3xl font-black uppercase text-white font-bebas tracking-wide leading-tight hover:text-emerald-300 transition">
                    {post.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/85 mt-2 leading-relaxed font-sans line-clamp-3 sm:line-clamp-none">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-3 sm:pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-white/80 font-mono">{post.readTime}</span>
                  <Link
                    href="/in-the-news"
                    className="bg-white hover:bg-white/90 text-[#173612] px-4 sm:px-6 py-2 sm:py-2.5 text-xs font-bold uppercase tracking-wider rounded-full shadow transition inline-flex items-center gap-1.5"
                  >
                    <span>Read More</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
