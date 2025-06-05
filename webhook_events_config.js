// Script para configurar eventos do webhook na Mega API
// Este script deve ser executado após configurar manualmente os eventos no painel

async function configurarEventosWebhook() {
  const instances = [
    {
      storeId: 4,
      instanceKey: 'megacode-MDT3OHEGIyu',
      apiToken: 'MDT3OHEGIyu'
    }
  ];

  for (const instance of instances) {
    try {
      console.log(`\n=== Configurando webhook para loja ${instance.storeId} ===`);
      
      // Configurar webhook
      const webhookUrl = `https://b81619e6-3892-4ada-8f35-1f9ad2756b3e-00-12466fifx9u9l.picard.replit.dev/api/webhook/whatsapp/${instance.storeId}`;
      
      const response = await fetch(`https://apinocode01.megaapi.com.br/rest/webhook/${instance.instanceKey}/configWebhook`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${instance.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messageData: {
            webhookUrl: webhookUrl,
            webhookEnabled: true,
            webhookSecondaryUrl: "",
            webhookSecondaryEnabled: false
          }
        })
      });

      const result = await response.json();
      console.log(`Configuração loja ${instance.storeId}:`, result);

      // Verificar status
      const statusResponse = await fetch(`https://apinocode01.megaapi.com.br/rest/webhook/${instance.instanceKey}`, {
        headers: {
          'Authorization': `Bearer ${instance.apiToken}`,
          'Content-Type': 'application/json'
        }
      });

      const statusResult = await statusResponse.json();
      console.log(`Status webhook loja ${instance.storeId}:`, statusResult);

    } catch (error) {
      console.log(`Erro na loja ${instance.storeId}:`, error.message);
    }
  }
}

// Instruções para configuração manual no painel Mega API:
console.log(`
INSTRUÇÕES PARA CONFIGURAÇÃO DE EVENTOS NO PAINEL MEGA API:

1. Acesse: https://megaapi.com.br/painel
2. Vá em "MINHAS INSTÂNCIAS"
3. Para cada instância (megacode-MDT3OHEGIyu e megacode-McmAMknxcxu):
   - Clique em "DETALHES"
   - Clique em "EDITAR"
   - Configure a URL do webhook:
     * Para loja 3: https://dominiomenu-app.replit.app/api/webhook/whatsapp/3
     * Para loja 5: https://dominiomenu-app.replit.app/api/webhook/whatsapp/5
   - IMPORTANTE: Marque os seguintes eventos:
     ✓ message
     ✓ messagesInput
     ✓ conversation
     ✓ extendedTextMessage
     ✓ ephemeralMessage
     ✓ audioMessage
     ✓ imageMessage
     ✓ videoMessage
   - Salve as configurações

4. Execute este script: node webhook_events_config.js

Os eventos mais importantes são:
- messagesInput: Para receber mensagens de entrada
- conversation: Para mensagens de texto simples
- extendedTextMessage: Para mensagens de texto formatadas
`);

configurarEventosWebhook();