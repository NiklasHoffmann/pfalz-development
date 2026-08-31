import type { BaseDocument } from '@/types/database';

export interface ITimeProject extends BaseDocument {
  name: string;
  color: string;
  description?: string;
  isActive: boolean;
  createdBy?: string;
}

export interface ITimeActivityType extends BaseDocument {
  name: string;
  description?: string;
  isActive: boolean;
  createdBy?: string;
}

export interface ITimeEntry extends BaseDocument {
  staffUserId: string;
  staffUserName: string;
  projectId?: string | null;
  projectName?: string | null;
  projectColor?: string | null;
  activityTypeId?: string | null;
  activityTypeName?: string | null;
  date: Date;
  startTime?: Date | null;
  endTime?: Date | null;
  durationMinutes: number;
  description?: string;
  isRunning: boolean;
  isBillable: boolean;
  createdBy?: string;
  updatedBy?: string;
}
