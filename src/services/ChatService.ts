import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { API_CONFIG, API_ENDPOINTS } from './api-config';

// Tipos para Chat
export interface Contact {
  id: string;
  pushName?: string;
  profilePictureUrl?: string;
  remoteJid: string;
}

export interface Chat {
  id: string;
  name?: string;
  unreadCount: number;
  lastMessage?: any;
  timestamp?: number;
  archived?: boolean;
}

export interface PresenceData {
  number: string;
  presence: 'available' | 'unavailable' | 'composing' | 'recording';
  delay?: number;
}

export interface Profile {
  wuid: string;
  name: string;
  picture?: string;
  status?: string;
}

class EvolutionChatService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create(API_CONFIG);
    
    this.api.interceptors.request.use((config) => {
      const apiKey = localStorage.getItem('evolution-api-key');
      if (apiKey) {
        config.headers['apikey'] = apiKey;
      }
      return config;
    });
  }

  // Buscar contatos
  async findContacts(instanceName: string): Promise<Contact[]> {
    const response: AxiosResponse<Contact[]> = await this.api.get(
      `${API_ENDPOINTS.chat.findContacts}/${instanceName}`
    );
    return response.data;
  }

  // Buscar chats
  async fetchContacts(instanceName: string): Promise<Contact[]> {
    const response: AxiosResponse<Contact[]> = await this.api.get(
      `${API_ENDPOINTS.chat.fetchContacts}/${instanceName}`
    );
    return response.data;
  }

  // Verificar números WhatsApp
  async checkWhatsAppNumbers(instanceName: string, numbers: string[]): Promise<any> {
    const response: AxiosResponse<any> = await this.api.post(
      `${API_ENDPOINTS.chat.whatsappNumbers}/${instanceName}`,
      { numbers }
    );
    return response.data;
  }

  // Buscar perfil
  async fetchProfile(instanceName: string, number: string): Promise<Profile> {
    const response: AxiosResponse<Profile> = await this.api.post(
      `${API_ENDPOINTS.chat.fetchProfile}/${instanceName}`,
      { number }
    );
    return response.data;
  }

  // Atualizar presença
  async updatePresence(instanceName: string, presenceData: PresenceData): Promise<{ status: string }> {
    const response: AxiosResponse<{ status: string }> = await this.api.put(
      `${API_ENDPOINTS.chat.updatePresence}/${instanceName}`,
      presenceData
    );
    return response.data;
  }

  // Arquivar chat
  async archiveChat(instanceName: string, data: {
    chat: string;
    archive: boolean;
  }): Promise<{ status: string }> {
    const response: AxiosResponse<{ status: string }> = await this.api.put(
      `${API_ENDPOINTS.chat.archiveChat}/${instanceName}`,
      data
    );
    return response.data;
  }

  // Deletar mensagem
  async deleteMessage(instanceName: string, data: {
    key: {
      id: string;
      remoteJid: string;
      fromMe: boolean;
    };
  }): Promise<{ status: string }> {
    const response: AxiosResponse<{ status: string }> = await this.api.delete(
      `${API_ENDPOINTS.chat.deleteMessage}/${instanceName}`,
      { data }
    );
    return response.data;
  }
}

export const chatService = new EvolutionChatService();