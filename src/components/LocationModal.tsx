'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useOrder } from '@/context/OrderContext';
import { getCurrentLocationAddress, searchAddressQuery, AddressSuggestion } from '@/lib/location';
import { MapPin, Navigation, Search, X, Check, Loader2, Sparkles, Building2 } from 'lucide-react';
import { UserLocation } from '@/types/cafe';

const POPULAR_HUBS = [
  { name: 'Indiranagar, Bengaluru', lat: 12.9784, lng: 77.6408 },
  { name: 'Koramangala, Bengaluru', lat: 12.9352, lng: 77.6245 },
  { name: 'HSR Layout, Bengaluru', lat: 12.9121, lng: 77.6446 },
  { name: 'Whitefield, Bengaluru', lat: 12.9698, lng: 77.7500 },
  { name: 'Jayanagar, Bengaluru', lat: 12.9308, lng: 77.5838 },
  { name: 'MG Road / CBD, Bengaluru', lat: 12.9756, lng: 77.6066 },
];

export function LocationModal() {
  const {
    locationModalOpen,
    setLocationModalOpen,
    userLocation,
    setUserLocation,
  } = useOrder();

  const [detecting, setDetecting] = useState(false);
  const [detectError, setDetectError] = useState('');
  const [detectSuccess, setDetectSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!locationModalOpen) {
      setDetectError('');
      setDetectSuccess('');
      setSearchQuery('');
      setSuggestions([]);
    }
  }, [locationModalOpen]);

  if (!locationModalOpen) return null;

  const handleAutoDetect = async () => {
    setDetecting(true);
    setDetectError('');
    setDetectSuccess('');

    try {
      const loc = await getCurrentLocationAddress();
      const short =
        loc.suburb || loc.road || loc.building || loc.city || 'Detected Location';
      const cityPart = loc.city ? `, ${loc.city}` : '';
      const shortFormatted = `${short}${cityPart}`;

      const newLocation: UserLocation = {
        formattedAddress: loc.formattedAddress,
        shortAddress: shortFormatted,
        road: loc.road,
        houseNumber: loc.houseNumber,
        building: loc.building,
        suburb: loc.suburb,
        city: loc.city,
        state: loc.state,
        postcode: loc.postcode,
        lat: loc.lat,
        lng: loc.lng,
      };

      setUserLocation(newLocation);
      setDetectSuccess(`Locked location: ${shortFormatted}`);
      setTimeout(() => {
        setLocationModalOpen(false);
      }, 1200);
    } catch (err: any) {
      console.warn('Geolocation detection error:', err);
      setDetectError(
        'Could not auto-detect GPS location. Please check browser permissions or search your area below.'
      );
    } finally {
      setDetecting(false);
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (val.trim().length >= 3) {
      setSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        const results = await searchAddressQuery(val);
        setSuggestions(results);
        setSearching(false);
      }, 350);
    } else {
      setSuggestions([]);
      setSearching(false);
    }
  };

  const handleSelectSuggestion = (s: AddressSuggestion) => {
    const short = s.street || s.name || s.city || 'Custom Location';
    const cityPart = s.city ? `, ${s.city}` : '';
    const shortFormatted = `${short}${cityPart}`;

    const newLocation: UserLocation = {
      formattedAddress: s.formatted,
      shortAddress: shortFormatted,
      road: s.street,
      suburb: s.name,
      city: s.city,
      state: s.state,
      postcode: s.postcode,
      lat: s.lat,
      lng: s.lng,
    };

    setUserLocation(newLocation);
    setLocationModalOpen(false);
  };

  const handleSelectHub = (hub: (typeof POPULAR_HUBS)[0]) => {
    const newLocation: UserLocation = {
      formattedAddress: `${hub.name}, Karnataka, India`,
      shortAddress: hub.name,
      city: 'Bengaluru',
      state: 'Karnataka',
      lat: hub.lat,
      lng: hub.lng,
    };

    setUserLocation(newLocation);
    setLocationModalOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={() => setLocationModalOpen(false)}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden text-[#173612] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-[#F5FAF0]">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border-2 border-[#173612] flex items-center justify-center text-[#173612] shadow-sm shrink-0">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 fill-[#173612]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#0F240B] uppercase tracking-wide font-bebas">
                Select Delivery Location
              </h3>
              <p className="text-[11px] sm:text-xs text-[#2E6125] font-medium leading-tight">
                Fresh organic milk & farm goods delivered cold
              </p>
            </div>
          </div>
          <button
            onClick={() => setLocationModalOpen(false)}
            className="p-1.5 sm:p-2 rounded-full hover:bg-gray-200/60 text-[#173612] transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[82vh] overflow-y-auto">
          {/* Current Saved Location Banner */}
          {userLocation && (
            <div className="p-3 sm:p-3.5 rounded-2xl bg-[#ECF5DE] border border-[#CBE0A3] flex items-start gap-2.5 sm:gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2E6125] mt-1 shrink-0 animate-pulse" />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#385A2A] block">
                  Current Selected Location
                </span>
                <p className="text-xs font-bold text-[#0F240B] truncate">
                  {userLocation.shortAddress}
                </p>
                <p className="text-[11px] text-[#2E6125] truncate">
                  {userLocation.formattedAddress}
                </p>
              </div>
            </div>
          )}

          {/* 1-Click Auto-Detect Button */}
          <div>
            <button
              onClick={handleAutoDetect}
              disabled={detecting}
              className="w-full flex items-center justify-between px-3.5 py-3 sm:px-5 sm:py-4 rounded-2xl bg-[#173612] hover:bg-[#0F240B] text-white font-bold shadow-md hover:shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-60 border-2 border-[#173612] cursor-pointer"
            >
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/20 text-white flex items-center justify-center shadow-inner shrink-0">
                  {detecting ? (
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  ) : (
                    <Navigation className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                  )}
                </div>
                <div className="text-left min-w-0">
                  <span className="block text-xs sm:text-sm font-black uppercase tracking-wide truncate">
                    {detecting ? 'Detecting Live GPS...' : 'Auto-Detect Current Location'}
                  </span>
                  <span className="block text-[10px] sm:text-[11px] font-semibold text-[#173612]/80 truncate">
                    Using high-precision building level GPS
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-[#173612] text-white text-[10px] sm:text-[11px] font-black rounded-full uppercase tracking-wider shrink-0 ml-2">
                1-Click
              </span>
            </button>

            {detectSuccess && (
              <div className="mt-2 sm:mt-3 p-2.5 sm:p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{detectSuccess}</span>
              </div>
            )}

            {detectError && (
              <div className="mt-2 sm:mt-3 p-2.5 sm:p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold animate-fadeIn">
                {detectError}
              </div>
            )}
          </div>

          {/* Address Search Bar */}
          <div className="space-y-1.5 sm:space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#173612]">
              Or Search Locality, Landmark, or Street
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. 100 Feet Road, Indiranagar or Pincode..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-2xl border-2 border-gray-200 bg-white text-sm font-semibold text-[#173612] placeholder-gray-400 focus:outline-none focus:border-[#173612] shadow-sm transition"
              />
              {searching && (
                <Loader2 className="w-4 h-4 text-[#173612] animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
              )}
            </div>

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className="mt-2 rounded-2xl border-2 border-gray-200 bg-white overflow-hidden shadow-lg divide-y divide-gray-100 max-h-48 overflow-y-auto">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSuggestion(s)}
                    className="w-full text-left px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs hover:bg-[#F5FAF0] text-[#173612] flex items-center justify-between transition group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#43670F] shrink-0 group-hover:scale-110 transition" />
                      <span className="truncate font-medium">{s.formatted}</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-[#43670F] shrink-0 ml-2">
                      Select
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Popular Delivery Hubs */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#385A2A] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              <span>Popular Delivery Hubs</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {POPULAR_HUBS.map((hub, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectHub(hub)}
                  className="px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-[#ECF5DE] hover:border-[#173612] text-xs font-bold text-[#173612] text-left transition flex items-center gap-2 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#43670F] shrink-0" />
                  <span className="truncate">{hub.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Serviceability Guarantee Badge */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-[#F5FAF0] border border-[#CBE0A3] flex items-center gap-2.5 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#173612] text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#0F240B] block">
                30-45 Min Cold-Chain Delivery
              </span>
              <span className="text-[10px] sm:text-[11px] text-[#2E6125] block leading-tight">
                Insulated transport maintains optimal farm freshness until doorstep.
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            onClick={() => setLocationModalOpen(false)}
            className="px-5 py-2 sm:py-2.5 rounded-full border-2 border-gray-300 text-xs font-bold text-[#173612] hover:bg-gray-100 transition cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
