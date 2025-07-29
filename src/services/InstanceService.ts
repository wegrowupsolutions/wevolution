import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { API_CONFIG, API_ENDPOINTS } from './api-config';

// Tipos para Instance
export interface InstanceConfig {
  instanceName: string;
  token?: string;
  qrcode?: boolean;
  number?: string;
  delay_message?: number;
  webhook?: string;
  webhook_by_events?: boolean;
  events?: string[];
}

export interface Instance {
  instance: {
    instanceName: string;
    status: string;
  };
  hash?: {
    apikey: string;
  };
  webhook?: string;
  events?: string[];
}

export interface QRCodeResponse {
  base64: string;
  code: string;
}

export interface ConnectionState {
  instance: string;
  state: 'open' | 'connecting' | 'close';
}

class EvolutionInstanceService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create(API_CONFIG);
    
    // Interceptor para adicionar API key
    this.api.interceptors.request.use((config) => {
      const apiKey = localStorage.getItem('evolution-api-key');
      if (apiKey) {
        config.headers['apikey'] = apiKey;
      }
      return config;
    });
  }

  // Criar nova instância
  async createInstance(config: InstanceConfig): Promise<Instance> {
    const response: AxiosResponse<Instance> = await this.api.post(
      API_ENDPOINTS.instance.create, 
      config
    );
    return response.data;
  }

  // Conectar instância
  async connectInstance(instanceName: string): Promise<QRCodeResponse> {
    const response: AxiosResponse<QRCodeResponse> = await this.api.get(
      `${API_ENDPOINTS.instance.connect}/${instanceName}`
    );
    return response.data;
  }

  // Buscar todas as instâncias
  async fetchInstances(): Promise<Instance[]> {
    const response: AxiosResponse<Instance[]> = await this.api.get(
      API_ENDPOINTS.instance.fetch
    );
    return response.data;
  }

  // Obter informações da instância
  async getInstanceInfo(instanceName: string): Promise<Instance> {
    const response: AxiosResponse<Instance> = await this.api.get(
      `${API_ENDPOINTS.instance.info}/${instanceName}`
    );
    return response.data;
  }

  // Obter QR Code
  async getQRCode(instanceName: string): Promise<QRCodeResponse> {
    const response: AxiosResponse<QRCodeResponse> = await this.api.get(
      `${API_ENDPOINTS.instance.qrcode}/${instanceName}`
    );
    return response.data;
  }

  // Status da conexão
  async getConnectionStatus(instanceName: string): Promise<ConnectionState> {
    const response: AxiosResponse<ConnectionState> = await this.api.get(
      `${API_ENDPOINTS.instance.status}/${instanceName}`
    );
    return response.data;
  }

  // Reiniciar instância
  async restartInstance(instanceName: string): Promise<{ status: string }> {
    const response: AxiosResponse<{ status: string }> = await this.api.put(
      `${API_ENDPOINTS.instance.restart}/${instanceName}`
    );
    return response.data;
  }

  // Deletar instância
  async deleteInstance(instanceName: string): Promise<{ status: string }> {
    const response: AxiosResponse<{ status: string }> = await this.api.delete(
      `${API_ENDPOINTS.instance.delete}/${instanceName}`
    );
    return response.data;
  }

  // Logout da instância
  async logoutInstance(instanceName: string): Promise<{ status: string }> {
    const response: AxiosResponse<{ status: string }> = await this.api.delete(
      `${API_ENDPOINTS.instance.logout}/${instanceName}`
    );
    return response.data;
  }
}

export const instanceService = new EvolutionInstanceService();