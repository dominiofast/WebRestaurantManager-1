# SOLUÇÃO DEFINITIVA - Cloudflare Pages + Redirects

## Opção 1: Cloudflare Pages (MAIS SIMPLES)

1. **Vá em "Pages"** no Cloudflare Dashboard
2. **Conecte seu repositório** ou faça upload dos arquivos
3. **Configure Redirects** no arquivo `_redirects`:

```
/menu/* https://29824401-c1d7-4113-aee2-051f45c04452-00-3aipz2hk07y9j.kirk.replit.dev/menu/:splat 200
/api/* https://29824401-c1d7-4113-aee2-051f45c04452-00-3aipz2hk07y9j.kirk.replit.dev/api/:splat 200
/uploads/* https://29824401-c1d7-4113-aee2-051f45c04452-00-3aipz2hk07y9j.kirk.replit.dev/uploads/:splat 200
```

## Opção 2: DNS Simples (IMEDIATA)

1. **DNS** > **Records**
2. **Adicione um registro CNAME:**
   - Name: `menu`
   - Target: `29824401-c1d7-4113-aee2-051f45c04452-00-3aipz2hk07y9j.kirk.replit.dev`
   - Proxy: ON (laranja)

Resultado: `https://menu.dominiomenu.com/menu/300-graus-central`

## Opção 3: Redirecionamento JavaScript (FUNCIONA AGORA)

Substitua o conteúdo do `dominiomenu.com` pelo arquivo `domain-redirect-simple.html`