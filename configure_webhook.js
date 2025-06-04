async function configurarWebhook() {
  try {
    const webhookUrl = 'https://3000-workspace-klebercamargo1.replit.dev/api/webhook/whatsapp/5';
    console.log('Configurando webhook para URL:', webhookUrl);
    
    const response = await fetch('https://apinocode01.megaapi.com.br/rest/webhook/megacode-McmAMknxcxu/configWebhook', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer McmAMknxcxu',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messageData: {
          webhookUrl: webhookUrl,
          webhookEnabled: true
        }
      })
    });

    console.log('Status da configuração:', response.status);
    const data = await response.json();
    console.log('Resposta da API:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.log('Erro na configuração:', error.message);
  }
}

configurarWebhook();