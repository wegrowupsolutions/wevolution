import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { API_CONFIG, API_ENDPOINTS } from './api-config';

// Tipos para mensagens
export interface MessageData {
  number: string;
  text?: string;
  delay?: number;
  linkPreview?: boolean;
  mentionsEveryOne?: boolean;
  mentioned?: string[];
  quoted?: {
    key: {
      id: string;
    };
    message: {
      conversation: string;
    };
  };
}

export interface MediaMessage {
  number: string;
  media: string; // base64 ou URL
  caption?: string;
  delay?: number;
  fileName?: string;
  quoted?: {
    key: { id: string };
    message: { conversation: string };
  };
}

export interface ContactMessage {
  number: string;
  contact: {
    fullName: string;
    wuid: string;
    phoneNumber: string;
    organization?: string;
  }[];
}

export interface LocationMessage {
  number: string;
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
}

export interface MessageResponse {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  message: any;
  messageTimestamp: string;
  status: 'PENDING' | 'SENT' | 'RECEIVED' | 'READ';
}

export interface ChatMessage {
  key: {
    id: string;
    fromMe: boolean;
    remoteJid: string;
  };
  message: any;
  messageTimestamp: number;
  status?: string;
  pushName?: string;
}

class EvolutionMessageService {
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

  // Enviar mensagem de texto
  async sendTextMessage(instanceName: string, message: MessageData): Promise<MessageResponse> {
    const response: AxiosResponse<MessageResponse> = await this.api.post(
      `${API_ENDPOINTS.message.sendText}/${instanceName}`,
      message
    );
    return response.data;
  }

  // Enviar imagem
  async sendImageMessage(instanceName: string, message: MediaMessage): Promise<MessageResponse> {
    const response: AxiosResponse<MessageResponse> = await this.api.post(
      `${API_ENDPOINTS.message.sendImage}/${instanceName}`,
      message
    );
    return response.data;
  }

  // Enviar áudio
  async sendAudioMessage(instanceName: string, message: MediaMessage): Promise<MessageResponse> {
    const response: AxiosResponse<MessageResponse> = await this.api.post(
      `${API_ENDPOINTS.message.sendAudio}/${instanceName}`,
      message
    );
    return response.data;
  }

  // Enviar vídeo
  async sendVideoMessage(instanceName: string, message: MediaMessage): Promise<MessageResponse> {
    const response: AxiosResponse<MessageResponse> = await this.api.post(
      `${API_ENDPOINTS.message.sendVideo}/${instanceName}`,
      message
    );
    return response.data;
  }

  // Enviar documento
  async sendDocumentMessage(instanceName: string, message: MediaMessage): Promise<MessageResponse> {
    const response: AxiosResponse<MessageResponse> = await this.api.post(
      `${API_ENDPOINTS.message.sendDocument}/${instanceName}`,
      message
    );
    return response.data;
  }

  // Enviar contato
  async sendContactMessage(instanceName: string, message: ContactMessage): Promise<MessageResponse> {
    const response: AxiosResponse<MessageResponse> = await this.api.post(
      `${API_ENDPOINTS.message.sendContact}/${instanceName}`,
      message
    );
    return response.data;
  }

  // Enviar localização
  async sendLocationMessage(instanceName: string, message: LocationMessage): Promise<MessageResponse> {
    const response: AxiosResponse<MessageResponse> = await this.api.post(
      `${API_ENDPOINTS.message.sendLocation}/${instanceName}`,
      message
    );
    return response.data;
  }

  // Reagir a mensagem
  async sendReaction(instanceName: string, data: {
    key: { id: string; remoteJid: string; fromMe: boolean };
    reaction: string;
  }): Promise<MessageResponse> {
    const response: AxiosResponse<MessageResponse> = await this.api.post(
      `${API_ENDPOINTS.message.sendReaction}/${instanceName}`,
      data
    );
    return response.data;
  }

  // Marcar mensagem como lida
  async markAsRead(instanceName: string, data: {
    readMessages: Array<{
      id: string;
      fromMe: boolean;
      remoteJid: string;
    }>;
  }): Promise<{ status: string }> {
    const response: AxiosResponse<{ status: string }> = await this.api.put(
      `${API_ENDPOINTS.message.markAsRead}/${instanceName}`,
      data
    );
    return response.data;
  }

  // Buscar mensagens
  async findMessages(instanceName: string, params: {
    where?: {
      key?: {
        fromMe?: boolean;
        remoteJid?: string;
      };
    };
    limit?: number;
  }): Promise<ChatMessage[]> {
    const response: AxiosResponse<ChatMessage[]> = await this.api.post(
      `${API_ENDPOINTS.chat.findMessages}/${instanceName}`,
      params
    );
    return response.data;
  }
}

export const messageService = new EvolutionMessageService();