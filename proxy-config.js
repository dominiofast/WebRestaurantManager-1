// Configuração de proxy para domínio personalizado
// Este arquivo deve ser usado no servidor que hospeda dominiomenu.com

const REPLIT_BACKEND = 'https://29824401-c1d7-4113-aee2-051f45c04452-00-3aipz2hk07y9j.kirk.replit.dev';

// Configuração para servidor proxy/CDN
const proxyConfig = {
  // Redirecionar todas as chamadas de API para o backend do Replit
  "/api/*": {
    target: REPLIT_BACKEND,
    changeOrigin: true,
    secure: true,
    headers: {
      'Host': '29824401-c1d7-4113-aee2-051f45c04452-00-3aipz2hk07y9j.kirk.replit.dev'
    }
  },
  
  // Redirecionar uploads para o backend do Replit
  "/uploads/*": {
    target: REPLIT_BACKEND,
    changeOrigin: true,
    secure: true
  },
  
  // Servir arquivos estáticos localmente
  "/*": {
    target: "local", // Servir do build local
    fallback: "/index.html" // SPA fallback
  }
};

// Para Nginx
const nginxConfig = `
server {
    listen 443 ssl;
    server_name dominiomenu.com www.dominiomenu.com;

    # SSL certificates
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;

    # Proxy para API calls
    location /api/ {
        proxy_pass ${REPLIT_BACKEND};
        proxy_set_header Host 29824401-c1d7-4113-aee2-051f45c04452-00-3aipz2hk07y9j.kirk.replit.dev;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Proxy para uploads
    location /uploads/ {
        proxy_pass ${REPLIT_BACKEND};
        proxy_set_header Host 29824401-c1d7-4113-aee2-051f45c04452-00-3aipz2hk07y9j.kirk.replit.dev;
    }

    # Servir arquivos estáticos
    location / {
        root /var/www/dominiomenu/build;
        try_files $uri $uri/ /index.html;
        
        # Cache headers
        location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
`;

module.exports = { proxyConfig, nginxConfig, REPLIT_BACKEND };