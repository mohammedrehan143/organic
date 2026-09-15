'use client';

import React from 'react';
import Link from 'next/link';

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
    <section id="blog" className="py-24 px-6 bg-[#43670F] text-white">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Florida Milk Blog Header */}
        <div className="text-center sm:text-left flex items-center justify-between flex-wrap gap-4 border-b border-white/20 pb-6">
          <div className="flex items-center gap-3">
            <img
              src="/images/milk.png"
              alt="Milk Bottle Icon"
              className="w-8 h-8 object-contain filter invert"
            />
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-white">
                Milk
              </span>
              <span className="text-4xl sm:text-5xl font-black uppercase text-[#FEEF30] font-bebas">
                Blog
              </span>
            </div>
          </div>

          <Link
            href="/in-the-news"
            className="text-xs uppercase font-bold tracking-widest text-white/90 hover:text-[#FEEF30] transition underline"
          >
            Explore All Harvest Stories →
          </Link>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {POSTS.map((post) => (
            <div
              key={post.id}
              className="bg-black/20 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-[#FEEF30]/50 transition duration-300 flex flex-col justify-between"
            >
              {/* Image */}
              <div className="relative w-full h-56 bg-black/40 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-white/90 text-[#252525] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {post.category}
                </div>
              </div>

              {/* Text */}
              <div className="p-7 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black uppercase text-white font-bebas tracking-wide leading-tight hover:text-[#FEEF30] transition">
                    {post.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/80 mt-2 leading-relaxed font-sans">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <span className="text-xs text-white/60 font-mono">{post.readTime}</span>
                  <Link
                    href="/in-the-news"
                    className="px-6 py-2.5 bg-white text-[#252525] hover:bg-[#FEEF30] hover:text-black font-bold text-xs uppercase tracking-wider rounded shadow transition duration-200"
                  >
                    Read More
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
