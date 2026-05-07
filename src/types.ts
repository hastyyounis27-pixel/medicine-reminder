export type Frequency = 'daily' | 'weekly' | 'monthly' | 'custom';

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  category: string;
  time: string; // HH:mm
  frequency: Frequency;
  daysOfWeek?: number[]; // 0-6 for weekly
  startDate: string;
  endDate?: string;
  notes?: string;
  photo?: string;
  stock?: number;
  refillThreshold?: number;
  completed?: Record<string, boolean>; // date string -> boolean
  alarmSound?: {
    type: 'default' | 'mp3' | 'voice';
    uri: string;
    label?: string;
  };
}

export interface HistoryLog {
  id: string;
  medicineId: string;
  medicineName: string;
  timestamp: number;
  status: 'taken' | 'missed' | 'snoozed';
  dosage: string;
}

export type Language = 'en' | 'ar' | 'ku';

export interface AppSettings {
  language: Language;
  darkMode: boolean;
  alarmSound: string;
  volume: number;
  sosContact?: string;
  refillNotification: boolean;
}
