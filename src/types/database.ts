import { Document } from 'mongoose';

// Base Mongoose Document
export interface BaseDocument extends Document {
  createdAt: Date;
  updatedAt: Date;
}

// User Document
export interface IUser extends BaseDocument {
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
  isActive: boolean;
}

// QR Scan Document
export interface IQrScan extends BaseDocument {
  code: 'vk' | 'fl' | 'pub';
  campaign: 'visitenkarte' | 'flyer' | 'public_display';
  source: 'qr';
  medium: 'offline';
  targetUrl: string;
  ip: string;
  userAgent?: string;
  referer?: string;
}
