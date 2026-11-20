const test = require('node:test');
const assert = require('node:assert/strict');
const { config } = require('../dist/config');
const { sendPasswordResetEmail, sendParentLinkVerificationEmail } = require('../dist/services/email.service');

const previous = { ...config.smtp };
test.after(() => { Object.assign(config.smtp, previous); });

test('email services fail closed when SMTP credentials are absent', async () => {
  Object.assign(config.smtp, { user: '', pass: '', from: '' });
  const reset = await sendPasswordResetEmail({ to: 'test@example.invalid', otp: '123456' });
  const parentLink = await sendParentLinkVerificationEmail({ to: 'test@example.invalid', studentName: 'Test Student', otp: '123456' });
  assert.equal(reset.success, false);
  assert.equal(parentLink.success, false);
});
