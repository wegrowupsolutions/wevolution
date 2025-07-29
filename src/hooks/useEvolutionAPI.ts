// Hook customizado para gerenciar API Key
import { useState, useEffect } from 'react';

export const useApiKey = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('evolution-api-key');
    setApiKey(stored);
  }, []);

  const updateApiKey = (key: string | null) => {
    if (key) {
      localStorage.setItem('evolution-api-key', key);
    } else {
      localStorage.removeItem('evolution-api-key');
    }
    setApiKey(key);
  };

  return { apiKey, updateApiKey };
};

// Hook para ouvir eventos de webhook em tempo real
export const useWebhookEvents = () => {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<Record<string, string>>({});
  const [newMessages, setNewMessages] = useState<any[]>([]);

  useEffect(() => {
    const handleQRCodeUpdate = (event: CustomEvent) => {
      setQrCode(event.detail.qrcode);
    };

    const handleConnectionUpdate = (event: CustomEvent) => {
      setConnectionStatus(prev => ({
        ...prev,
        [event.detail.instance]: event.detail.state
      }));
    };

    const handleNewMessage = (event: CustomEvent) => {
      setNewMessages(prev => [...prev, event.detail.message]);
    };

    window.addEventListener('qrcode-updated', handleQRCodeUpdate as EventListener);
    window.addEventListener('connection-updated', handleConnectionUpdate as EventListener);
    window.addEventListener('new-message', handleNewMessage as EventListener);

    return () => {
      window.removeEventListener('qrcode-updated', handleQRCodeUpdate as EventListener);
      window.removeEventListener('connection-updated', handleConnectionUpdate as EventListener);
      window.removeEventListener('new-message', handleNewMessage as EventListener);
    };
  }, []);

  return { qrCode, connectionStatus, newMessages };
};