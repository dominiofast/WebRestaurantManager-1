# CONFIGURAÇÃO CLOUDFLARE - PASSOS OBRIGATÓRIOS

## 1. CRIAR O WORKER

1. Acesse: https://dash.cloudflare.com
2. Selecione o domínio `dominiomenu.com`
3. Vá em **"Workers & Pages"** no menu lateral
4. Clique em **"Create application"**
5. Escolha **"Create Worker"**
6. Nome do Worker: `dominiomenu-proxy`
7. Clique em **"Deploy"**

## 2. ADICIONAR O CÓDIGO

1. No Worker criado, clique em **"Edit code"**
2. **APAGUE TODO O CÓDIGO** que está lá
3. **COLE EXATAMENTE** o código do arquivo `cloudflare-worker.js`
4. Clique em **"Save and deploy"**

## 3. CONFIGURAR AS ROTAS (MAIS IMPORTANTE)

1. Ainda no Worker, vá na aba **"Settings"**
2. Clique em **"Triggers"**
3. Clique em **"Add route"**
4. Adicione estas 2 rotas:

   **Rota 1:**
   - Route: `dominiomenu.com/api/*`
   - Zone: `dominiomenu.com`

   **Rota 2:**
   - Route: `dominiomenu.com/uploads/*`
   - Zone: `dominiomenu.com`

## 4. VERIFICAR DNS

1. Vá em **"DNS"** > **"Records"**
2. Certifique-se que existe um registro para `dominiomenu.com`
3. **IMPORTANTE**: A nuvem deve estar **LARANJA** (proxy ativado)

## 5. TESTAR

Após 2-3 minutos, teste:

```bash
curl https://dominiomenu.com/api/menu/300-graus-central
```

**Resultado esperado:** Dados JSON do cardápio (não erro 500)

## TROUBLESHOOTING

Se ainda der erro:
- Aguarde 5 minutos para propagação
- Verifique se as rotas estão corretas
- Confirme que o código do Worker foi salvo
- Certifique-se que o proxy DNS está ativado (nuvem laranja)