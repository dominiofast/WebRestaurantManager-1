// Sistema de polling para verificar mensagens quando webhook não funciona
const instances = [
  {
    storeId: 3,
    instanceKey: 'megacode-MDT3OHEGIyu',
    apiToken: 'MDT3OHEGIyu',
    apiHost: 'apinocode01.megaapi.com.br'
  },
  {
    storeId: 5,
    instanceKey: 'megacode-McmAMknxcxu',
    apiToken: 'McmAMknxcxu',
    apiHost: 'apinocode01.megaapi.com.br'
  }
];

let lastMessageIds = new Map();

async function checkForNewMessages() {
  console.log('Verificando novas mensagens...');
  
  for (const instance of instances) {
    try {
      // Buscar mensagens recentes
      const response = await fetch(`https://${instance.apiHost}/rest/chat/findMessages/${instance.instanceKey}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${instance.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messageData: {
            limit: 10,
            where: {
              fromMe: false
            }
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.messages && data.messages.length > 0) {
          for (const message of data.messages) {
            const messageId = message.key?.id;
            const lastId = lastMessageIds.get(instance.instanceKey);
            
            if (messageId && messageId !== lastId) {
              console.log(`Nova mensagem encontrada para ${instance.instanceKey}:`, message);
              
              // Processar mensagem
              await processMessage(instance, message);
              
              // Atualizar último ID
              lastMessageIds.set(instance.instanceKey, messageId);
            }
          }
        }
      }
    } catch (error) {
      console.log(`Erro ao verificar mensagens ${instance.instanceKey}:`, error.message);
    }
  }
}

async function processMessage(instance, message) {
  try {
    // Simular webhook local
    const webhookData = {
      instance_key: instance.instanceKey,
      jid: message.key?.remoteJid,
      messageType: message.messageType || 'conversation',
      key: message.key,
      message: message.message
    };

    const response = await fetch(`http://localhost:5000/api/webhook/whatsapp/${instance.storeId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookData)
    });

    console.log(`Mensagem processada para loja ${instance.storeId}:`, response.status);
  } catch (error) {
    console.log(`Erro ao processar mensagem:`, error.message);
  }
}

// Iniciar polling a cada 10 segundos
console.log('Iniciando sistema de polling de mensagens...');
setInterval(checkForNewMessages, 10000);
checkForNewMessages(); // Verificar imediatamente