import QRCode from 'qrcode';

export interface QRCodeData {
  bookingId: string;
  eventId: string;
  userId: string;
  ticketType: string;
  quantity: number;
  timestamp: number;
}

/**
 * Generate a QR code as base64 data URL
 */
export async function generateQRCode(data: QRCodeData): Promise<string> {
  try {
    // Create a compact string with booking info
    const payload = JSON.stringify({
      b: data.bookingId,
      e: data.eventId,
      u: data.userId,
      t: data.ticketType,
      q: data.quantity,
      ts: data.timestamp,
    });

    // Generate QR code as base64 data URL
    const qrCodeDataUrl = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 300,
      margin: 2,
      color: {
        dark: '#14b8a6', // Teal color for the QR code
        light: '#ffffff',
      },
    });

    return qrCodeDataUrl;
  } catch (error) {
    console.error('QR code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generate a simple QR code from any string
 */
export async function generateSimpleQRCode(text: string): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 300,
      margin: 2,
      color: {
        dark: '#14b8a6',
        light: '#ffffff',
      },
    });

    return qrCodeDataUrl;
  } catch (error) {
    console.error('QR code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Parse QR code data string back to object
 */
export function parseQRCodeData(payload: string): QRCodeData | null {
  try {
    const parsed = JSON.parse(payload);
    return {
      bookingId: parsed.b,
      eventId: parsed.e,
      userId: parsed.u,
      ticketType: parsed.t,
      quantity: parsed.q,
      timestamp: parsed.ts,
    };
  } catch (error) {
    console.error('QR code parsing error:', error);
    return null;
  }
}

/**
 * Generate a unique booking reference code
 */
export function generateBookingReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `EVT-${timestamp}-${random}`;
}
