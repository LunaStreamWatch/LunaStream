import crypto from 'crypto';

const SECRET = process.env.JWT_SECRET || 'supersecretkey';

export function createToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const data = `${header}.${payloadBase64}`;
  const signature = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  return `${data}.${signature}`;
}

export function verifyToken(token) {
  if (!token) return null;
  const [header, payload, signature] = token.split('.');
  if (!header || !payload || !signature) return null;
  const data = `${header}.${payload}`;
  const expectedSignature = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  if (signature !== expectedSignature) return null;
  return JSON.parse(Buffer.from(payload, 'base64url').toString());
}
