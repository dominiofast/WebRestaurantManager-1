async function reconfigurarWebhook() {
  try {
    // URL pública correta do Replit
    const webhookUrl = 'https://b81619e6-3892-4ada-8f35-1f9ad2756b3e-00-12466fifx9u9l.picard.replit.dev/api/webhook/whatsapp/5';
    console.log('Reconfigurando webhook para:', webhookUrl);
    
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

    console.log('Status da reconfiguração:', response.status);
    const data = await response.json();
    console.log('Resultado:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.log('Erro na reconfiguração:', error.message);
  }
}

reconfigurarWebhook();