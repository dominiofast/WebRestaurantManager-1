async function diagnosticWebhook() {
  try {
    console.log('=== DIAGNÓSTICO DO WEBHOOK ===');
    
    // 1. Verificar status da instância
    console.log('1. Verificando status da instância...');
    const statusResponse = await fetch('https://apinocode01.megaapi.com.br/rest/instance/megacode-MDT3OHEGIyu', {
      headers: {
        'Authorization': 'Bearer MDT3OHEGIyu',
        'Content-Type': 'application/json'
      }
    });
    
    const statusData = await statusResponse.json();
    console.log('Status:', statusData.instance.status);
    console.log('Usuário:', statusData.instance.user.name);
    
    // 2. Verificar configuração do webhook
    console.log('\n2. Verificando configuração do webhook...');
    const webhookResponse = await fetch('https://apinocode01.megaapi.com.br/rest/webhook/megacode-MDT3OHEGIyu', {
      headers: {
        'Authorization': 'Bearer MDT3OHEGIyu',
        'Content-Type': 'application/json'
      }
    });
    
    const webhookData = await webhookResponse.json();
    console.log('URL:', webhookData.webhookData.webhookUrl);
    console.log('Habilitado:', webhookData.webhookData.webhookEnabled);
    
    // 3. Testar conectividade do webhook
    console.log('\n3. Testando conectividade do webhook...');
    const testResponse = await fetch('https://dominiomenu-app.replit.app/api/webhook/whatsapp/3', {
      method: 'GET'
    });
    console.log('Status do endpoint:', testResponse.status);
    
    // 4. Reconfigurar webhook com reset completo
    console.log('\n4. Reconfigurando webhook...');
    
    // Desabilitar
    await fetch('https://apinocode01.megaapi.com.br/rest/webhook/megacode-MDT3OHEGIyu/configWebhook', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer MDT3OHEGIyu',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messageData: {
          webhookUrl: '',
          webhookEnabled: false,
          webhookSecondaryUrl: '',
          webhookSecondaryEnabled: false
        }
      })
    });
    
    console.log('Webhook desabilitado...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Reabilitar
    const reconfigResponse = await fetch('https://apinocode01.megaapi.com.br/rest/webhook/megacode-MDT3OHEGIyu/configWebhook', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer MDT3OHEGIyu',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messageData: {
          webhookUrl: 'https://dominiomenu-app.replit.app/api/webhook/whatsapp/3',
          webhookEnabled: true,
          webhookSecondaryUrl: '',
          webhookSecondaryEnabled: false
        }
      })
    });
    
    const reconfigData = await reconfigResponse.json();
    console.log('Webhook reconfigurado:', reconfigData.message);
    
    // 5. Enviar mensagem de teste
    console.log('\n5. Enviando mensagem de teste...');
    const testMessageResponse = await fetch('https://apinocode01.megaapi.com.br/rest/sendMessage/megacode-MDT3OHEGIyu/text', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer MDT3OHEGIyu',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messageData: {
          to: '5569993910380@s.whatsapp.net',
          text: 'Teste diagnóstico - webhook reconfigurado'
        }
      })
    });
    
    const testMessageData = await testMessageResponse.json();
    console.log('Mensagem enviada:', testMessageData.message);
    
    console.log('\n=== DIAGNÓSTICO CONCLUÍDO ===');
    console.log('Agora envie uma mensagem real para 69993910380 e monitore os logs.');
    
  } catch (error) {
    console.error('Erro no diagnóstico:', error);
  }
}

diagnosticWebhook();