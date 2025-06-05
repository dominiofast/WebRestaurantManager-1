# Configuração do Domínio Próprio - dominiomenu.com

## Problema Atual
O domínio `https://dominiomenu.com/` está servindo apenas arquivos estáticos React, mas não tem acesso ao backend Node.js que contém:
- API endpoints (/api/menu/*)
- Dados do cardápio
- Sistema de autenticação
- Upload de imagens (/uploads/*)

## Soluções Possíveis

### Opção 1: Configuração de Proxy/Reverse Proxy (RECOMENDADA)

Configure o servidor do domínio `dominiomenu.com` para fazer proxy das chamadas de API para o backend do Replit:

```nginx
# Configuração Nginx
server {
    listen 443 ssl;
    server_name dominiomenu.com www.dominiomenu.com;

    # Proxy para API calls
    location /api/ {
        proxy_pass https://29824401-c1d7-4113-aee2-051f45c04452-00-3aipz2hk07y9j.kirk.replit.dev;
        proxy_set_header Host 29824401-c1d7-4113-aee2-051f45c04452-00-3aipz2hk07y9j.kirk.replit.dev;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Proxy para uploads
    location /uploads/ {
        proxy_pass https://29824401-c1d7-4113-aee2-051f45c04452-00-3aipz2hk07y9j.kirk.replit.dev;
        proxy_set_header Host 29824401-c1d7-4113-aee2-051f45c04452-00-3aipz2hk07y9j.kirk.replit.dev;
    }

    # Servir arquivos estáticos React
    location / {
        root /var/www/dominiomenu/build;
        try_files $uri $uri/ /index.html;
    }
}
```

### Opção 2: Configuração com Cloudflare Workers

```javascript
// worker.js para Cloudflare
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Proxy API calls para Replit
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/uploads/')) {
    const replitUrl = 'https://29824401-c1d7-4113-aee2-051f45c04452-00-3aipz2hk07y9j.kirk.replit.dev' + url.pathname + url.search
    
    const modifiedRequest = new Request(replitUrl, {
      method: request.method,
      headers: {
        ...request.headers,
        'Host': '29824401-c1d7-4113-aee2-051f45c04452-00-3aipz2hk07y9j.kirk.replit.dev'
      },
      body: request.body
    })
    
    return fetch(modifiedRequest)
  }
  
  // Servir arquivos estáticos do próprio domínio
  return fetch(request)
}
```

### Opção 3: Configuração com Vercel

```json
// vercel.json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://29824401-c1d7-4113-aee2-051f45c04452-00-3aipz2hk07y9j.kirk.replit.dev/api/$1"
    },
    {
      "source": "/uploads/(.*)",
      "destination": "https://29824401-c1d7-4113-aee2-051f45c04452-00-3aipz2hk07y9j.kirk.replit.dev/uploads/$1"
    }
  ]
}
```

## Status Atual do Sistema

✅ **Sistema WhatsApp funcionando** - Configurado para usar domínio próprio nas respostas
✅ **Backend completo no Replit** - API, dados, autenticação funcionando
✅ **Cardápio completo** - 19 produtos com adicionais criados
❌ **Domínio próprio** - Precisa configuração de proxy para acessar backend

## Próximos Passos

1. **Configure o proxy no servidor do dominiomenu.com**
2. **Teste o acesso à API**: `https://dominiomenu.com/api/menu/300-graus-central`
3. **Verifique se as imagens carregam**: `https://dominiomenu.com/uploads/...`

## Comandos de Teste

```bash
# Teste API através do domínio próprio
curl https://dominiomenu.com/api/menu/300-graus-central

# Teste API diretamente no Replit (funciona)
curl https://29824401-c1d7-4113-aee2-051f45c04452-00-3aipz2hk07y9j.kirk.replit.dev/api/menu/300-graus-central
```

## Temporariamente

Enquanto configura o proxy, o WhatsApp está enviando o link `https://dominiomenu.com/menu/300-graus-central`, mas você pode:

1. Orientar clientes a usar o link temporário do Replit se necessário
2. Configurar redirecionamento simples no domínio próprio
3. Implementar uma das soluções de proxy acima