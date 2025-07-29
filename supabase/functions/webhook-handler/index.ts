import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookData = await req.json();
    
    console.log('Received webhook:', JSON.stringify(webhookData, null, 2));

    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Processar diferentes tipos de webhook
    const { event, instance, data } = webhookData;

    switch (event) {
      case 'qrcode.updated':
        await handleQRCodeUpdate(supabase, instance, data);
        break;
      
      case 'connection.update':
        await handleConnectionUpdate(supabase, instance, data);
        break;
      
      case 'messages.upsert':
        await handleMessageUpsert(supabase, instance, data);
        break;
      
      case 'contacts.upsert':
        await handleContactUpsert(supabase, instance, data);
        break;
      
      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    return new Response(JSON.stringify({ status: 'ok' }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error in webhook-handler:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
});

async function handleQRCodeUpdate(supabase: any, instance: string, data: any) {
  console.log(`Updating QR code for instance: ${instance}`);
  
  const { error } = await supabase
    .from('evolution_instances')
    .update({
      qr_code: data.qrcode,
      status: 'qr_code'
    })
    .eq('instance_name', instance);

  if (error) {
    console.error('Error updating QR code:', error);
  }
}

async function handleConnectionUpdate(supabase: any, instance: string, data: any) {
  console.log(`Updating connection status for instance: ${instance} to ${data.state}`);
  
  const updates: any = {
    status: data.state,
    last_connection: new Date().toISOString()
  };

  if (data.state === 'open') {
    updates.qr_code = null; // Clear QR code when connected
  }

  const { error } = await supabase
    .from('evolution_instances')
    .update(updates)
    .eq('instance_name', instance);

  if (error) {
    console.error('Error updating connection status:', error);
  }
}

async function handleMessageUpsert(supabase: any, instance: string, data: any) {
  console.log(`Processing message for instance: ${instance}`);
  
  // Buscar a instância para obter o instance_id
  const { data: instanceData, error: instanceError } = await supabase
    .from('evolution_instances')
    .select('id, user_id')
    .eq('instance_name', instance)
    .single();

  if (instanceError || !instanceData) {
    console.error('Instance not found:', instanceError);
    return;
  }

  // Processar a mensagem
  const messageData = {
    instance_id: instanceData.id,
    user_id: instanceData.user_id,
    message_id: data.key.id,
    remote_jid: data.key.remoteJid,
    from_me: data.key.fromMe,
    message_type: data.messageType || 'text',
    text_content: data.message?.conversation || data.message?.extendedTextMessage?.text,
    timestamp: new Date(data.messageTimestamp * 1000).toISOString(),
  };

  // Adicionar dados específicos do tipo de mensagem
  if (data.message?.imageMessage) {
    messageData.message_type = 'image';
    messageData.media_type = data.message.imageMessage.mimetype;
  } else if (data.message?.audioMessage) {
    messageData.message_type = 'audio';
    messageData.media_type = data.message.audioMessage.mimetype;
  } else if (data.message?.videoMessage) {
    messageData.message_type = 'video';
    messageData.media_type = data.message.videoMessage.mimetype;
  }

  const { error } = await supabase
    .from('messages')
    .upsert([messageData], {
      onConflict: 'message_id,instance_id'
    });

  if (error) {
    console.error('Error saving message:', error);
  }
}

async function handleContactUpsert(supabase: any, instance: string, data: any) {
  console.log(`Processing contact for instance: ${instance}`);
  
  // Buscar a instância para obter o instance_id
  const { data: instanceData, error: instanceError } = await supabase
    .from('evolution_instances')
    .select('id, user_id')
    .eq('instance_name', instance)
    .single();

  if (instanceError || !instanceData) {
    console.error('Instance not found:', instanceError);
    return;
  }

  const contactData = {
    instance_id: instanceData.id,
    user_id: instanceData.user_id,
    remote_jid: data.id,
    name: data.name,
    push_name: data.pushName,
    profile_picture_url: data.profilePictureUrl,
    phone_number: data.id.split('@')[0],
    is_whatsapp: true,
  };

  const { error } = await supabase
    .from('contacts')
    .upsert([contactData], {
      onConflict: 'instance_id,remote_jid'
    });

  if (error) {
    console.error('Error saving contact:', error);
  }
}