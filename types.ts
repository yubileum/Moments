export interface LocationData {
  name: string;
  lat: number;
  lng: number;
}

export interface Photo {
  id: string;
  url: string;
  description: string;
  location: LocationData;
  date: string; // ISO string
  tags: string[];
}

export enum ViewMode {
  GRID = 'GRID',
  TIMELINE = 'TIMELINE',
  MAP = 'MAP',
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isAudio?: boolean;
}

// Gemini Types
export interface SearchGroundingResult {
  title: string;
  url: string;
}
