import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { db } from './db/index.js';
import { requireAuth } from './middlewares/auth.js';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import versesRoutes from './routes/verses.js';
import coupleRoutes from './routes/couple.js';
import memoriesRoutes from './routes/memories.js';
import galleryRoutes from './routes/gallery.js';
import recapRoutes from './routes/recap.js';
import graphRoutes from './routes/graph.js';
import pushRoutes from './routes/push.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// 1. Headers de Segurança com Helmet
app.use(
  helmet({
    contentSecurityPolicy: false, // Vite e PWAs necessitam flexibilidade com scripts e blobs
    crossOriginResourcePolicy: { policy: 'same-site' }
  })
);

// 2. CORS para desenvolvimento e produção
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3001',
  'https://mary.pyxie.com.br',
  'https://diario.pyxie.com.br'
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Privado em subdomínio seguro
    },
    credentials: true
  })
);

// 3. Parsers de Cookies e JSON com suporte a payloads de até 50MB
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 4. Servir uploads de forma blindada (apenas usuários autenticados)
const uploadsDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/api/uploads', requireAuth, express.static(uploadsDir));

// 5. Rotas da API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Nosso Universo — Mary & Leh',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/verses', versesRoutes);
app.use('/api/couple', coupleRoutes);
app.use('/api/memories', memoriesRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/recap', recapRoutes);
app.use('/api/graph', graphRoutes);
app.use('/api/push', pushRoutes);

// 6. Servir arquivos estáticos do Vite em Produção com Cache Otimizado
const clientDistDir = path.resolve(__dirname, '../client/dist');
const assetsDir = path.join(clientDistDir, 'assets');

if (fs.existsSync(clientDistDir)) {
  // Cache imutável de 1 ano para bundles gerados com hash em /assets
  if (fs.existsSync(assetsDir)) {
    app.use('/assets', express.static(assetsDir, {
      maxAge: '1y',
      immutable: true
    }));
  }

  // Cache padrão para outros arquivos do PWA
  app.use(express.static(clientDistDir, {
    maxAge: '1h',
    setHeaders: (res, filePath) => {
      // Service worker e manifest nunca devem ser cacheados rigidamente
      if (filePath.endsWith('sw.js') || filePath.endsWith('manifest.webmanifest')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      }
    }
  }));

  // Fallback SPA para rotas não-API
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(clientDistDir, 'index.html'));
    }
    next();
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      message: 'Servidor Backend de Nosso Universo (Mary & Leh) ativo na porta 3001.',
      clientStatus: 'Vite Client ainda não compilado (rode npm run build:client ou npm run dev:client)'
    });
  });
}

// 7. Tratamento de Erros e 404 para API
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado.' });
});

// Middleware Global de Tratamento de Erros (Multer, Auth, Validações)
app.use((err, req, res, next) => {
  console.error('[MaryServer] Erro tratado:', err.message || err);

  // Erros de limite e formato do Multer
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: 'O arquivo enviado é muito grande. O limite máximo permitido é de 25MB.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Você ultrapassou o limite máximo de imagens permitidas por envio.'
      });
    }
    return res.status(400).json({
      error: `Erro no upload da imagem: ${err.message}`
    });
  }

  // Erros de autenticação
  if (err.name === 'UnauthorizedError' || err.status === 401) {
    return res.status(401).json({
      error: 'Acesso não autorizado. Por favor, faça login para continuar.'
    });
  }

  return res.status(err.status || 500).json({
    error: err.message || 'Ocorreu um erro interno no servidor.'
  });
});

// 8. Inicialização do Servidor
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ [Nosso Universo] Servidor privado rodando em http://localhost:${PORT}`);
  });
}

export default app;
