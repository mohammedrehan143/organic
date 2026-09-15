'use client';

import React, { useState } from 'react';
import { useOrder } from '@/context/OrderContext';
import { CAFE_METADATA } from '@/data/cafeData';
import { X, Plus, Minus, Trash2, ShoppingBag, Sparkles, ArrowRight, Heart } from 'lucide-react';
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
  } = useOrder();

  const [tip, setTip] = useState(30);

  if (!cartDrawerOpen) return null;

  const threshold = CAFE_METADATA.freeDeliveryThreshold;
  const isFreeDelivery = cartSubtotal >= threshold;
  const deliveryFee = isFreeDelivery || cartSubtotal === 0 ? 0 : CAFE_METADATA.deliveryFee;
  const progressPercent = Math.min(100, Math.round((cartSubtotal / threshold) * 100));
  const remainingForFree = Math.max(0, threshold - cartSubtotal);

  const tax = Math.round(cartSubtotal * CAFE_METADATA.taxRate * 100) / 100;
  const grandTotal = cartSubtotal + deliveryFee + tax + tip;

  const handleCheckoutClick = () => {
    setCartDrawerOpen(false);
    setCheckoutModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="fixed inset-y-0 right-0 max-w-full flex pl-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-screen max-w-md bg-banhmi-bg shadow-2xl flex flex-col border-l border-cream-200">
          {/* Header */}
          <div className="p-5 border-b border-cream-200 flex items-center justify-between bg-white/50 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#43670F]" />
              <h2 className="text-lg font-bold text-[#252525]">Organic Farm Basket</h2>
              <span className="text-xs bg-gray-200 text-[#252525] font-semibold px-2 py-0.5 rounded-full">
                {cart.length} items
              </span>
            </div>
            <button
              onClick={() => setCartDrawerOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Delivery Bar */}
          {cart.length > 0 && (
            <div className="bg-[#FAF9F6] px-5 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between text-xs font-medium text-gray-800 mb-1.5">
                {isFreeDelivery ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    You unlocked FREE farm-fresh delivery!
                  </span>
                ) : (
                  <span>
                    Add <strong className="text-[#43670F]">₹{remainingForFree}</strong> more for{' '}
                    <strong>FREE delivery</strong>
                  </span>
                )}
                <span className="font-bold">{progressPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#FEEF30] to-[#43670F] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border border-gray-300">
                  <ShoppingBag className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-800">Your farm basket is empty</h3>
                  <p className="text-xs text-gray-600 mt-1 max-w-xs">
                    Treat yourself to our pure A2 farm milk, cultured butter, Vedic ghee, and fresh organic harvest.
                  </p>
                </div>
                <button
                  onClick={() => setCartDrawerOpen(false)}
                  className="px-6 py-2.5 bg-banhmi-red text-cream-50 text-xs font-bold rounded-xl shadow-warm-sm hover:bg-banhmi-redDark transition"
                >
                  Explore Menu
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3.5 bg-white p-3.5 rounded-2xl border border-cream-200 shadow-sm"
                >
                  <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-espresso-100">
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
                        <h4 className="text-sm font-bold text-espresso-900 truncate">
                          {item.menuItem.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-espresso-400 hover:text-rose-600 p-1 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Customization pills */}
                      {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(item.selectedOptions).map(([k, v]) => (
                            <span
                              key={k}
                              className="text-[10px] bg-cream-100 text-espresso-700 px-2 py-0.5 rounded-md border border-cream-200"
                            >
                              {v}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-cream-100">
                      <span className="text-xs font-bold text-banhmi-red">
                        ₹{item.itemTotal}
                      </span>
                      <div className="flex items-center gap-2 bg-cream-50 px-2 py-1 rounded-xl border border-cream-200">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-0.5 rounded text-espresso-600 hover:text-espresso-950"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-espresso-900 w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-0.5 rounded text-espresso-600 hover:text-espresso-950"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer / Bill Summary */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-cream-200 bg-white/70 backdrop-blur-md space-y-4">
              {/* Delivery Tip Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-espresso-800">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-rose-500 fill-current" />
                    Delivery Partner Tip
                  </span>
                  {tip > 0 && <span className="text-banhmi-red font-bold">₹{tip}</span>}
                </div>
                <div className="flex gap-2">
                  {[0, 20, 30, 50].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setTip(amount)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition ${
                        tip === amount
                          ? 'bg-banhmi-red text-cream-50 border-banhmi-red'
                          : 'bg-cream-50 text-espresso-700 border-cream-300 hover:border-banhmi-gold'
                      }`}
                    >
                      {amount === 0 ? 'None' : `₹${amount}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-espresso-700 border-t border-cream-200 pt-3">
                <div className="flex justify-between">
                  <span>Item Subtotal</span>
                  <span className="font-semibold text-espresso-900">₹{cartSubtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className={deliveryFee === 0 ? 'text-emerald-600 font-semibold' : 'text-espresso-900'}>
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span>₹{tax}</span>
                </div>
                {tip > 0 && (
                  <div className="flex justify-between">
                    <span>Partner Tip</span>
                    <span>₹{tip}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-espresso-950 border-t border-cream-200 pt-2">
                  <span>To Pay</span>
                  <span className="text-banhmi-red text-base">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={clearCart}
                  className="px-3 py-3 border border-cream-300 text-espresso-600 hover:text-rose-600 rounded-2xl text-xs font-semibold hover:bg-cream-50 transition"
                  title="Clear Cart"
                >
                  Clear
                </button>
                <button
                  onClick={handleCheckoutClick}
                  className="flex-1 flex items-center justify-between px-6 py-3.5 bg-banhmi-red hover:bg-banhmi-redDark text-cream-50 font-bold rounded-2xl shadow-warm-md hover:shadow-warm-xl transition active:scale-[0.98]"
                >
                  <span>Checkout</span>
                  <span className="flex items-center gap-1">
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
