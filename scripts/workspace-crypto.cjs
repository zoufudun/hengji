const crypto = require('node:crypto');
const FORMAT = 'hengji-workspace';
const VERSION = 1;
const ITERATIONS = 100000;
const DEFAULT_FALLBACK_KEY = 'TOPFIRE_MERIT_DEFAULT_WORKSPACE_KEY_2026';

function normalizePassword(password) {
  if (typeof password === 'string' && password.trim().length > 0) return password.trim();
  return DEFAULT_FALLBACK_KEY;
}

function deriveKey(password, salt, iterations = ITERATIONS) {
  return crypto.pbkdf2Sync(normalizePassword(password), salt, iterations, 32, 'sha256');
}

function encryptWorkspace(payload, password) {
  const isProtected = Boolean(typeof password === 'string' && password.trim().length > 0);
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const key = deriveKey(password, salt, ITERATIONS);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const plaintext = Buffer.from(JSON.stringify(payload), 'utf8');
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return JSON.stringify({
    format: FORMAT,
    version: VERSION,
    kdf: 'PBKDF2-SHA256',
    iterations: ITERATIONS,
    protected: isProtected,
    salt: salt.toString('base64'),
    iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'),
    data: ciphertext.toString('base64')
  });
}

function decryptWorkspace(serialized, password) {
  let envelope;
  try {
    envelope = JSON.parse(serialized);
  } catch {
    throw new Error('工作区文件格式不正确');
  }
  if (envelope.format !== FORMAT || envelope.version !== VERSION) {
    throw new Error('不支持的工作区文件版本');
  }
  const iterations = envelope.iterations || ITERATIONS;
  const isProtected = envelope.protected !== false;
  const salt = Buffer.from(envelope.salt, 'base64');
  const iv = Buffer.from(envelope.iv, 'base64');
  const tag = Buffer.from(envelope.tag, 'base64');
  const ciphertext = Buffer.from(envelope.data, 'base64');

  // If user provided a password, try it
  if (typeof password === 'string' && password.trim().length > 0) {
    try {
      const key = crypto.pbkdf2Sync(password.trim(), salt, iterations, 32, 'sha256');
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAuthTag(tag);
      return JSON.parse(Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8'));
    } catch {
      throw new Error('管理员口令错误，请重新核对');
    }
  }

  // If workspace is not password protected, open directly with default key
  if (envelope.protected === false) {
    try {
      const key = deriveKey('', salt, iterations);
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAuthTag(tag);
      return JSON.parse(Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8'));
    } catch {
      throw new Error('工作区文件解密失败或已损坏');
    }
  }

  throw new Error('该工作区已设置口令保护，请输入管理员口令');
}

module.exports = { encryptWorkspace, decryptWorkspace, FORMAT, VERSION, ITERATIONS };
