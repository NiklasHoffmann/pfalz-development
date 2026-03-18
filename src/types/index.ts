// Generic Types
export type Locale = 'de' | 'en' | 'pfl';

export interface BaseModel {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
