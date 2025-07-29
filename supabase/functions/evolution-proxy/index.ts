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
    console.log('=== Evolution Proxy Request ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Headers:', Object.fromEntries(req.headers.entries()));

    let requestBody;
    try {
      const bodyText = await req.text();
      console.log('Raw request body:', bodyText);
      
      if (bodyText) {
        requestBody = JSON.parse(bodyText);
        console.log('Parsed request body:', JSON.stringify(requestBody, null, 2));
      } else {
        throw new Error('Empty request body');
      }
    } catch (error) {
      console.error('Failed to parse request body:', error);
      return new Response(JSON.stringify({ 
        error: 'Invalid JSON in request body',
        details: error.message
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { url, path, method, headers: requestHeaders, body } = requestBody;

    if (!url || !path || !method) {
      console.error('Missing required parameters:', { url, path, method });
      return new Response(JSON.stringify({ 
        error: 'Missing required parameters: url, path, method' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Proxying ${method} request to: ${url}${path}`);

    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verificar autenticação
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return new Response(JSON.stringify({ error: 'Invalid authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Authenticated user:', user.id);

    // Preparar URL completa (priorizar do Supabase secrets, depois do request)
    const evolutionServerUrl = Deno.env.get('EVOLUTION_SERVER_URL') || url || 'https://evolution.serverwegrowup.com.br';
    const evolutionUrl = `${evolutionServerUrl}${path}`;
    console.log('Evolution Server URL:', evolutionServerUrl);
    console.log('Evolution Full URL:', evolutionUrl);

    // Preparar headers para Evolution API
    const fetchHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Evolution-Proxy/1.0'
    };

    // Adicionar API key (priorizar do Supabase secrets, depois do request)
    const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY') || requestHeaders?.apikey;
    if (evolutionApiKey) {
      fetchHeaders['apikey'] = evolutionApiKey;
      console.log('API Key added to headers (masked):', evolutionApiKey.substring(0, 8) + '...');
    } else {
      console.warn('No API key provided in headers or environment');
    }

    console.log('Final fetch headers:', { ...fetchHeaders, apikey: fetchHeaders.apikey ? '[MASKED]' : 'NOT_SET' });
    console.log('Request body:', body);

    // Fazer a requisição para a Evolution API
    const fetchOptions: RequestInit = {
      method,
      headers: fetchHeaders,
      body: body ? JSON.stringify(body) : undefined,
    };

    console.log('Making request to Evolution API...');
    
    const response = await fetch(evolutionUrl, fetchOptions);

    console.log(`Evolution API Response Status: ${response.status} ${response.statusText}`);
    console.log('Evolution API Response Headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('Evolution API Raw Response:', responseText);

    let responseData;
    try {
      responseData = responseText ? JSON.parse(responseText) : {};
      console.log('Evolution API Parsed Response:', responseData);
    } catch (parseError) {
      console.warn('Failed to parse Evolution API response as JSON:', parseError);
      responseData = { 
        message: responseText,
        parseError: parseError.message 
      };
    }

    // Retornar resposta
    if (!response.ok) {
      console.error(`Evolution API returned error status ${response.status}`);
      return new Response(JSON.stringify({
        error: `Evolution API error: ${response.status} ${response.statusText}`,
        details: responseData,
        status: response.status,
        url: evolutionUrl,
        requestBody: body
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Unexpected error in evolution-proxy:', error);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});