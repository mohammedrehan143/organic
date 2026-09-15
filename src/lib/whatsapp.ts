import { Order, SosAlert } from '@/types/cafe';

/**
 * Normalizes phone numbers to standard E.164-compatible numbers for WhatsApp links
 */
export function cleanPhoneNumber(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/[^0-9]/g, '');
  // If 10-digit Indian phone without country code, prefix with 91
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  return cleaned;
}

/**
 * Builds a direct click-to-chat WhatsApp link with prefilled text
 */
export function buildWhatsAppChatUrl(phone: string, text: string): string {
  const sanitizedPhone = cleanPhoneNumber(phone);
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${sanitizedPhone}?text=${encodedText}`;
}

/**
 * Generates customer WhatsApp message containing their Doorstep Delivery OTP
 */
export function generateWhatsAppOtpLink(
  phone: string,
  otp: string,
  tokenId: string,
  total: number,
  customerName?: string
): string {
  const greeting = customerName ? `Hello ${customerName}` : 'Hello';
  const message = 
`☕ *ZAFIROO GOURMET CAFE*
${greeting}! Your artisan order is on the way!

📦 *Order Token:* #${tokenId}
💰 *Total Amount:* ₹${total.toFixed(2)}
🔐 *Your Doorstep Delivery OTP is:* *${otp}*

👉 *Please share this 4-digit OTP with your delivery partner only upon receiving your package safely.*

Track live: ${typeof window !== 'undefined' ? window.location.origin : 'https://zafiroo.com'}/track?token=${tokenId}`;

  return buildWhatsAppChatUrl(phone, message);
}

/**
 * Generates WhatsApp link to share location pin with delivery rider
 */
export function generateWhatsAppLocationShareLink(
  riderPhone: string,
  lat?: number,
  lng?: number,
  address?: string
): string {
  let locationInfo = address ? `📍 *Address:* ${address}` : '';
  if (lat && lng) {
    locationInfo += `\n🗺️ *Google Maps Pin:* https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }

  const message = 
`👋 Hi Delivery Partner,
Here is the exact delivery location pin for my Zafiroo order:

${locationInfo}

Thank you!`;

  return buildWhatsAppChatUrl(riderPhone, message);
}

/**
 * Generates WhatsApp link for Rider Emergency SOS broadcast
 */
export function generateRiderSosWhatsAppLink(
  kitchenPhone: string,
  alert: SosAlert
): string {
  const message = 
`🚨 *EMERGENCY SOS ALERT - ZAFIROO LOGISTICS*
Rider: ${alert.agentName} (${alert.agentPhone})
Issue: ${alert.reason.toUpperCase()}
${alert.tokenId ? `Order Token: #${alert.tokenId}` : ''}
${alert.locationAddress ? `Location: ${alert.locationAddress}` : ''}
${alert.lat && alert.lng ? `GPS: https://www.google.com/maps/search/?api=1&query=${alert.lat},${alert.lng}` : ''}
Notes: ${alert.notes || 'Emergency assistance needed immediately.'}`;

  return buildWhatsAppChatUrl(kitchenPhone, message);
}
