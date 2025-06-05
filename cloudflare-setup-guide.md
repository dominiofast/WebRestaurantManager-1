# Configuração Cloudflare para dominiomenu.com

## Passo 1: Configurar o Worker no Cloudflare

1. **Acesse o Cloudflare Dashboard**
   - Login em https://dash.cloudflare.com
   - Selecione o domínio `dominiomenu.com`

2. **Criar Worker**
   - Vá em "Workers & Pages" > "Create application"
   - Escolha "Create Worker"
   - Nome: `dominiomenu-proxy`
   - Cole o código do arquivo `cloudflare-worker.js`

3. **Configurar Rotas do Worker**
   - Vá em "Workers & Pages" > "dominiomenu-proxy" > "Settings" > "Triggers"
   - Adicione as rotas:
     - `dominiomenu.com/api/*`
     - `dominiomenu.com/uploads/*`

## Passo 2: Configurar DNS no Cloudflare

1. **Configuração DNS**
   - Vá em "DNS" > "Records"
   - Certifique-se que existe um registro A ou CNAME para `dominiomenu.com`
   - **IMPORTANTE**: O proxy deve estar ATIVADO (nuvem laranja)

## Passo 3: Configurar Page Rules (Opcional)

1. **Cache Rules**
   - Vá em "Rules" > "Page Rules"
   - Criar regra: `dominiomenu.com/uploads/*`
   - Configurações: Cache Level = Cache Everything, Edge Cache TTL = 1 year

## Resultado Esperado

Após a configuração, o domínio funcionará assim:

- `https://dominiomenu.com/` → Arquivos estáticos (React)
- `https://dominiomenu.com/menu/300-graus-central` → Aplicação React
- `https://dominiomenu.com/api/*` → Proxy para Replit backend
- `https://dominiomenu.com/uploads/*` → Proxy para Replit uploads

## Teste da Configuração

Execute estes comandos para testar:

```bash
# Teste da API
curl https://dominiomenu.com/api/menu/300-graus-central

# Teste de uma imagem
curl -I https://dominiomenu.com/uploads/image-1748830945139-864123032.png
```

## Status Esperado

✅ API: Retorna dados do cardápio em JSON
✅ Uploads: Retorna status 200 para imagens
✅ Menu: Carrega a aplicação React com dados do backend

## Troubleshooting

Se não funcionar:
1. Verifique se o Worker está ativo
2. Confirme as rotas do Worker
3. Certifique-se que o proxy DNS está ativado
4. Aguarde até 5 minutos para propagação