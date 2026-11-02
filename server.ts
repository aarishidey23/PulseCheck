/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { createServer as createViteServer } from 'vite';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, ChildProcess } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const PYTHON_PORT = 8000;

// Spawn Python FastAPI service
let pythonProcess: ChildProcess | null = null;

function startPythonBackend() {
  console.log('[PulseCheck] Booting Python FastAPI Backend with Pandas & NumPy on port', PYTHON_PORT);
  
  // Try using python3 or python
  pythonProcess = spawn('python3', ['-m', 'uvicorn', 'backend.main:app', '--host', '127.0.0.1', `--port=${PYTHON_PORT}`], {
    cwd: __dirname,
    stdio: 'inherit',
    env: {
      ...process.env,
      PATH: `${process.env.HOME}/.local/bin:${process.env.PATH || ''}`,
      PYTHONPATH: `${__dirname}:${process.env.PYTHONPATH || ''}`,
    },
  });

  pythonProcess.on('error', (err) => {
    console.error('[PulseCheck Python Backend Error]:', err.message);
  });

  pythonProcess.on('exit', (code, signal) => {
    console.log(`[PulseCheck Python Backend exited]: code ${code}, signal ${signal}`);
  });
}

// Clean up child process on exit
process.on('SIGINT', () => {
  if (pythonProcess) pythonProcess.kill('SIGINT');
  process.exit();
});

process.on('SIGTERM', () => {
  if (pythonProcess) pythonProcess.kill('SIGTERM');
  process.exit();
});

async function startServer() {
  const app = express();

  // Start Python FastAPI daemon
  startPythonBackend();

  // Proxy route for Python backend: /api/python/* -> http://127.0.0.1:8000/*
  app.use('/api/python', (req, res) => {
    const targetPath = req.url; // includes leading '/' and any query string
    
    const options: http.RequestOptions = {
      hostname: '127.0.0.1',
      port: PYTHON_PORT,
      path: targetPath,
      method: req.method,
      headers: {
        ...req.headers,
        host: `127.0.0.1:${PYTHON_PORT}`,
      },
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.warn('[Proxy to Python failed]:', err.message);
      if (!res.headersSent) {
        res.status(503).json({
          error: 'Python backend initializing or unavailable',
          details: err.message,
          suggestion: 'Ensure FastAPI is running on port 8000 via `python3 -m uvicorn backend.main:app --port 8000`',
        });
      }
    });

    // Pipe request stream (supports multipart file uploads and JSON)
    req.pipe(proxyReq);
  });

  // In development, mount Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PulseCheck Server] Running on http://localhost:${PORT}`);
    console.log(`[PulseCheck Server] Python Analytics proxy mounted at /api/python`);
  });
}

startServer();
