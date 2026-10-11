// Shared API types — single source of truth for frontend ↔ backend contracts.

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ChatRequest {
  message: string;
  systemPrompt?: string;
}

export interface ChatChunk {
  content: string;
}

export interface DetectionItem {
  id: string;
  label: string;
  distance: string;
  direction: '左前方' | '正前方' | '右前方' | '左侧' | '右侧';
  risk: 'low' | 'medium' | 'high' | 'critical';
}

export interface NavigationStep {
  instruction: string;
  detail: string;
  distanceMeters: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  createdAt: string;
}

export interface CreateContactRequest {
  name: string;
  phone: string;
  relationship: string;
}

export interface SosEvent {
  id: string;
  message: string;
  latitude: string | null;
  longitude: string | null;
  contactCount: number;
  createdAt: string;
}

export interface CreateSosRequest {
  message?: string;
  latitude?: number;
  longitude?: number;
}

export interface SosResponse {
  event: SosEvent;
  notified: string[];
}

export interface ProfileUpdateRequest {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}
