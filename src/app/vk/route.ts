import { NextRequest } from 'next/server';
import { trackQrAndRedirect } from '@/lib/qr-tracking';

export async function GET(request: NextRequest) {
  return trackQrAndRedirect(request, 'vk');
}