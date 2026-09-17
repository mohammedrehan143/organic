import type { Metadata, Viewport } from 'next';
import './globals.css';
import { OrderProvider } from '@/context/OrderContext';
import { ZafirooNavbar } from '@/components/ZafirooNavbar';
import { ZafirooFooter } from '@/components/ZafirooFooter';
import { CartDrawer } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { MenuDetailModal } from '@/components/MenuDetailModal';
import { OrderTrackingModal } from '@/components/OrderTrackingModal';
import { LocationModal } from '@/components/LocationModal';

export const metadata: Metadata = {
  title: 'Zafiroo Organic Store | Farm-Fresh Pure A2 Milk, Artisan Dairy & Wholesome Goods',
  description:
    'Delivering wholesome organic dairy products, pasture-fed A2 milk, cultured butter, Vedic ghee, and farm-fresh produce from our dedicated local farms directly to your doorstep.',
  keywords: [
    'Zafiroo Organic Store',
    'Pure A2 Milk',
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
      <body className="min-h-screen flex flex-col bg-white text-[#173612] font-sans antialiased selection:bg-[#FEEF30] selection:text-[#173612]">
        <OrderProvider>
          <ZafirooNavbar />
          <main className="flex-1">{children}</main>
          <ZafirooFooter />

          {/* Global slide-over drawers & popups */}
          <LocationModal />
          <CartDrawer />
          <CheckoutModal />
          <MenuDetailModal />
          <OrderTrackingModal />
        </OrderProvider>
      </body>
    </html>
  );
}
