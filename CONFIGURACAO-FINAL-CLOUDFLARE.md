# CONFIGURAÇÃO FINAL CLOUDFLARE

## PASSO 1: Adicionar Page Rule

1. No Cloudflare Dashboard, vá em **"Rules"** > **"Page Rules"**
2. Clique em **"Criar regra"** ou **"Create Page Rule"**
3. Configure:

**URL Pattern:** `cardapio.dominiomenu.com/*`
**Settings:** 
- Forwarding URL: `301 - Permanent Redirect`
- Destination URL: `https://29824401-c1d7-4113-aee2-051f45c04452-00-3aipz2hk07y9j.kirk.replit.dev/$1`

4. Clique em **"Salvar e implantar"**

## PASSO 2: Verificar DNS

Confirme que o registro CNAME está configurado:
- Nome: `cardapio`
- Destino: `29824401-c1d7-4113-aee2-051f45c04452-00-3aipz2hk07y9j.kirk.replit.dev`
- Proxy: ON (laranja)

## RESULTADO

Após 2-3 minutos:
- `https://cardapio.dominiomenu.com/menu/300-graus-central` → Funciona
- `https://cardapio.dominiomenu.com/api/menu/300-graus-central` → Retorna JSON

## ALTERNATIVA SIMPLES

Se Page Rules não funcionar, use redirect JavaScript:

1. Configure `cardapio.dominiomenu.com` para servir um arquivo HTML
2. Use o arquivo `domain-redirect-simple.html` que criei