#!/usr/bin/env node

// Script de inicialização para deployment em produção
// Garante que o servidor Express seja executado corretamente no domínio personalizado

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Importar o servidor principal
import('./dist/index.js').then(() => {
  console.log('Servidor iniciado com sucesso para o domínio personalizado');
}).catch(err => {
  console.error('Erro ao iniciar servidor:', err);
  
  // Fallback: servir apenas arquivos estáticos se o servidor principal falhar
  const app = express();
  const distPath = resolve(__dirname, 'dist');
  
  if (existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(resolve(distPath, 'index.html'));
    });
  }
  
  const port = process.env.PORT || 5000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Fallback server running on port ${port}`);
  });
});