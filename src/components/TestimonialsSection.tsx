'use client';

import React from 'react';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

const REVIEWS = [
  {
    name: "Rohan Malhotra",
    location: "Indiranagar, Bengaluru",
    rating: 5,
    title: "The Banh Mi baguette is out of this world",
    text: "The baguette crust crackles the instant you bite into it while staying impossibly airy inside. The pâté and lemongrass pork combination reminds me of the street stalls in Ho Chi Minh City.",
    tag: "Verified Patron",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop"
  },
  {
    name: "Ananya Iyer",
    location: "Defence Colony, Bengaluru",
    rating: 5,
    title: "Unrivaled Cold Brew Crema & Truffle Fries",
    text: "That 18-hour cold brew topped with salted vanilla cream foam is pure wizardry. And they arrive hot and crispy in thermal packaging every single time. Absolutely my favourite cloud kitchen.",
    tag: "Daily Regular",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop"
  },
  {
    name: "Vikramaditya Sengupta",
    location: "HAL 2nd Stage, Bengaluru",
    rating: 5,
    title: "Decadent Molten Lava Cake that actually flows",
    text: "Most delivery lava cakes arrive dried out or rubbery. Zafiroo's Callebaut dark lava cake arrived with a piping hot, glossy liquid center. 10/10 culinary execution.",
    tag: "Verified Epicurean",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200&auto=format&fit=crop"
  }
];

export function TestimonialsSection() {
  return (
    <section className="py-20 px-6 bg-banhmi-card/40 border-y border-cream-200">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cream-100 border border-banhmi-gold/30 text-banhmi-red text-xs font-bold uppercase tracking-wider">
            <span>Patron Acclaim</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-espresso-950 tracking-tight">
            Loved By Coffee & Gourmet Lovers
          </h2>
          <p className="text-sm sm:text-base text-espresso-600">
            Real words from our community who appreciate precision roasting and chef-driven recipes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {REVIEWS.map((review, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-3xl border border-cream-200 shadow-warm-sm flex flex-col justify-between space-y-6 relative hover:shadow-warm-md transition-shadow"
            >
              <Quote className="w-10 h-10 text-banhmi-gold/20 absolute top-6 right-6" />

              <div className="space-y-4">
                <div className="flex items-center gap-1">
                  {[...Array(review.rating)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <h3 className="font-bold text-espresso-900 text-base">
                  &ldquo;{review.title}&rdquo;
                </h3>

                <p className="text-xs sm:text-sm text-espresso-700 leading-relaxed">
                  {review.text}
                </p>
              </div>

              <div className="flex items-center gap-3.5 pt-4 border-t border-cream-100">
                <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 border border-cream-200">
                  <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-espresso-950">{review.name}</h4>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <p className="text-[11px] text-espresso-500">{review.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
