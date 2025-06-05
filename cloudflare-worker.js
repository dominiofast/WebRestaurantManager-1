// Cloudflare Worker para dominiomenu.com
// IMPORTANTE: Configure as rotas no Cloudflare Dashboard:
// - dominiomenu.com/api/*
// - dominiomenu.com/uploads/*

const REPLIT_BACKEND = 'https://29824401-c1d7-4113-aee2-051f45c04452-00-3aipz2hk07y9j.kirk.replit.dev';

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request);
  }
};

async function handleRequest(request) {
  const url = new URL(request.url);
  
  // Handle OPTIONS requests (CORS preflight)
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Max-Age': '86400',
      },
    });
  }
  
  // Proxy API calls e uploads para o backend do Replit
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/uploads/')) {
    return proxyToReplit(request, url);
  }
  
  // Para outras rotas, retornar erro 404
  return new Response('Not Found', { status: 404 });
}

async function proxyToReplit(request, url) {
  try {
    // Construir URL do Replit
    const replitUrl = REPLIT_BACKEND + url.pathname + url.search;
    
    // Preparar headers
    const headers = new Headers();
    
    // Copiar headers importantes da requisição original
    for (const [key, value] of request.headers.entries()) {
      if (!['host', 'cf-ray', 'cf-connecting-ip'].includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    }
    
    // Definir headers específicos para o Replit
    headers.set('Host', '29824401-c1d7-4113-aee2-051f45c04452-00-3aipz2hk07y9j.kirk.replit.dev');
    headers.set('User-Agent', 'CloudflareWorker/1.0');
    
    // Criar requisição para o Replit
    const replitRequest = new Request(replitUrl, {
      method: request.method,
      headers: headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null,
    });
    
    // Fazer requisição para o Replit
    const response = await fetch(replitRequest);
    
    // Criar nova resposta com headers CORS
    const newResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
    });
    
    // Copiar headers da resposta original
    for (const [key, value] of response.headers.entries()) {
      newResponse.headers.set(key, value);
    }
    
    // Adicionar headers CORS
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    
    return newResponse;
    
  } catch (error) {
    console.error('Erro no proxy para Replit:', error);
    
    return new Response(JSON.stringify({
      error: true,
      message: 'Erro de conexão com o servidor',
      details: error.message
    }), {
      status: 502,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}