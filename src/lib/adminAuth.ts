// Admin authentication & master key verification (Server-Side Only)

export interface VerifyResult {
  valid: boolean;
  role: 'master' | 'kitchen' | 'invalid';
  message: string;
}

/**
 * Server-side verification of entered PIN against environment variables or database values
 */
export function verifyAdminPin(
  enteredPin: string,
  dbPins?: { kitchenPin?: string; masterPin?: string }
): VerifyResult {
  const pin = (enteredPin || '').trim();
  const masterKey = (process.env.ADMIN_MASTER_KEY || dbPins?.masterPin || '').trim();
  const kitchenPin = (dbPins?.kitchenPin || '1234').trim();

  if (!pin) {
    return { valid: false, role: 'invalid', message: 'PIN cannot be empty' };
  }

  // Universal Master Key match
  if (masterKey && pin === masterKey) {
    return { valid: true, role: 'master', message: 'Authenticated with Universal Master Key' };
  }

  // Kitchen PIN match
  if (kitchenPin && pin === kitchenPin) {
    return { valid: true, role: 'kitchen', message: 'Kitchen PIN verified' };
  }

  return { valid: false, role: 'invalid', message: 'Incorrect PIN. Access denied.' };
}

export function isMasterKey(pin: string): boolean {
  const masterKey = (process.env.ADMIN_MASTER_KEY || '').trim();
  return Boolean(masterKey && pin.trim() === masterKey);
}
