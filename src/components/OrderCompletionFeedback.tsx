'use client';

import React, { useState } from 'react';
import { useOrder } from '@/context/OrderContext';
import { Star, Check, Printer, MessageSquareHeart } from 'lucide-react';
import confetti from 'canvas-confetti';

interface OrderCompletionFeedbackProps {
  orderId: string;
  initialRating?: number;
  initialTags?: string[];
  initialNote?: string;
  onOpenBill?: () => void;
}

const COMPLIMENT_TAGS = [
  '⚡ Super Fast Delivery',
  '🔥 Piping Hot & Fresh',
  '📦 Artisan Thermal Packaging',
  '🤤 Delicious Flavour',
  '🛵 Courteous Rider',
  '✨ Perfect Portions',
];

export function OrderCompletionFeedback({
  orderId,
  initialRating = 5,
  initialTags = [],
  initialNote = '',
  onOpenBill,
}: OrderCompletionFeedbackProps) {
  const { submitOrderFeedback } = useOrder();
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [note, setNote] = useState(initialNote);
  const [submitted, setSubmitted] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    await submitOrderFeedback(orderId, rating, selectedTags, note);
    setSubmitted(true);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch (e) {}
  };

  return (
    <div className="p-6 bg-white rounded-3xl border border-cream-200 shadow-warm-sm space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquareHeart className="w-5 h-5 text-banhmi-red" />
          <h3 className="font-bold text-espresso-900 text-base">Rate Your Experience</h3>
        </div>
        {onOpenBill && (
          <button
            onClick={onOpenBill}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cream-300 hover:bg-cream-50 text-espresso-800 text-xs font-semibold transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Thermal Bill</span>
          </button>
        )}
      </div>

      {submitted ? (
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-1">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-2">
            <Check className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-emerald-900">Thank You For Your Feedback!</h4>
          <p className="text-xs text-emerald-700">
            Your review helps our chefs and riders constantly elevate your artisan experience.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Star Rating */}
          <div className="flex items-center justify-center gap-2 py-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = (hoverRating || rating) >= star;
              return (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-125 active:scale-95"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      active
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-cream-300 stroke-1'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Compliment Chips */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-espresso-700 text-center">
              What made your experience wonderful?
            </label>
            <div className="flex flex-wrap justify-center gap-2 pt-1">
              {COMPLIMENT_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                      isSelected
                        ? 'bg-banhmi-red text-cream-50 border-banhmi-red shadow-sm'
                        : 'bg-cream-50 text-espresso-700 border-cream-300 hover:border-banhmi-gold'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note Area */}
          <div>
            <textarea
              rows={2}
              placeholder="Add a personalized chef note or message for the courier..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-3 rounded-xl border border-cream-300 bg-cream-50 text-xs text-espresso-900 focus:outline-none focus:border-banhmi-red"
            />
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full py-3 bg-banhmi-red hover:bg-banhmi-redDark text-cream-50 font-bold text-xs rounded-xl shadow-warm-sm transition"
          >
            Submit Artisan Review
          </button>
        </div>
      )}
    </div>
  );
}
