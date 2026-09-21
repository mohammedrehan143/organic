'use client';

import React, { useState } from 'react';
import { useOrder } from '@/context/OrderContext';
import { Star, MessageSquareHeart, Check, Printer } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FeedbackProps {
  orderId: string;
  initialRating?: number;
  initialTags?: string[];
  initialNote?: string;
  onOpenBill?: () => void;
}

const COMPLIMENT_TAGS = [
  '🥛 Ultra Fresh Milk',
  '❄️ Fresh to Doorstep',
  '⏱️ Speedy Farm Dispatch',
  '📦 Tamper-Proof Sealed',
  '🧈 Rich Creamy Texture',
  '🌱 Pure Organic Taste',
];

export function OrderCompletionFeedback({
  orderId,
  initialRating = 5,
  initialTags = [],
  initialNote = '',
  onOpenBill,
}: FeedbackProps) {
  const { submitOrderFeedback } = useOrder();
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [note, setNote] = useState(initialNote);
  const [submitted, setSubmitted] = useState(!!initialRating);

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
    <div className="p-4 sm:p-6 bg-white rounded-3xl border border-[#EAF3E4] shadow-sm space-y-4 sm:space-y-5 text-[#173612]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MessageSquareHeart className="w-5 h-5 text-[#173612] shrink-0" />
          <h3 className="font-bold text-[#0F240B] text-sm sm:text-base">Rate Your Organic Farm Experience</h3>
        </div>
        {onOpenBill && (
          <button
            onClick={onOpenBill}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-300 hover:bg-[#F5FAF0] text-[#173612] text-xs font-semibold transition"
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
          <h4 className="text-sm font-bold text-emerald-900">Thank You For Supporting Local Dairy Farms!</h4>
          <p className="text-xs text-emerald-700">
            Your review helps our dedicated farmers and dispatch couriers maintain highest purity standards.
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
                        : 'text-gray-300 stroke-1'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Compliment Chips */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#173612] text-center">
              What made your farm delivery special?
            </label>
            <div className="flex flex-wrap justify-center gap-2 pt-1">
              {COMPLIMENT_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition ${
                      isSelected
                        ? 'bg-[#173612] text-white border-[#173612] shadow-sm'
                        : 'bg-[#F5FAF0] text-[#173612] border-[#CBE0A3] hover:bg-[#EAF3E4]'
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
              placeholder="Add a farm appreciation note or message for the rider..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-[#173612] focus:outline-none focus:border-[#173612]"
            />
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full py-3 bg-[#173612] hover:bg-[#0F240B] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition"
          >
            Submit Farm Review
          </button>
        </div>
      )}
    </div>
  );
}
