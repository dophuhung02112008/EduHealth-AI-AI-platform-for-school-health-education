
export enum UrgencyLevel {
  HOME_MONITOR = 'Theo dõi & Vệ sinh tại nhà',
  SEE_SCHOOL_HEALTH = 'Nên tham vấn Y tế học đường',
  URGENT_DOCTOR = 'Cần đi khám chuyên khoa ngay'
}

export interface EducationalImage {
  url: string;
  caption: string;
}

export interface HealbookTopic {
  id: string;
  category: 'DA LIÊU' | 'TRUYỀN NHIỄM' | 'MẮT';
  title: string;
  shortDescription: string;
  educationalImages: EducationalImage[];
  commonSigns: string[];
  schoolContext: string; // Lý do lây lan trong môi trường học tập
  dangerSigns: string[]; 
  safeActions: string[];
  references: { title: string; url: string }[];
  samplePrompt: string;
}

export interface HealthCase {
  id: string;
  title: string;
  category: string;
  analysis: string[];
  urgency: UrgencyLevel;
  dangerSigns: string[];
  safetyAdvice: string[];
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  label: string;
  intensity: number;
}

export type UserRole = 'Học sinh' | 'Phụ huynh' | 'Cán bộ y tế';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
