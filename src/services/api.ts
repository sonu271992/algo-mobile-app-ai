import { ApiResponse, LoginResponse, HealthCheckData, Settings, Order, SuperTrend } from '../types';

const BASE_URL = 'https://algo-treding-backend.onrender.com';

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
    };
  }

  async healthCheck(): Promise<ApiResponse<HealthCheckData>> {
    const response = await fetch(`${BASE_URL}/healthCheck`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return response.json();
  }

  async login(totp: string): Promise<ApiResponse<LoginResponse>> {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ totp }),
    });
    return response.json();
  }

  async getAllSettings(): Promise<Settings> {
    const response = await fetch(`${BASE_URL}/getAllSettings`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return response.json();
  }

  async getAllOrders(): Promise<Order[]> {
    const response = await fetch(`${BASE_URL}/getAllOrders`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return response.json();
  }

  async getSuperTrend(): Promise<SuperTrend[]> {
    const response = await fetch(`${BASE_URL}/getSuperTrend`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return response.json();
  }
}

export const apiService = new ApiService();