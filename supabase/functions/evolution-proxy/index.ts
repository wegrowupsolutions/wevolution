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
    console.log('Headers:', Object.fromEntries(req.headers.entries()));

    const requestBody = await req.json();
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

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

    // Preparar headers para a requisição
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Adicionar API key se fornecida
    if (requestHeaders?.apikey) {
      headers['apikey'] = requestHeaders.apikey;
      console.log('API Key added to headers');
    } else {
      console.warn('No API key provided in headers');
    }

    console.log('Request headers to Evolution API:', headers);
    console.log('Request body to Evolution API:', body);

    // Fazer a requisição para a Evolution API
    const fullUrl = `${url}${path}`;
    console.log('Full URL:', fullUrl);

    const response = await fetch(fullUrl, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    console.log(`Response status: ${response.status}`);
    console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));

    const responseData = await response.text();
    console.log(`Raw response data:`, responseData);

    let jsonData;
    
    try {
      jsonData = JSON.parse(responseData);
    } catch (parseError) {
      console.warn('Failed to parse response as JSON:', parseError);
      jsonData = { 
        raw: responseData,
        parseError: parseError.message 
      };
    }

    console.log(`Parsed response data:`, jsonData);

    // Se a resposta não for 2xx, retornar erro mas com detalhes
    if (!response.ok) {
      console.error(`Evolution API returned error status ${response.status}`);
      return new Response(JSON.stringify({
        error: `Evolution API error: ${response.status} ${response.statusText}`,
        details: jsonData,
        status: response.status,
        url: fullUrl
      }), {
        status: response.status,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify(jsonData), {
      status: response.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error in evolution-proxy:', error);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
});