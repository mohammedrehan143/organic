'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { Download, Smartphone, X, Check, Share, PlusSquare } from 'lucide-react';

interface PwaContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  isIos: boolean;
  promptInstall: () => Promise<void>;
  showIosInstructions: boolean;
  setShowIosInstructions: (show: boolean) => void;
}

const PwaContext = createContext<PwaContextType>({
  isInstallable: false,
  isInstalled: false,
  isIos: false,
  promptInstall: async () => {},
  showIosInstructions: false,
  setShowIosInstructions: () => {},
});

export function usePwa() {
  return useContext(PwaContext);
}

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosInstructions, setShowIosInstructions] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registered:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration error:', err);
        });
    }

    // 2. Detect standalone display mode
    if (typeof window !== 'undefined') {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      if (isStandalone) {
        setIsInstalled(true);
      }

      // Check iOS Safari
      const ua = window.navigator.userAgent;
      const isIosDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
      setIsIos(isIosDevice);

      // Check dismissal state in sessionStorage
      const dismissed = sessionStorage.getItem('zafiroo_pwa_dismissed');
      if (dismissed) setBannerDismissed(true);

      // 3. Listen to beforeinstallprompt
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setIsInstallable(true);
      };

      const handleAppInstalled = () => {
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
        console.log('[PWA] App was successfully installed');
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }
  }, []);

  const promptInstall = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setIsInstallable(false);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.warn('[PWA] prompt error:', err);
      }
    } else if (isIos) {
      setShowIosInstructions(true);
    } else {
      setShowIosInstructions(true);
    }
  };

  const handleDismissBanner = () => {
    setBannerDismissed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('zafiroo_pwa_dismissed', 'true');
    }
  };

  return (
    <PwaContext.Provider
      value={{
        isInstallable: isInstallable || isIos,
        isInstalled,
        isIos,
        promptInstall,
        showIosInstructions,
        setShowIosInstructions,
      }}
    >
      {children}

      {/* Floating Bottom Install Prompt Banner (Visible on mobile / desktop when not installed and not dismissed) */}
      {!isInstalled && !bannerDismissed && (
        <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-40 max-w-sm w-full bg-gradient-to-r from-[#173612] via-[#122A0E] to-[#0A1807] text-white p-4 rounded-2xl shadow-2xl border-2 border-[#CBE0A3]/60 animate-fadeIn flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon-192.png" alt="Zafiroo App" className="w-full h-full object-contain rounded-lg" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-300">
                Install Zafiroo App
              </h4>
              <p className="text-[11px] text-emerald-100 font-medium leading-tight">
                Instant 1-tap milk orders &amp; live morning tracking
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={promptInstall}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-[#0F240B] font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#0F240B]" />
              <span>Install</span>
            </button>
            <button
              onClick={handleDismissBanner}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 flex items-center justify-center cursor-pointer"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* iOS / General Browser Install Guide Modal */}
      {showIosInstructions && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 sm:p-7 shadow-2xl border-2 border-[#CBE0A3] space-y-5 relative text-center">
            <button
              onClick={() => setShowIosInstructions(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            <div className="w-14 h-14 rounded-2xl bg-[#EAF3E4] border border-[#CBE0A3] flex items-center justify-center mx-auto text-[#173612] shadow-sm">
              <Smartphone className="w-7 h-7 text-[#173612]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-[#0F240B]">
                Install Zafiroo Web App
              </h3>
              <p className="text-xs text-gray-600">
                Add Zafiroo Dairy to your home screen for quick daily milk orders and sunrise delivery updates.
              </p>
            </div>

            <div className="bg-[#F5FAF0] rounded-2xl p-4 border border-[#D8ECCE] text-left text-xs space-y-3 text-gray-800">
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#173612] text-white text-[11px] font-black flex items-center justify-center shrink-0">
                  1
                </span>
                <span className="pt-0.5">
                  Tap the <strong>Share</strong> button <Share className="inline w-3.5 h-3.5 text-blue-600 align-middle" /> in your browser toolbar (bottom on iPhone / top right on Android).
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#173612] text-white text-[11px] font-black flex items-center justify-center shrink-0">
                  2
                </span>
                <span className="pt-0.5">
                  Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong> <PlusSquare className="inline w-3.5 h-3.5 text-[#173612] align-middle" />.
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#173612] text-white text-[11px] font-black flex items-center justify-center shrink-0">
                  3
                </span>
                <span className="pt-0.5">
                  Tap <strong>Add</strong> in the top-right corner to finish installing!
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowIosInstructions(false)}
              className="w-full py-3 bg-[#173612] hover:bg-[#0F240B] text-white font-bold rounded-2xl text-xs uppercase tracking-wider shadow-md transition cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </PwaContext.Provider>
  );
}

// Reusable "Install Web App" Button component
export function InstallAppButton({ className = '' }: { className?: string }) {
  const { isInstalled, promptInstall } = usePwa();

  if (isInstalled) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300">
        <Check className="w-3.5 h-3.5 text-emerald-700" />
        <span>App Installed</span>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={promptInstall}
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full font-bold text-xs uppercase tracking-wider shadow-sm transition transform hover:scale-105 active:scale-95 cursor-pointer ${className}`}
      title="Install Zafiroo Dairy Web App on your phone or computer"
    >
      <Download className="w-3.5 h-3.5 shrink-0" />
      <span>Install App</span>
    </button>
  );
}
