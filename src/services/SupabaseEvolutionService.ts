import { supabase } from '@/integrations/supabase/client';

export interface EvolutionInstance {
  id: string;
  user_id: string;
  instance_name: string;
  api_key?: string;
  api_url?: string;
  webhook_url?: string;
  status: string;
  qr_code?: string;
  phone_number?: string;
  last_connection?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  instance_id: string;
  user_id: string;
  message_id: string;
  remote_jid: string;
  from_me: boolean;
  message_type: string;
  text_content?: string;
  media_url?: string;
  media_type?: string;
  contact_data?: any;
  location_data?: any;
  timestamp: string;
  read_at?: string;
  created_at: string;
}

export interface Contact {
  id: string;
  instance_id: string;
  user_id: string;
  remote_jid: string;
  name?: string;
  push_name?: string;
  profile_picture_url?: string;
  phone_number?: string;
  is_whatsapp: boolean;
  last_seen?: string;
  created_at: string;
  updated_at: string;
}

class SupabaseEvolutionService {
  // Instâncias
  async createInstance(instanceData: Partial<EvolutionInstance>) {
    const user = await supabase.auth.getUser();
    if (!user.data.user?.id) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('evolution_instances')
      .insert({
        ...instanceData,
        user_id: user.data.user.id,
        instance_name: instanceData.instance_name || '',
      })
      .select()
      .single();
    
    return { data, error };
  }

  async getInstances() {
    const { data, error } = await supabase
      .from('evolution_instances')
      .select('*')
      .order('created_at', { ascending: false });
    
    return { data, error };
  }

  async updateInstance(id: string, updates: Partial<EvolutionInstance>) {
    const { data, error } = await supabase
      .from('evolution_instances')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  }

  async deleteInstance(id: string) {
    const { error } = await supabase
      .from('evolution_instances')
      .delete()
      .eq('id', id);
    
    return { error };
  }

  // Mensagens
  async getMessages(instanceId: string, limit = 50) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('instance_id', instanceId)
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    return { data, error };
  }

  async saveMessage(messageData: Partial<Message>) {
    const user = await supabase.auth.getUser();
    if (!user.data.user?.id) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('messages')
      .insert({
        ...messageData,
        user_id: user.data.user.id,
        instance_id: messageData.instance_id || '',
        message_id: messageData.message_id || '',
        remote_jid: messageData.remote_jid || '',
        message_type: messageData.message_type || 'text',
      })
      .select()
      .single();
    
    return { data, error };
  }

  async markMessageAsRead(messageId: string) {
    const { data, error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('id', messageId)
      .select()
      .single();
    
    return { data, error };
  }

  // Contatos
  async getContacts(instanceId: string) {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('instance_id', instanceId)
      .order('name', { ascending: true });
    
    return { data, error };
  }

  async saveContact(contactData: Partial<Contact>) {
    const user = await supabase.auth.getUser();
    if (!user.data.user?.id) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('contacts')
      .upsert({
        ...contactData,
        user_id: user.data.user.id,
        instance_id: contactData.instance_id || '',
        remote_jid: contactData.remote_jid || '',
      }, {
        onConflict: 'instance_id,remote_jid'
      })
      .select()
      .single();
    
    return { data, error };
  }

  // Configurações do usuário
  async getUserSettings() {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .single();
    
    return { data, error };
  }

  async updateUserSettings(settings: any) {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    const { data, error } = await supabase
      .from('user_settings')
      .upsert([{
        user_id: userId,
        ...settings
      }])
      .select()
      .single();
    
    return { data, error };
  }

  // Perfil do usuário
  async getProfile() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .single();
    
    return { data, error };
  }

  async updateProfile(profileData: any) {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    const { data, error } = await supabase
      .from('profiles')
      .upsert([{
        user_id: userId,
        ...profileData
      }])
      .select()
      .single();
    
    return { data, error };
  }

  // Realtime subscriptions
  subscribeToInstances(callback: (payload: any) => void) {
    return supabase
      .channel('evolution_instances_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'evolution_instances'
      }, callback)
      .subscribe();
  }

  subscribeToMessages(instanceId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`messages_${instanceId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `instance_id=eq.${instanceId}`
      }, callback)
      .subscribe();
  }

  subscribeToContacts(instanceId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`contacts_${instanceId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'contacts',
        filter: `instance_id=eq.${instanceId}`
      }, callback)
      .subscribe();
  }
}

export const supabaseEvolutionService = new SupabaseEvolutionService();