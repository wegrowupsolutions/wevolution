-- Criar tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Criar políticas para perfis
CREATE POLICY "Usuários podem ver seus próprios perfis" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios perfis" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios perfis" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Criar tabela de instâncias Evolution
CREATE TABLE public.evolution_instances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  instance_name TEXT NOT NULL UNIQUE,
  api_key TEXT,
  api_url TEXT,
  webhook_url TEXT,
  status TEXT DEFAULT 'disconnected',
  qr_code TEXT,
  phone_number TEXT,
  last_connection TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para instâncias
ALTER TABLE public.evolution_instances ENABLE ROW LEVEL SECURITY;

-- Criar políticas para instâncias
CREATE POLICY "Usuários podem gerenciar suas próprias instâncias" 
ON public.evolution_instances 
FOR ALL 
USING (auth.uid() = user_id);

-- Criar tabela de mensagens
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instance_id UUID NOT NULL REFERENCES public.evolution_instances(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id TEXT NOT NULL,
  remote_jid TEXT NOT NULL,
  from_me BOOLEAN NOT NULL DEFAULT false,
  message_type TEXT NOT NULL,
  text_content TEXT,
  media_url TEXT,
  media_type TEXT,
  contact_data JSONB,
  location_data JSONB,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para mensagens
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Criar políticas para mensagens
CREATE POLICY "Usuários podem gerenciar mensagens de suas instâncias" 
ON public.messages 
FOR ALL 
USING (auth.uid() = user_id);

-- Criar tabela de contatos
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instance_id UUID NOT NULL REFERENCES public.evolution_instances(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  remote_jid TEXT NOT NULL,
  name TEXT,
  push_name TEXT,
  profile_picture_url TEXT,
  phone_number TEXT,
  is_whatsapp BOOLEAN DEFAULT true,
  last_seen TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(instance_id, remote_jid)
);

-- Habilitar RLS para contatos
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Criar políticas para contatos
CREATE POLICY "Usuários podem gerenciar contatos de suas instâncias" 
ON public.contacts 
FOR ALL 
USING (auth.uid() = user_id);

-- Criar tabela de grupos
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instance_id UUID NOT NULL REFERENCES public.evolution_instances(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_jid TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  owner_jid TEXT,
  participants_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(instance_id, group_jid)
);

-- Habilitar RLS para grupos
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Criar políticas para grupos
CREATE POLICY "Usuários podem gerenciar grupos de suas instâncias" 
ON public.groups 
FOR ALL 
USING (auth.uid() = user_id);

-- Criar tabela de configurações
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  evolution_api_url TEXT,
  default_instance TEXT,
  webhook_enabled BOOLEAN DEFAULT false,
  notifications_enabled BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para configurações
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Criar políticas para configurações
CREATE POLICY "Usuários podem gerenciar suas próprias configurações" 
ON public.user_settings 
FOR ALL 
USING (auth.uid() = user_id);

-- Função para atualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers para timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_evolution_instances_updated_at
  BEFORE UPDATE ON public.evolution_instances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar realtime para tabelas principais
ALTER TABLE public.evolution_instances REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.contacts REPLICA IDENTITY FULL;

-- Adicionar tabelas à publicação de realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.evolution_instances;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contacts;