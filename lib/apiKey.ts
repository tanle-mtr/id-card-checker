import { nanoid } from 'nanoid';

export function generateApiKey(prefix: string = 'sk-ds4-'): string {
  return `${prefix}${nanoid(32)}`;
}

export function validateApiKey(apiKey: string): boolean {
  return /^sk-ds4-[A-Za-z0-9_-]{32}$/.test(apiKey);
}

export function hashApiKey(apiKey: string): string {
  const hash = require('crypto').createHash('sha256');
  hash.update(apiKey);
  return hash.digest('hex');
}
