import assert from 'node:assert/strict';
import { isTenantFeatureEnabled } from '../src/lib/tenantFeatures';

const tests = [
  {
    name: 'Parent ON + Child ON',
    config: { batch_management: true, sub_batches_cohorts: true },
    feature: 'sub_batches_cohorts',
    expected: true,
  },
  {
    name: 'Parent ON + Child OFF',
    config: { batch_management: true, sub_batches_cohorts: false },
    feature: 'sub_batches_cohorts',
    expected: false,
  },
  {
    name: 'Parent OFF + Child ON',
    config: { batch_management: false, sub_batches_cohorts: true },
    feature: 'sub_batches_cohorts',
    expected: false,
  },
  {
    name: 'Missing configuration',
    config: undefined,
    feature: 'batch_management',
    expected: false,
  },
  {
    name: 'Unknown feature',
    config: { batch_management: true },
    feature: 'unknown_feature',
    expected: false,
  },
];

let failed = 0;

for (const test of tests) {
  try {
    assert.equal(
      isTenantFeatureEnabled(test.config, test.feature),
      test.expected,
    );
    console.log(`PASS: ${test.name}`);
  } catch (error) {
    failed++;
    console.error(`FAIL: ${test.name}`);
    console.error(error);
  }
}

console.log(`\nResults: ${tests.length - failed}/${tests.length} passed`);

if (failed > 0) process.exitCode = 1;
