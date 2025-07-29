// Configurações da API
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_EVOLUTION_API_URL || 'https://api.evolution.com',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
};

// Endpoints da Evolution API
export const API_ENDPOINTS = {
  // Instance Management
  instance: {
    create: '/instance/create',
    connect: '/instance/connect',
    fetch: '/instance/fetchInstances',
    restart: '/instance/restart',
    delete: '/instance/delete',
    logout: '/instance/logout',
    info: '/instance/info',
    qrcode: '/instance/qrcode',
    status: '/instance/connectionState'
  },
  
  // Message Controller
  message: {
    sendText: '/message/sendText',
    sendMedia: '/message/sendMedia',
    sendAudio: '/message/sendAudio',
    sendVideo: '/message/sendVideo',
    sendImage: '/message/sendImage',
    sendDocument: '/message/sendDocument',
    sendContact: '/message/sendContact',
    sendLocation: '/message/sendLocation',
    sendReaction: '/message/sendReaction',
    markAsRead: '/message/markMessageAsRead'
  },
  
  // Chat Controller
  chat: {
    findMessages: '/chat/findMessages',
    findContacts: '/chat/findContacts',
    whatsappNumbers: '/chat/whatsappNumbers',
    archiveChat: '/chat/archiveChat',
    deleteMessage: '/chat/deleteMessage',
    fetchProfile: '/chat/fetchProfile',
    updatePresence: '/chat/updatePresence',
    fetchContacts: '/chat/fetchContacts'
  },
  
  // Webhook
  webhook: {
    set: '/webhook/set',
    find: '/webhook/find'
  },
  
  // Group Controller
  group: {
    create: '/group/create',
    updateGroupPicture: '/group/updateGroupPicture',
    updateGroupSubject: '/group/updateGroupSubject',
    updateGroupDescription: '/group/updateGroupDescription',
    findGroup: '/group/findGroupInfos',
    participants: '/group/participants',
    updateSetting: '/group/updateSetting',
    toggleEphemeral: '/group/toggleEphemeral',
    revokeInviteCode: '/group/revokeInviteCode',
    sendInvite: '/group/sendInvite',
    leaveGroup: '/group/leaveGroup'
  }
};

// Status de conexão da instância
export const CONNECTION_STATUS = {
  OPEN: 'open',
  CONNECTING: 'connecting', 
  CLOSE: 'close'
} as const;

// Tipos de evento de webhook
export const WEBHOOK_EVENTS = {
  QRCODE_UPDATED: 'qrcode.updated',
  CONNECTION_UPDATE: 'connection.update',
  STATUS_INSTANCE: 'status.instance',
  MESSAGES_UPSERT: 'messages.upsert',
  MESSAGES_UPDATE: 'messages.update',
  PRESENCE_UPDATE: 'presence.update',
  CHATS_UPSERT: 'chats.upsert',
  CHATS_UPDATE: 'chats.update',
  CHATS_DELETE: 'chats.delete',
  CONTACTS_UPSERT: 'contacts.upsert',
  CONTACTS_UPDATE: 'contacts.update',
  GROUPS_UPSERT: 'groups.upsert',
  GROUPS_UPDATE: 'groups.update',
  GROUP_PARTICIPANTS_UPDATE: 'group.participants.update'
} as const;