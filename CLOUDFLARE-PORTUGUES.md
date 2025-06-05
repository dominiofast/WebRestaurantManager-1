# CONFIGURAÇÃO CLOUDFLARE - INTERFACE EM PORTUGUÊS

## 1. CRIAR O WORKER

1. Acesse: https://dash.cloudflare.com
2. Selecione o domínio `dominiomenu.com`
3. No menu lateral, procure por **"Workers e Pages"**
4. Clique em **"Criar aplicação"**
5. Escolha **"Criar Worker"**
6. Nome do Worker: `dominiomenu-proxy`
7. Clique em **"Implantar"** ou **"Deploy"**

## 2. EDITAR O CÓDIGO

1. No Worker criado, clique em **"Editar código"**
2. **APAGUE TODO O CÓDIGO** que aparece por padrão
3. **COLE EXATAMENTE** o código do arquivo `cloudflare-worker.js`
4. Clique em **"Salvar e implantar"**

## 3. CONFIGURAR ROTAS (PASSO MAIS IMPORTANTE)

1. Ainda no Worker, procure a aba **"Configurações"**
2. Encontre a seção **"Gatilhos"** ou **"Triggers"**
3. Clique em **"Adicionar rota"** ou **"Adicionar route"**

**Adicione estas 2 rotas:**

**Rota 1:**
- Rota: `dominiomenu.com/api/*`
- Zona: `dominiomenu.com`
- Clique **"Salvar"**

**Rota 2:**
- Rota: `dominiomenu.com/uploads/*`
- Zona: `dominiomenu.com`
- Clique **"Salvar"**

## 4. VERIFICAR DNS

1. Vá em **"DNS"** no menu lateral
2. Procure por **"Registros"** ou **"Records"**
3. Encontre o registro `dominiomenu.com`
4. **IMPORTANTE**: A nuvem deve estar **LARANJA** (proxy ativado)
5. Se estiver cinza, clique para ativar o proxy

## 5. TESTAR A CONFIGURAÇÃO

Aguarde 2-3 minutos e teste no terminal:

```bash
curl https://dominiomenu.com/api/menu/300-graus-central
```

**Resultado esperado:** Dados JSON do cardápio (não erro 500)

## SE DER ERRO

- Aguarde 5 minutos para propagação
- Verifique se as duas rotas foram salvas corretamente
- Confirme que o código do Worker foi salvo
- Certifique-se que o proxy DNS está ativado (nuvem laranja)

## TERMOS EM PORTUGUÊS/INGLÊS

- Workers e Pages = Workers & Pages
- Criar aplicação = Create application
- Editar código = Edit code
- Configurações = Settings
- Gatilhos = Triggers
- Adicionar rota = Add route
- Registros = Records