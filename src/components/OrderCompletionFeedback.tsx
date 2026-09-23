'use client';

import React, { useState } from 'react';
import { useOrder } from '@/context/OrderContext';
import { Star, MessageSquareHeart, Check, Loader2, Edit3, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FeedbackProps {
  orderId: string;
  initialRating?: number;
  initialTags?: string[];
  initialNote?: string;
  onOpenBill?: () => void;
  onFeedbackSubmitted?: (orderId: string, rating: number, tags: string[], note?: string) => void;
}

const COMPLIMENT_TAGS = [
  '🥛 Pure Farm Milk',
  '🥚 Fresh Country Eggs',
  '⚡ Super Fast Delivery',
  '🛵 Courteous Partner (Syed)',
  '📦 Safe Tamper-Proof Pack',
  '🌱 100% Certified Organic',
];

const RATING_LABELS: Record<number, string> = {
  1: '⭐ Needs Improvement',
  2: '⭐⭐ Fair Quality',
  3: '⭐⭐⭐ Good Experience',
  4: '⭐⭐⭐⭐ Very Fresh & Prompt',
  5: '⭐⭐⭐⭐⭐ Outstanding & Pure Farm-Fresh!',
};

export function OrderCompletionFeedback({
  orderId,
  initialRating,
  initialTags = [],
  initialNote = '',
  onOpenBill,
  onFeedbackSubmitted,
}: FeedbackProps) {
  const { submitOrderFeedback } = useOrder();
  const hasExistingRating = Boolean(initialRating && initialRating > 0);

  const [rating, setRating] = useState<number>(initialRating || 5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags || []);
  const [note, setNote] = useState<string>(initialNote || '');
  const [submitted, setSubmitted] = useState<boolean>(hasExistingRating);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitOrderFeedback(orderId, rating, selectedTags, note);
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted(orderId, rating, selectedTags, note);
      }
      setSubmitted(true);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
        });
      } catch (e) {}
    } catch (err) {
      console.warn('Feedback submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeRating = hoverRating || rating;

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-b from-[#F9FCF7] to-white rounded-3xl border-2 border-[#D7EAC8] shadow-sm space-y-4 sm:space-y-5 text-[#173612] transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#EAF3E4]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#173612] text-white flex items-center justify-center shrink-0 shadow-xs">
            <MessageSquareHeart className="w-4 h-4 fill-emerald-400 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-black text-[#0F240B] text-sm sm:text-base tracking-tight">
              Order Delivered! How was your experience?
            </h3>
            <p className="text-[11px] text-[#385A2A] font-medium">
              Your honest review helps our local dairy farmers and Syed.
            </p>
          </div>
        </div>
        {onOpenBill && (
          <span className="self-start sm:self-auto text-[11px] font-bold text-[#2E6125] bg-[#EAF3E4] px-2.5 py-1 rounded-lg">
            ✓ Verified Farm Delivery
          </span>
        )}
      </div>

      {submitted ? (
        <div className="p-4 sm:p-5 bg-emerald-50/90 rounded-2xl border border-emerald-200 text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Check className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-black text-emerald-950">
              Thank You For Your Review!
            </h4>
            <p className="text-xs text-emerald-800 mt-1 max-w-md mx-auto">
              Your feedback has been saved and shared with Syed and our dairy farm team.
            </p>
          </div>

          {/* Submitted Summary */}
          <div className="p-3 bg-white/80 rounded-xl border border-emerald-200/60 max-w-sm mx-auto text-center space-y-1.5">
            <div className="flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= rating
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-gray-300 stroke-1'
                  }`}
                />
              ))}
              <span className="text-xs font-bold text-[#0F240B] ml-1.5">
                ({rating}/5)
              </span>
            </div>
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1 pt-1">
                {selectedTags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] font-bold px-2 py-0.5 bg-[#EAF3E4] text-[#173612] rounded-md"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
            {note && (
              <p className="text-xs italic text-gray-700 pt-1">
                &ldquo;{note}&rdquo;
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#173612] hover:text-[#0F240B] underline cursor-pointer pt-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Update / Edit Your Review</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Star Rating Selection */}
          <div className="text-center space-y-1">
            <label className="block text-xs font-black uppercase tracking-wider text-[#0F240B]">
              Tap Stars to Rate
            </label>
            <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 py-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = activeRating >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1.5 transition-transform hover:scale-125 active:scale-95 cursor-pointer rounded-lg focus:outline-none"
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                        active
                          ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                          : 'text-gray-300 stroke-1'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <p className="text-xs font-bold text-[#2E6125] h-5 transition-all">
              {RATING_LABELS[activeRating] || ''}
            </p>
          </div>

          {/* Compliment Chips */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-black text-[#0F240B] text-center">
              What did you love most about this delivery?
            </label>
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 pt-1">
              {COMPLIMENT_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold border transition transform active:scale-95 cursor-pointer ${
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
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-[#385A2A]">
              Optional Message / Compliment:
            </label>
            <textarea
              rows={2}
              placeholder="e.g., Milk was cold and fresh, Syed was very polite and on time!"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-3 rounded-2xl border border-gray-300 bg-white text-xs font-medium text-[#173612] focus:outline-none focus:border-[#173612] focus:ring-1 focus:ring-[#173612] shadow-xs"
            />
          </div>

          {/* Submit Button */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="w-full py-3.5 bg-[#173612] hover:bg-[#0F240B] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md hover:shadow-lg transition transform active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Submitting Feedback...</span>
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                <span>Submit Feedback & Rating</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
