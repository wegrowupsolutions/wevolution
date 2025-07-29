import { supabase } from '@/integrations/supabase/client';
import { supabaseEvolutionService } from './SupabaseEvolutionService';

class IntegratedEvolutionService {
  // Proxy para fazer chamadas à Evolution API através do edge function
  private async callEvolutionAPI(path: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', body?: any, apiKey?: string) {
    const session = await supabase.auth.getSession();
    if (!session.data.session?.access_token) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase.functions.invoke('evolution-proxy', {
      body: {
        url: 'https://api.evolution.com', // URL base da Evolution API
        path,
        method,
        headers: apiKey ? { apikey: apiKey } : {},
        body
      },
      headers: {
        Authorization: `Bearer ${session.data.session.access_token}`,
      },
    });

    if (error) throw error;
    return data;
  }

  // Instâncias
  async createInstance(instanceData: {
    instanceName: string;
    token?: string;
    qrcode?: boolean;
    webhook?: string;
    webhook_by_events?: boolean;
    events?: string[];
    apiUrl: string;
    apiKey: string;
  }) {
    try {
      // Criar instância via Evolution API
      const evolutionResponse = await this.callEvolutionAPI('/instance/create', 'POST', {
        instanceName: instanceData.instanceName,
        token: instanceData.token,
        qrcode: instanceData.qrcode !== false,
        webhook: instanceData.webhook,
        webhook_by_events: instanceData.webhook_by_events,
        events: instanceData.events || [
          'qrcode.updated',
          'connection.update',
          'messages.upsert',
          'contacts.upsert'
        ]
      }, instanceData.apiKey);

      // Salvar no banco de dados local
      const dbResult = await supabaseEvolutionService.createInstance({
        instance_name: instanceData.instanceName,
        api_key: instanceData.apiKey,
        api_url: instanceData.apiUrl,
        webhook_url: instanceData.webhook,
        status: 'created'
      });

      return { evolutionResponse, dbResult };
    } catch (error) {
      console.error('Error creating instance:', error);
      throw error;
    }
  }

  async connectInstance(instanceId: string, apiKey: string) {
    try {
      // Buscar dados da instância
      const { data: instance } = await supabaseEvolutionService.getInstances();
      const targetInstance = instance?.find(i => i.id === instanceId);
      
      if (!targetInstance) {
        throw new Error('Instance not found');
      }

      // Conectar via Evolution API
      const qrData = await this.callEvolutionAPI(`/instance/connect/${targetInstance.instance_name}`, 'GET', undefined, apiKey);

      // Atualizar status no banco
      await supabaseEvolutionService.updateInstance(instanceId, {
        status: 'connecting',
        qr_code: qrData.base64
      });

      return qrData;
    } catch (error) {
      console.error('Error connecting instance:', error);
      throw error;
    }
  }

  async getInstanceStatus(instanceId: string, apiKey: string) {
    try {
      const { data: instance } = await supabaseEvolutionService.getInstances();
      const targetInstance = instance?.find(i => i.id === instanceId);
      
      if (!targetInstance) {
        throw new Error('Instance not found');
      }

      const status = await this.callEvolutionAPI(`/instance/connectionState/${targetInstance.instance_name}`, 'GET', undefined, apiKey);
      
      // Atualizar status no banco
      await supabaseEvolutionService.updateInstance(instanceId, {
        status: status.state
      });

      return status;
    } catch (error) {
      console.error('Error getting instance status:', error);
      throw error;
    }
  }

  // Mensagens
  async sendTextMessage(instanceId: string, to: string, text: string, apiKey: string) {
    try {
      const { data: instance } = await supabaseEvolutionService.getInstances();
      const targetInstance = instance?.find(i => i.id === instanceId);
      
      if (!targetInstance) {
        throw new Error('Instance not found');
      }

      const response = await this.callEvolutionAPI(`/message/sendText/${targetInstance.instance_name}`, 'POST', {
        number: to,
        text: text
      }, apiKey);

      // Salvar mensagem no banco
      await supabaseEvolutionService.saveMessage({
        instance_id: instanceId,
        message_id: response.key?.id || `${Date.now()}`,
        remote_jid: to,
        from_me: true,
        message_type: 'text',
        text_content: text,
        timestamp: new Date().toISOString()
      });

      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async findMessages(instanceId: string, params: any, apiKey: string) {
    try {
      const { data: instance } = await supabaseEvolutionService.getInstances();
      const targetInstance = instance?.find(i => i.id === instanceId);
      
      if (!targetInstance) {
        throw new Error('Instance not found');
      }

      const messages = await this.callEvolutionAPI(`/chat/findMessages/${targetInstance.instance_name}`, 'POST', params, apiKey);

      // Sincronizar com o banco local
      if (messages && Array.isArray(messages)) {
        for (const message of messages) {
          await supabaseEvolutionService.saveMessage({
            instance_id: instanceId,
            message_id: message.key?.id || `${Date.now()}`,
            remote_jid: message.key?.remoteJid || '',
            from_me: message.key?.fromMe || false,
            message_type: message.messageType || 'text',
            text_content: message.message?.conversation || message.message?.extendedTextMessage?.text,
            timestamp: new Date(message.messageTimestamp * 1000).toISOString()
          });
        }
      }

      return messages;
    } catch (error) {
      console.error('Error finding messages:', error);
      throw error;
    }
  }

  // Contatos
  async fetchContacts(instanceId: string, apiKey: string) {
    try {
      const { data: instance } = await supabaseEvolutionService.getInstances();
      const targetInstance = instance?.find(i => i.id === instanceId);
      
      if (!targetInstance) {
        throw new Error('Instance not found');
      }

      const contacts = await this.callEvolutionAPI(`/chat/fetchContacts/${targetInstance.instance_name}`, 'GET', undefined, apiKey);

      // Sincronizar com o banco local
      if (contacts && Array.isArray(contacts)) {
        for (const contact of contacts) {
          await supabaseEvolutionService.saveContact({
            instance_id: instanceId,
            remote_jid: contact.id,
            name: contact.name,
            push_name: contact.pushName,
            profile_picture_url: contact.profilePictureUrl,
            phone_number: contact.id?.split('@')[0],
            is_whatsapp: true
          });
        }
      }

      return contacts;
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  }

  // Métodos para acessar dados locais (offline)
  getLocalInstances() {
    return supabaseEvolutionService.getInstances();
  }

  getLocalMessages(instanceId: string, limit?: number) {
    return supabaseEvolutionService.getMessages(instanceId, limit);
  }

  getLocalContacts(instanceId: string) {
    return supabaseEvolutionService.getContacts(instanceId);
  }

  // Subscriptions para real-time
  subscribeToInstanceUpdates(callback: (payload: any) => void) {
    return supabaseEvolutionService.subscribeToInstances(callback);
  }

  subscribeToMessages(instanceId: string, callback: (payload: any) => void) {
    return supabaseEvolutionService.subscribeToMessages(instanceId, callback);
  }

  subscribeToContacts(instanceId: string, callback: (payload: any) => void) {
    return supabaseEvolutionService.subscribeToContacts(instanceId, callback);
  }
}

export const integratedEvolutionService = new IntegratedEvolutionService();