// Cloudflare Worker para dominiomenu.com
// Este worker faz proxy das chamadas API para o backend do Replit

const REPLIT_BACKEND = 'https://29824401-c1d7-4113-aee2-051f45c04452-00-3aipz2hk07y9j.kirk.replit.dev';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url);
  
  // Proxy API calls para o backend do Replit
  if (url.pathname.startsWith('/api/')) {
    return proxyToReplit(request, url);
  }
  
  // Proxy uploads para o backend do Replit
  if (url.pathname.startsWith('/uploads/')) {
    return proxyToReplit(request, url);
  }
  
  // Servir arquivos estáticos do próprio Cloudflare
  return fetch(request);
}

async function proxyToReplit(request, url) {
  // Construir URL do Replit
  const replitUrl = REPLIT_BACKEND + url.pathname + url.search;
  
  // Copiar headers da requisição original
  const headers = new Headers(request.headers);
  headers.set('Host', '29824401-c1d7-4113-aee2-051f45c04452-00-3aipz2hk07y9j.kirk.replit.dev');
  headers.set('Origin', 'https://dominiomenu.com');
  
  // Criar nova requisição para o Replit
  const modifiedRequest = new Request(replitUrl, {
    method: request.method,
    headers: headers,
    body: request.body,
  });
  
  try {
    // Fazer requisição para o Replit
    const response = await fetch(modifiedRequest);
    
    // Copiar resposta e adicionar headers CORS
    const modifiedResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
    
    // Adicionar headers CORS
    modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');
    modifiedResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    modifiedResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return modifiedResponse;
    
  } catch (error) {
    console.error('Erro no proxy:', error);
    return new Response('Erro interno do servidor', { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain'
      }
    });
  }
}

// Tratar requisições OPTIONS (preflight CORS)
addEventListener('fetch', event => {
  if (event.request.method === 'OPTIONS') {
    event.respondWith(handleOptions(event.request));
  }
});

function handleOptions(request) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}