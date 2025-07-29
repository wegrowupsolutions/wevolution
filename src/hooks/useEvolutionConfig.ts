import { useState, useEffect } from 'react';

export interface EvolutionConfig {
  serverUrl: string;
  apiKey: string;
  exposeInFetchInstances: boolean;
  delInstance: boolean;
  qrcodeLimit: number;
  qrcodeColor: string;
  language: string;
}

const defaultConfig: EvolutionConfig = {
  serverUrl: '',
  apiKey: '',
  exposeInFetchInstances: true,
  delInstance: false,
  qrcodeLimit: 1902,
  qrcodeColor: '#175197',
  language: 'pt-BR'
};

export const useEvolutionConfig = () => {
  const [config, setConfig] = useState<EvolutionConfig | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('evolution-config');
    if (stored) {
      try {
        const parsedConfig = JSON.parse(stored);
        setConfig(parsedConfig);
        setIsConfigured(true);
      } catch (error) {
        console.error('Error parsing stored config:', error);
        setIsConfigured(false);
      }
    }
  }, []);

  const updateConfig = (newConfig: EvolutionConfig) => {
    localStorage.setItem('evolution-config', JSON.stringify(newConfig));
    setConfig(newConfig);
    setIsConfigured(true);
  };

  const clearConfig = () => {
    localStorage.removeItem('evolution-config');
    setConfig(null);
    setIsConfigured(false);
  };

  return {
    config: config || defaultConfig,
    isConfigured,
    updateConfig,
    clearConfig
  };
};