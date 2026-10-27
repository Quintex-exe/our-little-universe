import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { daysTogether, isValidISODate } from '../src/lib/dates';
import { validateAll, validateStep } from '../src/lib/validation';
import { EMPTY_DRAFT } from '../src/types/profile';

const today = new Date(2026, 9, 27); // 27 Oct 2026 (local)
const valid = { ...EMPTY_DRAFT, partnerOneName: 'Maya', partnerTwoName: 'Arjun' };

describe('validation', () => {
  it('requires both names', () => {
    const e = validateStep('names', EMPTY_DRAFT, today);
    assert.ok(e.partnerOneName && e.partnerTwoName);
  });
  it('rejects whitespace-only and symbol-only names', () => {
    assert.ok(validateStep('names', { ...valid, partnerOneName: '   ' }, today).partnerOneName);
    assert.ok(validateStep('names', { ...valid, partnerOneName: '!!!' }, today).partnerOneName);
  });
  it('accepts unicode names', () => {
    assert.deepEqual(validateStep('names', { ...valid, partnerOneName: 'অনিন্দিতা', partnerTwoName: 'Zoë-Ann' }, today), {});
  });
  it('enforces length limits', () => {
    assert.ok(validateStep('names', { ...valid, partnerOneName: 'a'.repeat(41) }, today).partnerOneName);
    assert.ok(validateStep('nicknames', { ...valid, partnerTwoNickname: 'b'.repeat(31) }, today).partnerTwoNickname);
    assert.ok(validateStep('story', { ...valid, dedication: 'c'.repeat(281) }, today).dedication);
  });
  it('treats optional fields as optional', () => {
    assert.deepEqual(validateStep('nicknames', valid, today), {});
    assert.deepEqual(validateStep('story', valid, today), {});
  });
  it('validates anniversary', () => {
    assert.ok(validateStep('story', { ...valid, anniversary: '2027-01-01' }, today).anniversary);
    assert.ok(validateStep('story', { ...valid, anniversary: '1800-01-01' }, today).anniversary);
    assert.ok(validateStep('story', { ...valid, anniversary: '2020-02-30' }, today).anniversary);
    assert.deepEqual(validateStep('story', { ...valid, anniversary: '2026-10-27' }, today), {});
  });
  it('validateAll passes a complete draft', () => {
    assert.deepEqual(validateAll(valid, today), {});
  });
});

describe('dates', () => {
  it('validates ISO dates', () => {
    assert.equal(isValidISODate('2024-02-29'), true);
    assert.equal(isValidISODate('2023-02-29'), false);
    assert.equal(isValidISODate('24-1-1'), false);
  });
  it('counts days together', () => {
    assert.equal(daysTogether('2026-10-27', today), 0);
    assert.equal(daysTogether('2026-10-20', today), 7);
    assert.equal(daysTogether('2027-01-01', today), null);
  });
});
