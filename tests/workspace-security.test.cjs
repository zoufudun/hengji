const test = require('node:test');
const assert = require('node:assert/strict');
const { encryptWorkspace, decryptWorkspace } = require('../scripts/workspace-crypto.cjs');

test('工作区使用随机盐和 AES-GCM 密文，不泄露项目与绩点明文', () => {
  const payload = { name: '保密项目工作区', revision: 1, state: { employees: [], projects: [{ name: '绝密项目甲' }], plans: [{ points: 123456 }], audit: [] }, projectGroups: [] };
  const first = encryptWorkspace(payload, 'StrongPassword!2026');
  const second = encryptWorkspace(payload, 'StrongPassword!2026');
  assert.notEqual(first, second);
  assert.equal(first.includes('绝密项目甲'), false);
  assert.equal(first.includes('123456'), false);
  assert.deepEqual(decryptWorkspace(first, 'StrongPassword!2026'), payload);
});

test('错误口令无法打开工作区，篡改密文会被 GCM 认证拒绝', () => {
  const encrypted = encryptWorkspace({ secret: '绩点隐私' }, 'CorrectPassword');
  assert.throws(() => decryptWorkspace(encrypted, 'WrongPassword'), /口令错误|损坏/);
  const envelope = JSON.parse(encrypted);
  envelope.data = `${envelope.data.slice(0, -4)}AAAA`;
  assert.throws(() => decryptWorkspace(JSON.stringify(envelope), 'CorrectPassword'), /口令错误|损坏/);
});
