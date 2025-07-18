import Fastify from 'fastify';
import path from 'path';
import { fileURLToPath } from 'url';
import fastifyStatic from '@fastify/static';
import dotenv from 'dotenv';
import fs from 'fs';
import { createToken, verifyToken } from './maketoken.js';

const envPath = path.resolve(process.cwd(), '.env');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('.env file loaded');
} else {
  console.warn('.env file not found, using default environment variables if any');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Admin frontend plugin ---
async function adminFrontendPlugin(instance, opts) {
  // Protect admin frontend routes with auth
  instance.addHook('onRequest', async (request, reply) => {
    const authHeader = request.headers['authorization'];
    if (!authHeader) return reply.status(401).send('Unauthorized');
    const token = authHeader.split(' ')[1];
    if (!token || !verifyToken(token)) return reply.status(401).send('Unauthorized');
  });

  // Serve admin frontend static files from /dist under /admin prefix
  instance.register(fastifyStatic, {
    root: path.join(__dirname, 'dist'),
    prefix: '/',      // because this plugin is mounted at /admin
    wildcard: false,  // prevent duplicate HEAD route conflicts
  });

  // SPA fallback for admin frontend (serve index.html)
  // Only respond to GET (not HEAD) to avoid conflicts
  instance.get('/*', (request, reply) => {
    reply.sendFile('index.html', path.join(__dirname, 'dist'));
  });
}

// --- Admin API plugin ---
async function adminApiPlugin(instance, opts) {
  // Authentication decorator for admin API
  instance.decorate('authenticate', async (request, reply) => {
    try {
      const authHeader = request.headers['authorization'];
      if (!authHeader) return reply.status(401).send({ message: 'No token provided' });
      const token = authHeader.split(' ')[1];
      if (!token) return reply.status(401).send({ message: 'Invalid token format' });
      const payload = verifyToken(token);
      if (!payload) return reply.status(401).send({ message: 'Invalid or expired token' });
      request.user = payload;
    } catch {
      reply.status(401).send({ message: 'Authentication failed' });
    }
  });

  // Login route - generates token
  instance.post('/login', async (request, reply) => {
    const { username, password } = request.body;
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password';

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const payload = { username, iat: Date.now() };
      const token = createToken(payload);
      reply.send({ success: true, token });
    } else {
      reply.status(401).send({ success: false, message: 'Invalid username or password' });
    }
  });

  // Protected admin data route
  instance.get('/data', { preHandler: [instance.authenticate] }, async (request, reply) => {
    return { message: `Welcome, ${request.user.username}`, secretData: 'Top Secret Admin Data' };
  });
}

// --- Main public Fastify instance ---
const fastify = Fastify({ logger: true });

// Serve public frontend static files
fastify.register(fastifyStatic, {
  root: path.join(__dirname, '../frontend/dist'),
  prefix: '/',
  wildcard: false,
});

// SPA fallback for public frontend
fastify.get('/*', (request, reply) => {
  if (!request.raw.url.startsWith('/admin') && !request.raw.url.startsWith('/api')) {
    reply.sendFile('index.html', path.join(__dirname, '../frontend/dist'));
  }
});

// Public API route
fastify.get('/api/ping', async () => {
  return { message: 'pong' };
});

// Mount admin frontend plugin under /admin
fastify.register(adminFrontendPlugin, { prefix: '/admin' });

// Mount admin API plugin under /api/admin
fastify.register(adminApiPlugin, { prefix: '/api/admin' });

// Start the server
const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 80;
    await fastify.listen({ port });
    console.log(`Server listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
