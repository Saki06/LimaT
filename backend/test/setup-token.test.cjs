const test = require('node:test');
const assert = require('node:assert/strict');

const {
  generateSetupToken,
  hashSetupToken,
} = require('../dist/utils/setupToken');

test('generated setup tokens are unique', () => {
  const tokens = new Set();

  for (let index = 0; index < 100; index += 1) {
    tokens.add(generateSetupToken());
  }

  assert.equal(tokens.size, 100);
});

test('the same setup token produces the same SHA-256 hash', () => {
  const token = generateSetupToken();

  assert.equal(hashSetupToken(token), hashSetupToken(token));
});

test('different setup tokens produce different SHA-256 hashes', () => {
  const firstToken = generateSetupToken();
  let secondToken = generateSetupToken();

  while (secondToken === firstToken) {
    secondToken = generateSetupToken();
  }

  assert.notEqual(hashSetupToken(firstToken), hashSetupToken(secondToken));
});

test('generated setup tokens contain at least 32 random bytes of encoded entropy', () => {
  const token = generateSetupToken();
  const decodedBytes = Buffer.from(token, 'base64url');

  assert.equal(decodedBytes.length, 32);
});

test('SHA-256 hashes are returned as 64-character hexadecimal strings', () => {
  const hash = hashSetupToken(generateSetupToken());

  assert.match(hash, /^[a-f0-9]{64}$/);
});
