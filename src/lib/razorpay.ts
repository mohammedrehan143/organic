import Razorpay from 'razorpay';
import crypto from 'crypto';

export function getRazorpayConfig() {
  const sanitize = (val?: string) => val?.trim().replace(/^["']|["']$/g, '');
  const isPlaceholder = (val?: string) =>
    !val ||
    val === '' ||
    val.includes('your_') ||
    val.includes('placeholder') ||
    val.includes('xxx');

  let keyId = sanitize(process.env.RAZORPAY_KEY_ID);
  if (isPlaceholder(keyId)) {
    keyId = sanitize(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);
  }
  const keySecret = sanitize(process.env.RAZORPAY_KEY_SECRET);

  const isConfigured = !isPlaceholder(keyId) && !isPlaceholder(keySecret);

  return {
    keyId: keyId || '',
    keySecret: keySecret || '',
    isConfigured,
  };
}

export function getRazorpayClient(): Razorpay | null {
  const { keyId, keySecret, isConfigured } = getRazorpayConfig();
  if (!isConfigured) return null;

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

/**
 * Verifies Razorpay HMAC SHA-256 signature
 */
export function verifyRazorpaySignature({
  orderId,
  paymentId,
  signature,
  keySecret,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
  keySecret: string;
}): boolean {
  if (!orderId || !paymentId || !signature || !keySecret) {
    return false;
  }

  const payload = `${orderId}|${paymentId}`;
  const generatedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(payload)
    .digest('hex');

  const genBuffer = Buffer.from(generatedSignature, 'utf-8');
  const sigBuffer = Buffer.from(signature, 'utf-8');

  if (genBuffer.length !== sigBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(genBuffer, sigBuffer);
}
