// Teste manual do webhook para verificar se está acessível
const https = require('https');

const testData = {
  instance_key: "megacode-McmAMknxcxu",
  jid: "556993910380@s.whatsapp.net",
  messageType: "conversation",
  key: {
    remoteJid: "556993910380@s.whatsapp.net",
    fromMe: false,
    id: "TEST_MANUAL_123"
  },
  message: {
    conversation: "Teste manual do webhook"
  }
};

const options = {
  hostname: 'dominiomenu-app.replit.app',
  port: 443,
  path: '/api/webhook/whatsapp/5',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(JSON.stringify(testData))
  }
};

console.log('Testando webhook externo...');
console.log('URL:', `https://${options.hostname}${options.path}`);
console.log('Dados:', JSON.stringify(testData, null, 2));

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Resposta:', data);
  });
});

req.on('error', (e) => {
  console.error('Erro na requisição:', e.message);
});

req.write(JSON.stringify(testData));
req.end();