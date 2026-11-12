import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // 1. Spawn FastAPI Backend (Python Uvicorn) on port 8000
  const uvicornBin = '/root/.local/bin/uvicorn';
  const fastApiProc = spawn(uvicornBin, ['backend.main:app', '--host', '127.0.0.1', '--port', '8000'], {
    stdio: 'inherit',
    env: { ...process.env, PATH: `/root/.local/bin:${process.env.PATH}` }
  });

  fastApiProc.on('error', (err) => {
    console.warn('Notice: FastAPI child process spawn returned:', err.message);
  });

  process.on('exit', () => {
    fastApiProc.kill();
  });
  process.on('SIGINT', () => {
    fastApiProc.kill();
    process.exit();
  });

  // 2. Proxy all /api requests to FastAPI on port 8000
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
      on: {
        error: (_err: any, _req: any, res: any) => {
          if (!res.headersSent && typeof res.status === 'function') {
            res.status(503).json({
              error: 'Backend engine initializing, please retry momentarily',
              code: 'BACKEND_INITIALIZING'
            });
          }
        }
      }
    })
  );

  // 3. Mount Vite middlewares in development
  const isDev = process.env.NODE_ENV !== 'production';
  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static build in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ScholarFind Full-Stack Platform running on port ${PORT}`);
    console.log(`   Frontend: http://localhost:${PORT}`);
    console.log(`   FastAPI Backend Proxy: http://localhost:${PORT}/api -> http://127.0.0.1:8000/api`);
  });
}

startServer();
