const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'https://api.carebow.com';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        ...headers,
      },
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  // Services
  async getServices() {
    return this.request<import('../types').Service[]>('/services');
  }

  async getServiceById(id: string) {
    return this.request<import('../types').Service>(`/services/${id}`);
  }

  // Orders
  async getOrders() {
    return this.request<import('../types').Order[]>('/orders');
  }

  async createOrder(data: import('../types').CreateOrderInput) {
    return this.request<import('../types').Order>('/orders', { method: 'POST', body: data });
  }

  // AI Chat
  async sendMessage(sessionId: string, message: string) {
    return this.request<import('../types').ChatResponse>('/ask', {
      method: 'POST',
      body: { sessionId, message },
    });
  }

  // Family Members
  async getFamilyMembers() {
    return this.request<import('../types').FamilyMember[]>('/family');
  }

  async addFamilyMember(data: import('../types').CreateFamilyMemberInput) {
    return this.request<import('../types').FamilyMember>('/family', { method: 'POST', body: data });
  }

  // Safety
  async triggerSOS(data: import('../types').SOSData) {
    return this.request<import('../types').SOSResponse>('/safety/sos', { method: 'POST', body: data });
  }

  async getEmergencyContacts() {
    return this.request<import('../types').EmergencyContact[]>('/safety/contacts');
  }
}

export const api = new ApiClient(API_BASE);
