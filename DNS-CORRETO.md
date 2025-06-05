# CONFIGURAÇÃO DNS CORRETA

## PROBLEMA ATUAL
O registro DNS está apontando para o domínio geral do Replit, mas não para o caminho específico da aplicação.

## SOLUÇÃO CORRETA

No Cloudflare DNS, altere o registro:

**Registro Atual (Incorreto):**
- Tipo: CNAME
- Nome: cardapio
- Destino: 29824401-c1d7-4113-aee2-051f45c04452-00-3aipz2hk07y9j.kirk.replit.dev

**Registro Correto:**
- Tipo: CNAME
- Nome: cardapio
- Destino: 29824401-c1d7-4113-aee2-051f45c04452-00-3aipz2hk07y9j.kirk.replit.dev
- **ADICIONAR Page Rule ou Redirect Rule:**

## ALTERNATIVA: Page Rule no Cloudflare

1. Vá em "Rules" > "Page Rules"
2. Adicione uma regra:
   - URL: `cardapio.dominiomenu.com/*`
   - Setting: Forwarding URL
   - Status Code: 301
   - Destination: `https://29824401-c1d7-4113-aee2-051f45c04452-00-3aipz2hk07y9j.kirk.replit.dev/$1`

## TESTE
Após configurar: `https://cardapio.dominiomenu.com/menu/300-graus-central`