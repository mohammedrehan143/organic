import { generateWhatsAppOtpLink } from './whatsapp';

export interface DispatchOtpParams {
  phone: string;
  otp: string;
  tokenId: string;
  total: number;
  customerName?: string;
}

export async function dispatchOtpNotification(params: DispatchOtpParams): Promise<{ success: boolean; url: string }> {
  const url = generateWhatsAppOtpLink(
    params.phone,
    params.otp,
    params.tokenId,
    params.total,
    params.customerName
  );

  // In production with WhatsApp Business Cloud API, a webhook/API call would fire here.
  // For local web experience, we return the WhatsApp click-to-chat URL.
  return {
    success: true,
    url,
  };
}
