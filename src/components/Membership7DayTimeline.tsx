'use client';

import React from 'react';
import { Check, Clock, Calendar, AlertTriangle, ArrowRight, CreditCard, Sparkles, Milk } from 'lucide-react';
import { MembershipTimelineResult } from '@/lib/membershipTimeline';

interface Membership7DayTimelineProps {
  timeline: MembershipTimelineResult;
  price: number;
  onPayDue?: () => void;
}

export function Membership7DayTimeline({
  timeline,
  price,
  onPayDue,
}: Membership7DayTimelineProps) {
  const { timelineDays, settleDay, isDue, isDueToday, isOverdue, isActive, isUpcoming, currentDayNumber } = timeline;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-white/15 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/15 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-400 text-black flex items-center justify-center font-bold">
            <Milk className="w-4 h-4 text-[#0F240B]" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              <span>7-Day Doorstep Milk Delivery Timeline</span>
            </h4>
            <span className="text-[10px] text-emerald-200">
              {isActive
                ? `Currently on Day ${currentDayNumber} of 7 • Sunrise Deliveries Active`
                : isDueToday
                ? '7 Days Completed! Week-End Bill Due Today'
                : isOverdue
                ? '7-Day Billing Cycle Completed • Bill Overdue'
                : isUpcoming
                ? 'Sunrise deliveries starting soon'
                : '7-Day Postpaid Delivery Schedule'}
            </span>
          </div>
        </div>

        {/* Status indicator badge */}
        <span
          className={`text-[10px] font-black uppercase px-3 py-1 rounded-full self-start sm:self-auto ${
            isDueToday
              ? 'bg-rose-500 text-white animate-pulse'
              : isOverdue
              ? 'bg-rose-600 text-white'
              : isActive
              ? 'bg-emerald-400 text-black font-black'
              : 'bg-amber-300 text-black'
          }`}
        >
          {isDueToday
            ? '🚨 Settle Bill Today'
            : isOverdue
            ? '🚨 Bill Due Now'
            : isActive
            ? `Day ${currentDayNumber} of 7 Active`
            : 'Upcoming Start'}
        </span>
      </div>

      {/* 7-Day Grid Steps */}
      <div className="grid grid-cols-2 xs:grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-2 pt-1">
        {timelineDays.map((day) => {
          const isToday = day.status === 'active_today';
          const isDelivered = day.status === 'delivered';

          return (
            <div
              key={day.dayNumber}
              className={`p-2.5 rounded-2xl border text-center transition flex flex-col justify-between relative ${
                isToday
                  ? 'bg-amber-400 text-black border-amber-300 shadow-lg ring-2 ring-amber-300/60 font-bold scale-[1.03]'
                  : isDelivered
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                  : 'bg-white/5 border-white/10 text-gray-300'
              }`}
            >
              {/* Day Number Tag */}
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className={`font-mono font-black ${isToday ? 'text-black' : 'text-emerald-300'}`}>
                  D{day.dayNumber}
                </span>
                {isDelivered ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : isToday ? (
                  <span className="w-2 h-2 rounded-full bg-black animate-ping shrink-0" />
                ) : (
                  <Clock className="w-3 h-3 text-gray-400 shrink-0" />
                )}
              </div>

              {/* Date & Day */}
              <div className="my-1">
                <div className={`text-xs font-black ${isToday ? 'text-black' : 'text-white'}`}>
                  {day.formattedDate}
                </div>
                <div className={`text-[10px] ${isToday ? 'text-black/80 font-bold' : 'text-gray-400'}`}>
                  {day.dayName}
                </div>
              </div>

              {/* Pill status */}
              <div
                className={`mt-1 py-0.5 px-1 rounded-md text-[9px] font-black uppercase tracking-wider truncate ${
                  isToday
                    ? 'bg-black text-amber-300'
                    : isDelivered
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-white/10 text-gray-400'
                }`}
              >
                {day.label}
              </div>
            </div>
          );
        })}

        {/* Step 8: End Date / Settlement Day (e.g. 10th) */}
        <div
          className={`p-2.5 rounded-2xl border text-center transition flex flex-col justify-between relative ${
            isDueToday || isOverdue
              ? 'bg-rose-600 text-white border-rose-300 shadow-xl ring-2 ring-rose-400 font-bold scale-[1.04]'
              : 'bg-white/5 border-white/10 text-gray-300'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className={`font-mono font-black ${isDueToday || isOverdue ? 'text-amber-300' : 'text-amber-400'}`}>
              END
            </span>
            <AlertTriangle className={`w-3.5 h-3.5 ${isDueToday || isOverdue ? 'text-amber-300 animate-bounce' : 'text-amber-400'}`} />
          </div>

          <div className="my-1">
            <div className={`text-xs font-black ${isDueToday || isOverdue ? 'text-white' : 'text-amber-300'}`}>
              {settleDay.formattedDate}
            </div>
            <div className={`text-[10px] ${isDueToday || isOverdue ? 'text-rose-100' : 'text-gray-400'}`}>
              {settleDay.dayName}
            </div>
          </div>

          <div
            className={`mt-1 py-0.5 px-1 rounded-md text-[9px] font-black uppercase tracking-wider truncate ${
              isDueToday || isOverdue
                ? 'bg-amber-300 text-black font-black'
                : 'bg-amber-400/20 text-amber-300'
            }`}
          >
            {settleDay.label}
          </div>
        </div>
      </div>

      {/* Bill Due Notice / Payment Button */}
      {(isDueToday || isOverdue || isDue) && onPayDue ? (
        <div className="pt-2">
          <div className="p-3.5 bg-rose-600/90 rounded-2xl border border-rose-300 flex flex-col sm:flex-row items-center justify-between gap-3 text-white">
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-5 h-5 text-amber-300 shrink-0" />
              <div>
                <strong className="block text-xs font-black uppercase tracking-wide text-white">
                  Week-End Settlement Due on {settleDay.formattedDate} ({settleDay.dayName})
                </strong>
                <span className="text-[11px] text-rose-100">
                  Your 7-day milk pass is completed. Settle ₹{price ? price.toLocaleString('en-IN') : '504'} to renew.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onPayDue}
              className="w-full sm:w-auto px-4 py-2.5 bg-amber-300 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span>Pay 7-Day Bill (₹{price ? price.toLocaleString('en-IN') : '504'})</span>
              <ArrowRight className="w-3.5 h-3.5 text-black" />
            </button>
          </div>
        </div>
      ) : isActive && onPayDue ? (
        <div className="pt-1 flex items-center justify-between text-[11px] text-emerald-200">
          <span>Fresh milk deliveries arrive every morning between 6:00 AM - 7:30 AM.</span>
          <button
            type="button"
            onClick={onPayDue}
            className="text-amber-300 hover:underline font-bold text-xs shrink-0 cursor-pointer"
          >
            Settle Bill Early &rarr;
          </button>
        </div>
      ) : null}
    </div>
  );
}
