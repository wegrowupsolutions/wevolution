import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { API_CONFIG, API_ENDPOINTS } from './api-config';

// Tipos para Group
export interface GroupConfig {
  subject: string;
  description?: string;
  participants: string[];
  promoteParticipants?: boolean;
}

export interface GroupInfo {
  id: string;
  subject: string;
  description?: string;
  creation: number;
  owner: string;
  participants: GroupParticipant[];
  size: number;
}

export interface GroupParticipant {
  id: string;
  admin?: 'admin' | 'superadmin';
}

export interface GroupInvite {
  inviteCode: string;
  inviteUrl: string;
}

class EvolutionGroupService {
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

  // Criar grupo
  async createGroup(instanceName: string, config: GroupConfig): Promise<GroupInfo> {
    const response: AxiosResponse<GroupInfo> = await this.api.post(
      `${API_ENDPOINTS.group.create}/${instanceName}`,
      config
    );
    return response.data;
  }

  // Buscar informações do grupo
  async findGroupInfo(instanceName: string, groupJid: string): Promise<GroupInfo> {
    const response: AxiosResponse<GroupInfo> = await this.api.post(
      `${API_ENDPOINTS.group.findGroup}/${instanceName}`,
      { groupJid }
    );
    return response.data;
  }

  // Atualizar foto do grupo
  async updateGroupPicture(instanceName: string, data: {
    groupJid: string;
    image: string; // base64
  }): Promise<{ status: string }> {
    const response: AxiosResponse<{ status: string }> = await this.api.put(
      `${API_ENDPOINTS.group.updateGroupPicture}/${instanceName}`,
      data
    );
    return response.data;
  }

  // Atualizar nome do grupo
  async updateGroupSubject(instanceName: string, data: {
    groupJid: string;
    subject: string;
  }): Promise<{ status: string }> {
    const response: AxiosResponse<{ status: string }> = await this.api.put(
      `${API_ENDPOINTS.group.updateGroupSubject}/${instanceName}`,
      data
    );
    return response.data;
  }

  // Atualizar descrição do grupo
  async updateGroupDescription(instanceName: string, data: {
    groupJid: string;
    description: string;
  }): Promise<{ status: string }> {
    const response: AxiosResponse<{ status: string }> = await this.api.put(
      `${API_ENDPOINTS.group.updateGroupDescription}/${instanceName}`,
      data
    );
    return response.data;
  }

  // Gerenciar participantes
  async updateParticipants(instanceName: string, data: {
    groupJid: string;
    action: 'add' | 'remove' | 'promote' | 'demote';
    participants: string[];
  }): Promise<{ status: string }> {
    const response: AxiosResponse<{ status: string }> = await this.api.put(
      `${API_ENDPOINTS.group.participants}/${instanceName}`,
      data
    );
    return response.data;
  }

  // Sair do grupo
  async leaveGroup(instanceName: string, groupJid: string): Promise<{ status: string }> {
    const response: AxiosResponse<{ status: string }> = await this.api.delete(
      `${API_ENDPOINTS.group.leaveGroup}/${instanceName}`,
      { data: { groupJid } }
    );
    return response.data;
  }

  // Revogar link de convite
  async revokeInviteCode(instanceName: string, groupJid: string): Promise<GroupInvite> {
    const response: AxiosResponse<GroupInvite> = await this.api.put(
      `${API_ENDPOINTS.group.revokeInviteCode}/${instanceName}`,
      { groupJid }
    );
    return response.data;
  }
}

export const groupService = new EvolutionGroupService();