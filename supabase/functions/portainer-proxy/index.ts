import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PortainerRequest {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  requiresAuth?: boolean;
}

// Global JWT token para reutilização
let cachedJwtToken: string | null = null;
let tokenExpiry: number = 0;

Deno.serve(async (req) => {
  console.log('=== Portainer Proxy Request ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const rawBody = await req.text();
    console.log('Raw request body:', rawBody);
    
    if (!rawBody) {
      throw new Error('Empty request body');
    }

    const requestData: PortainerRequest = JSON.parse(rawBody);
    console.log('Parsed request data:', JSON.stringify(requestData, null, 2));

    // Validar dados obrigatórios
    if (!requestData.endpoint) {
      throw new Error('Missing endpoint in request');
    }

    // Obter secrets do Supabase
    const portainerUrl = Deno.env.get('PORTAINER_URL');
    const portainerUsername = Deno.env.get('PORTAINER_USERNAME');
    const portainerPassword = Deno.env.get('PORTAINER_PASSWORD');

    if (!portainerUrl || !portainerUsername || !portainerPassword) {
      throw new Error('Missing Portainer configuration. Please configure PORTAINER_URL, PORTAINER_USERNAME, and PORTAINER_PASSWORD secrets.');
    }

    console.log('Portainer URL:', portainerUrl);
    console.log('Has Portainer credentials:', !!portainerUsername && !!portainerPassword);

    // Autenticar se necessário e não temos token válido
    if (requestData.requiresAuth !== false && (!cachedJwtToken || Date.now() > tokenExpiry)) {
      console.log('Authenticating with Portainer...');
      
      const authResponse = await fetch(`${portainerUrl}/api/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Username: portainerUsername,
          Password: portainerPassword
        })
      });

      if (!authResponse.ok) {
        const authError = await authResponse.text();
        console.error('Portainer authentication failed:', authError);
        throw new Error(`Portainer authentication failed: ${authResponse.status} ${authError}`);
      }

      const authData = await authResponse.json();
      cachedJwtToken = authData.jwt;
      // Token válido por 8 horas (valor padrão do Portainer)
      tokenExpiry = Date.now() + (8 * 60 * 60 * 1000);
      
      console.log('Authentication successful, token cached');
    }

    // Preparar headers para a requisição
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json',
    };

    // Adicionar JWT token se necessário
    if (requestData.requiresAuth !== false && cachedJwtToken) {
      headers['Authorization'] = `Bearer ${cachedJwtToken}`;
    }

    // Construir URL completa
    const fullUrl = `${portainerUrl}${requestData.endpoint}`;
    console.log('Making request to:', fullUrl);
    console.log('Method:', requestData.method);
    console.log('Headers:', JSON.stringify(headers, null, 2));
    console.log('Body:', requestData.body ? JSON.stringify(requestData.body, null, 2) : 'No body');

    // Fazer a requisição para o Portainer
    const portainerResponse = await fetch(fullUrl, {
      method: requestData.method,
      headers,
      body: requestData.body ? JSON.stringify(requestData.body) : undefined
    });

    console.log('Portainer response status:', portainerResponse.status);
    console.log('Portainer response headers:', JSON.stringify(Object.fromEntries(portainerResponse.headers.entries()), null, 2));

    // Verificar se a resposta é bem-sucedida
    if (!portainerResponse.ok) {
      const errorText = await portainerResponse.text();
      console.error('Portainer API error:', errorText);
      
      // Se erro de autenticação, limpar token cached
      if (portainerResponse.status === 401 || portainerResponse.status === 403) {
        cachedJwtToken = null;
        tokenExpiry = 0;
      }
      
      return new Response(JSON.stringify({
        error: `Portainer API error: ${portainerResponse.status}`,
        details: errorText
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse da resposta
    const responseText = await portainerResponse.text();
    console.log('Portainer response body:', responseText);

    let responseData;
    try {
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      // Se não for JSON válido, retornar como texto
      responseData = responseText;
    }

    console.log('Parsed response data:', responseData);

    // Retornar sucesso
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in portainer-proxy:', error);
    
    return new Response(JSON.stringify({
      error: 'Invalid JSON in request body',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});