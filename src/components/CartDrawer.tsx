'use client';

import React, { useState } from 'react';
import { useOrder } from '@/context/OrderContext';
import { CAFE_METADATA } from '@/data/cafeData';
import { X, Plus, Minus, Trash2, ShoppingBag, Sparkles, ArrowRight, MapPin } from 'lucide-react';
import Image from 'next/image';

export function CartDrawer() {
  const {
    cart,
    cartDrawerOpen,
    setCartDrawerOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    setCheckoutModalOpen,
    userLocation,
    setLocationModalOpen,
  } = useOrder();

  if (!cartDrawerOpen) return null;

  const threshold = CAFE_METADATA.freeDeliveryThreshold;
  const isFreeDelivery = cartSubtotal >= threshold;
  const deliveryFee = isFreeDelivery || cartSubtotal === 0 ? 0 : CAFE_METADATA.deliveryFee;
  const progressPercent = Math.min(100, Math.round((cartSubtotal / threshold) * 100));
  const remainingForFree = Math.max(0, threshold - cartSubtotal);

  const tax = 0;
  const grandTotal = cartSubtotal + deliveryFee;

  const handleCheckoutClick = () => {
    setCartDrawerOpen(false);
    setCheckoutModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fadeIn text-[#173612]">
      <div
        className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-[#EAF3E4]">
          {/* Header */}
          <div className="p-5 border-b border-[#EAF3E4] flex items-center justify-between bg-[#F5FAF0]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#173612]" />
              <h2 className="text-lg font-black text-[#0F240B] font-bebas tracking-wide">
                Organic Farm Basket
              </h2>
              <span className="text-xs bg-[#173612] text-white font-black px-2 py-0.5 rounded-full">
                {cart.length} items
              </span>
            </div>
            <button
              onClick={() => setCartDrawerOpen(false)}
              className="p-2 rounded-full hover:bg-gray-200/60 text-[#173612] transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Location Bar inside cart */}
          <div
            onClick={() => setLocationModalOpen(true)}
            className="px-5 py-2.5 bg-[#ECF5DE] border-b border-[#CBE0A3] flex items-center justify-between cursor-pointer hover:bg-[#E2F0CF] transition"
          >
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="w-3.5 h-3.5 text-[#173612] shrink-0" />
              <div className="truncate text-xs font-semibold">
                <span className="text-[#385A2A] mr-1">Delivering to:</span>
                <span className="font-bold text-[#0F240B] truncate">
                  {userLocation ? userLocation.shortAddress : 'Set Location'}
                </span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#173612] underline shrink-0">
              Change
            </span>
          </div>

          {/* Free Delivery Bar */}
          {cart.length > 0 && (
            <div className="bg-[#FAF9F6] px-5 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between text-xs font-medium text-[#173612] mb-1.5">
                <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                  <span>Free Doorstep Delivery Unlocked For All Items!</span>
                </span>
                <span className="font-bold text-emerald-700">Free</span>
              </div>
              <div className="w-full bg-emerald-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#173612] h-full w-full rounded-full"
                />
              </div>
            </div>
          )}

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-full bg-[#F5FAF0] flex items-center justify-center border border-[#CBE0A3]">
                  <ShoppingBag className="w-8 h-8 text-[#173612]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F240B]">Your farm basket is empty</h3>
                  <p className="text-xs text-[#173612]/80 mt-1 max-w-xs">
                    Treat yourself to our pure A2 farm milk, cultured butter, Vedic ghee, and fresh organic harvest.
                  </p>
                </div>
                <button
                  onClick={() => setCartDrawerOpen(false)}
                  className="btn-darkgreen px-6 py-2.5 text-xs font-bold rounded-full shadow transition"
                >
                  Explore Menu
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3.5 bg-white p-3.5 rounded-2xl border border-[#EAF3E4] shadow-sm"
                >
                  <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                    <Image
                      src={item.menuItem.image}
                      alt={item.menuItem.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-sm font-bold text-[#0F240B] truncate">
                          {item.menuItem.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-rose-600 p-1 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Customization pills */}
                      {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(item.selectedOptions).map(([key, val]) => (
                            <span
                              key={key}
                              className="text-[10px] px-2 py-0.5 bg-[#F5FAF0] text-[#173612] rounded-md border border-[#CBE0A3] font-medium"
                            >
                              {val}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quantity controls & Price */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2 border border-gray-200 rounded-xl p-1 bg-gray-50">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-lg bg-white hover:bg-gray-200 text-[#173612] flex items-center justify-center transition shadow-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-[#0F240B] px-1 min-w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-lg bg-white hover:bg-gray-200 text-[#173612] flex items-center justify-center transition shadow-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-sm font-bold text-[#0F240B]">
                        ₹{item.itemTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-[#EAF3E4] bg-[#F5FAF0] space-y-4">
              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-[#173612] pt-1">
                <div className="flex justify-between">
                  <span>Item Subtotal</span>
                  <span className="font-bold text-[#0F240B]">₹{cartSubtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className={deliveryFee === 0 ? 'text-emerald-700 font-bold' : 'text-[#0F240B] font-semibold'}>
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-[#0F240B] border-t border-gray-200 pt-2 font-bebas tracking-wide text-base">
                  <span>To Pay</span>
                  <span className="text-[#0F240B] text-xl">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons with balanced button layout */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={clearCart}
                  className="h-12 px-4 border-2 border-gray-300 text-[#173612] hover:bg-gray-100 rounded-2xl text-xs font-bold transition flex items-center justify-center"
                  title="Clear Cart"
                >
                  Clear
                </button>
                <button
                  onClick={handleCheckoutClick}
                  className="flex-1 h-12 flex items-center justify-between px-6 bg-[#173612] hover:bg-[#0F240B] text-white font-bold rounded-2xl shadow-md hover:shadow-xl transition active:scale-[0.98]"
                >
                  <span className="font-bold">Checkout</span>
                  <span className="flex items-center gap-1 font-black">
                    ₹{grandTotal.toFixed(2)}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
