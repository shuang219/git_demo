import { API_BASE_URL } from '@/config/constants';
import type {
  ApiResponse,
  CreateContactRequest,
  CreateSosRequest,
  EmergencyContact,
  SosEvent,
  SosResponse,
} from '@shared/types/api';

const authHeaders = (): Record<string, string> => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
});

class ApiService {
  private async request<T>(
    path: string,
    init?: RequestInit
  ): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: authHeaders(),
    });
    const json = (await response.json()) as ApiResponse<T>;
    if (!response.ok || !json.success) {
      throw new Error(json.message || '请求失败');
    }
    return json;
  }

  getContacts(): Promise<ApiResponse<EmergencyContact[]>> {
    return this.request<EmergencyContact[]>('/api/safety/contacts');
  }

  createContact(
    body: CreateContactRequest
  ): Promise<ApiResponse<EmergencyContact>> {
    return this.request<EmergencyContact>('/api/safety/contacts', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  deleteContact(id: string): Promise<ApiResponse<{ id: string }>> {
    return this.request<{ id: string }>(`/api/safety/contacts/${id}`, {
      method: 'DELETE',
    });
  }

  getSosEvents(): Promise<ApiResponse<SosEvent[]>> {
    return this.request<SosEvent[]>('/api/safety/sos');
  }

  createSos(body: CreateSosRequest): Promise<ApiResponse<SosResponse>> {
    return this.request<SosResponse>('/api/safety/sos', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }
}

export const apiService = new ApiService();
