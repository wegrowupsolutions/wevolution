import { supabase } from '@/integrations/supabase/client';

export interface PortainerConfig {
  url: string;
  username: string;
  password: string;
}

export interface PortainerContainer {
  Id: string;
  Names: string[];
  Image: string;
  State: string;
  Status: string;
  Ports: any[];
  Created: number;
}

export interface CreateContainerRequest {
  name: string;
  image: string;
  environment?: string[];
  ports?: { [key: string]: any };
  volumes?: { [key: string]: any };
  restartPolicy?: {
    Name: string;
    MaximumRetryCount?: number;
  };
}

class PortainerService {
  private async callPortainerAPI(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any,
    requiresAuth: boolean = true
  ) {
    console.log('=== PortainerService.callPortainerAPI ===');
    console.log('Endpoint:', endpoint);
    console.log('Method:', method);
    console.log('Requires Auth:', requiresAuth);

    const session = await supabase.auth.getSession();
    if (!session.data.session?.access_token) {
      throw new Error('User not authenticated');
    }

    const requestBody = {
      endpoint,
      method,
      body,
      requiresAuth
    };

    console.log('Request to Portainer proxy:', JSON.stringify(requestBody, null, 2));

    try {
      const { data, error } = await supabase.functions.invoke('portainer-proxy', {
        body: JSON.stringify(requestBody),
        headers: {
          Authorization: `Bearer ${session.data.session.access_token}`,
          'Content-Type': 'application/json'
        },
      });

      console.log('Portainer proxy response data:', data);
      console.log('Portainer proxy response error:', error);

      if (error) {
        console.error('Portainer proxy error:', error);
        throw new Error(`Portainer Proxy error: ${error.message}`);
      }

      if (data?.error) {
        console.error('Portainer API error from proxy:', data);
        throw new Error(`Portainer API error: ${data.error}`);
      }

      console.log('Successfully received data from Portainer API:', data);
      return data;
    } catch (fetchError) {
      console.error('Error calling Portainer proxy:', fetchError);
      throw fetchError;
    }
  }

  // Autenticação
  async authenticate(): Promise<string> {
    const authResponse = await this.callPortainerAPI('/api/auth', 'POST', {}, false);
    return authResponse.jwt;
  }

  // Listar endpoints (ambientes Docker)
  async getEndpoints(): Promise<any[]> {
    return await this.callPortainerAPI('/api/endpoints');
  }

  // Listar containers em um endpoint
  async getContainers(endpointId: number): Promise<PortainerContainer[]> {
    return await this.callPortainerAPI(`/api/endpoints/${endpointId}/docker/containers/json?all=true`);
  }

  // Criar container
  async createContainer(endpointId: number, containerConfig: CreateContainerRequest): Promise<any> {
    const dockerConfig = {
      Image: containerConfig.image,
      Env: containerConfig.environment || [],
      ExposedPorts: containerConfig.ports || {},
      HostConfig: {
        Binds: Object.entries(containerConfig.volumes || {}).map(([host, container]) => `${host}:${container}`),
        PortBindings: this.formatPortBindings(containerConfig.ports || {}),
        RestartPolicy: containerConfig.restartPolicy || { Name: 'unless-stopped' }
      }
    };

    console.log('Creating container with config:', JSON.stringify(dockerConfig, null, 2));

    // Criar o container
    const createResponse = await this.callPortainerAPI(
      `/api/endpoints/${endpointId}/docker/containers/create?name=${containerConfig.name}`,
      'POST',
      dockerConfig
    );

    // Iniciar o container
    if (createResponse.Id) {
      await this.startContainer(endpointId, createResponse.Id);
    }

    return createResponse;
  }

  // Iniciar container
  async startContainer(endpointId: number, containerId: string): Promise<void> {
    await this.callPortainerAPI(`/api/endpoints/${endpointId}/docker/containers/${containerId}/start`, 'POST');
  }

  // Parar container
  async stopContainer(endpointId: number, containerId: string): Promise<void> {
    await this.callPortainerAPI(`/api/endpoints/${endpointId}/docker/containers/${containerId}/stop`, 'POST');
  }

  // Deletar container
  async deleteContainer(endpointId: number, containerId: string, force: boolean = false): Promise<void> {
    await this.callPortainerAPI(
      `/api/endpoints/${endpointId}/docker/containers/${containerId}?force=${force}`,
      'DELETE'
    );
  }

  // Obter logs do container
  async getContainerLogs(endpointId: number, containerId: string): Promise<string> {
    return await this.callPortainerAPI(
      `/api/endpoints/${endpointId}/docker/containers/${containerId}/logs?stdout=true&stderr=true&timestamps=true`
    );
  }

  // Criar instância Evolution via Portainer
  async createEvolutionInstance(
    endpointId: number,
    instanceName: string,
    evolutionConfig: any
  ): Promise<any> {
    const containerConfig: CreateContainerRequest = {
      name: `evolution-${instanceName}`,
      image: 'atendai/evolution-api:v2.1.1',
      environment: [
        `SERVER_URL=${evolutionConfig.serverUrl}`,
        `AUTHENTICATION_API_KEY=${evolutionConfig.apiKey}`,
        `AUTHENTICATION_EXPOSE_IN_FETCH_INSTANCES=${evolutionConfig.exposeInFetchInstances}`,
        `DEL_INSTANCE=${evolutionConfig.delInstance}`,
        `QRCODE_LIMIT=${evolutionConfig.qrcodeLimit}`,
        `QRCODE_COLOR=${evolutionConfig.qrcodeColor}`,
        `LANGUAGE=${evolutionConfig.language}`,
        `DATABASE_ENABLED=true`,
        `DATABASE_PROVIDER=postgresql`,
        `DATABASE_CONNECTION_URI=${evolutionConfig.databaseUri}`,
        `WEBHOOK_GLOBAL_ENABLED=true`,
        `WEBHOOK_GLOBAL_URL=${evolutionConfig.webhookUrl || 'https://xzjzxckxaiwneybyduim.supabase.co/functions/v1/webhook-handler'}`,
        `WEBHOOK_EVENTS_QRCODE_UPDATED=true`,
        `WEBHOOK_EVENTS_CONNECTION_UPDATE=true`,
        `WEBHOOK_EVENTS_MESSAGES_UPSERT=true`,
        `WEBHOOK_EVENTS_CONTACTS_UPSERT=true`,
        `WEBHOOK_EVENTS_SEND_MESSAGE=true`
      ],
      ports: {
        '8080/tcp': {}
      },
      restartPolicy: {
        Name: 'unless-stopped'
      }
    };

    return await this.createContainer(endpointId, containerConfig);
  }

  private formatPortBindings(ports: { [key: string]: any }): { [key: string]: any } {
    const bindings: { [key: string]: any } = {};
    
    Object.keys(ports).forEach(port => {
      bindings[port] = [{ HostPort: '' }]; // Deixa o Docker escolher uma porta disponível
    });

    return bindings;
  }
}

export const portainerService = new PortainerService();