import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { API_CONFIG, API_ENDPOINTS, WEBHOOK_EVENTS } from './api-config';

// Tipos para Webhook
export interface WebhookConfig {
  webhook: {
    url: string;
    by_events: boolean;
    base64: boolean;
    events: string[];
  };
}

export interface WebhookResponse {
  webhook: {
    url: string;
    events: string[];
    by_events: boolean;
    base64: boolean;
  };
}

export interface WebhookEvent {
  event: string;
  instance: string;
  data: any;
  destination: string;
  date_time: string;
  sender: string;
  server_url: string;
  apikey: string;
}

class EvolutionWebhookService {
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

  // Configurar webhook
  async setWebhook(instanceName: string, config: WebhookConfig): Promise<WebhookResponse> {
    const response: AxiosResponse<WebhookResponse> = await this.api.post(
      `${API_ENDPOINTS.webhook.set}/${instanceName}`,
      config
    );
    return response.data;
  }

  // Buscar configuração do webhook
  async findWebhook(instanceName: string): Promise<WebhookResponse> {
    const response: AxiosResponse<WebhookResponse> = await this.api.get(
      `${API_ENDPOINTS.webhook.find}/${instanceName}`
    );
    return response.data;
  }

  // Processar eventos de webhook recebidos
  processWebhookEvent(event: WebhookEvent): void {
    console.log('Webhook event received:', event);
    
    // Disparar eventos customizados baseados no tipo
    switch (event.event) {
      case WEBHOOK_EVENTS.QRCODE_UPDATED:
        this.handleQRCodeUpdate(event);
        break;
      case WEBHOOK_EVENTS.CONNECTION_UPDATE:
        this.handleConnectionUpdate(event);
        break;
      case WEBHOOK_EVENTS.MESSAGES_UPSERT:
        this.handleNewMessage(event);
        break;
      case WEBHOOK_EVENTS.PRESENCE_UPDATE:
        this.handlePresenceUpdate(event);
        break;
      default:
        console.log('Unhandled webhook event:', event.event);
    }
  }

  private handleQRCodeUpdate(event: WebhookEvent): void {
    // Atualizar QR Code na interface
    const customEvent = new CustomEvent('qrcode-updated', {
      detail: {
        instance: event.instance,
        qrcode: event.data.qrcode
      }
    });
    window.dispatchEvent(customEvent);
  }

  private handleConnectionUpdate(event: WebhookEvent): void {
    // Atualizar status de conexão
    const customEvent = new CustomEvent('connection-updated', {
      detail: {
        instance: event.instance,
        state: event.data.state
      }
    });
    window.dispatchEvent(customEvent);
  }

  private handleNewMessage(event: WebhookEvent): void {
    // Notificar nova mensagem
    const customEvent = new CustomEvent('new-message', {
      detail: {
        instance: event.instance,
        message: event.data
      }
    });
    window.dispatchEvent(customEvent);
  }

  private handlePresenceUpdate(event: WebhookEvent): void {
    // Atualizar presença do usuário
    const customEvent = new CustomEvent('presence-updated', {
      detail: {
        instance: event.instance,
        presence: event.data
      }
    });
    window.dispatchEvent(customEvent);
  }

  // Configuração padrão de webhook para n8n
  getN8NWebhookConfig(n8nUrl: string): WebhookConfig {
    return {
      webhook: {
        url: n8nUrl,
        by_events: true,
        base64: false,
        events: [
          WEBHOOK_EVENTS.MESSAGES_UPSERT,
          WEBHOOK_EVENTS.MESSAGES_UPDATE,
          WEBHOOK_EVENTS.CONNECTION_UPDATE,
          WEBHOOK_EVENTS.STATUS_INSTANCE,
          WEBHOOK_EVENTS.PRESENCE_UPDATE
        ]
      }
    };
  }
}

export const webhookService = new EvolutionWebhookService();