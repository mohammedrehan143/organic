import type { Metadata, Viewport } from 'next';
import './globals.css';
import { OrderProvider } from '@/context/OrderContext';
import { PwaProvider } from '@/components/PwaInstallPrompt';
import { ZafirooNavbar } from '@/components/ZafirooNavbar';
import { ZafirooFooter } from '@/components/ZafirooFooter';
import { CartDrawer } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { MenuDetailModal } from '@/components/MenuDetailModal';
import { OrderTrackingModal } from '@/components/OrderTrackingModal';
import { LocationModal } from '@/components/LocationModal';
import { FloatingCartBar } from '@/components/FloatingCartBar';

export const metadata: Metadata = {
  title: 'Zafiroo Dairy | Farm-Fresh Pure Milk, Artisan Dairy & Wholesome Goods',
  description:
    'Delivering wholesome organic dairy products, pasture-fed milk, cultured butter, Vedic ghee, and farm-fresh produce from our dedicated local farms directly to your doorstep.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Zafiroo Dairy',
  },
  icons: {
    icon: [
      { url: '/icon.png', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  keywords: [
    'Zafiroo Dairy',
    'Pure Milk',
    'Organic Dairy',
    'Farm Fresh Milk',
    'Bilona Cow Ghee',
    'Cultured Butter',
    'Organic Farm Bangalore',
    'Pasture Raised Eggs',
  ],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#173612',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white text-[#173612] font-sans antialiased selection:bg-[#173612] selection:text-white">
        <OrderProvider>
          <PwaProvider>
            <ZafirooNavbar />
            <main className="flex-1">{children}</main>
            <ZafirooFooter />

            {/* Global slide-over drawers & popups */}
            <LocationModal />
            <CartDrawer />
            <CheckoutModal />
            <MenuDetailModal />
            <OrderTrackingModal />
            <FloatingCartBar />
          </PwaProvider>
        </OrderProvider>
      </body>
    </html>
  );
}
