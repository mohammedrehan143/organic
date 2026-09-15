// Admin authentication & universal master key verification

const DEFAULT_MASTER_KEY = process.env.ADMIN_MASTER_KEY || "ZAFIROO_MASTER_2026";
const DEFAULT_KITCHEN_PIN = "1234";

export interface VerifyResult {
  valid: boolean;
  role: 'master' | 'kitchen' | 'invalid';
  message: string;
}

/**
 * Verifies if entered PIN matches either the Universal Master Key or Kitchen PIN
 */
export function verifyAdminPin(enteredPin: string, customKitchenPin?: string): VerifyResult {
  const pin = (enteredPin || '').trim();
  const activeKitchenPin = (customKitchenPin || DEFAULT_KITCHEN_PIN).trim();

  if (!pin) {
    return { valid: false, role: 'invalid', message: 'PIN cannot be empty' };
  }

  // Universal Master Key bypass
  if (pin === DEFAULT_MASTER_KEY || pin === '9999') {
    return { valid: true, role: 'master', message: 'Authenticated with Universal Master Key' };
  }

  // Standard Kitchen PIN
  if (pin === activeKitchenPin) {
    return { valid: true, role: 'kitchen', message: 'Kitchen PIN verified' };
  }

  return { valid: false, role: 'invalid', message: 'Incorrect PIN. Try 1234 or master key.' };
}

export function isMasterKey(pin: string): boolean {
  return pin === DEFAULT_MASTER_KEY || pin === '9999';
}

export function getDefaultKitchenPin(): string {
  return DEFAULT_KITCHEN_PIN;
}
