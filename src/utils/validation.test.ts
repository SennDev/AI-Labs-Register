import test from 'node:test';
import assert from 'node:assert/strict';
import { TRANSLATIONS } from './i18n';
import {
  CATEGORY_LABELS,
  CHALLENGE_CATEGORIES,
  DEPARTMENT_OPTIONS,
  MODALITY_LABELS,
  buildSanitizedRegistroPayload,
  composeDepartment,
  generateFolio,
  getRemainingCooldownSeconds,
  normalizeEmail,
  sanitizeText,
  validateField,
  validateRegistrationForm,
  type RegistrationFormInput,
} from './validation';

function makeValidInput(): RegistrationFormInput {
  return {
    fullName: 'María Fernanda López García',
    email: 'maria.lopez@vw.com.mx',
    departmentSelect: DEPARTMENT_OPTIONS[0],
    departmentDetail: 'Powertrain Cell',
    challengeTitle: 'Automated RFQ supplier quote comparison',
    problemDescription:
      'Every week we spend over ten hours consolidating Excel quotes from different suppliers manually, which delays sourcing awards and increases the risk of human error.',
    category: 'Análisis y cruce de datos',
    modality: 'En equipo',
    teammates: 'Carlos Ruiz, Sofía Mendoza',
    commitmentAccepted: true,
  };
}

test('sanitizeText strips HTML tags, script payloads, and collapses whitespace', () => {
  assert.equal(
    sanitizeText('  <b>Hello</b> <script>alert(1)</script>  World  '),
    'Hello alert(1) World'
  );
  assert.equal(
    sanitizeText('javascript:alert(1) onclick=hack() Clean text'),
    'alert(1) hack() Clean text'
  );
  assert.equal(
    sanitizeText('Line 1\r\n\r\n\r\nLine 2   with spaces', true),
    'Line 1\n\nLine 2 with spaces'
  );
});

test('normalizeEmail trims and lowercases email addresses', () => {
  assert.equal(
    normalizeEmail('  Gerson.Mendez@VW.COM.MX  '),
    'gerson.mendez@vw.com.mx'
  );
});

test('email validation allows only @vw.com.mx, @proveed-vw.com.mx, and @outlook.com', () => {
  const base = makeValidInput();

  for (const allowed of [
    'ana.perez@vw.com.mx',
    'proveedor.ext@proveed-vw.com.mx',
    'GersonEM8900@OUTLOOK.COM',
  ]) {
    assert.equal(
      validateField('email', { ...base, email: allowed }, 'es'),
      undefined,
      `Expected ${allowed} to be valid`
    );
    assert.equal(
      validateField('email', { ...base, email: allowed }, 'en'),
      undefined,
      `Expected ${allowed} to be valid`
    );
  }

  for (const blocked of [
    'usuario@gmail.com',
    'someone@yahoo.com',
    'hack@vw.com.mx.evil.com',
    'no-at-sign.com',
    '   ',
  ]) {
    assert.ok(validateField('email', { ...base, email: blocked }, 'es'));
    assert.ok(validateField('email', { ...base, email: blocked }, 'en'));
  }

  assert.match(
    validateField('email', { ...base, email: 'bad@gmail.com' }, 'es') ?? '',
    /Solo se permiten correos/
  );
  assert.match(
    validateField('email', { ...base, email: 'bad@gmail.com' }, 'en') ?? '',
    /Only email addresses ending in/
  );
});

test('fullName validation enforces letters/spaces and 5..100 characters', () => {
  const base = makeValidInput();
  assert.ok(validateField('fullName', { ...base, fullName: 'Ana' }, 'es'));
  assert.ok(validateField('fullName', { ...base, fullName: '     ' }, 'en'));
  assert.ok(validateField('fullName', { ...base, fullName: 'Carlos 123' }, 'en'));
  assert.equal(
    validateField('fullName', { ...base, fullName: 'José Ángel Pérez' }, 'es'),
    undefined
  );
});

test('problemDescription enforces 80..2000 character boundaries after trim', () => {
  const base = makeValidInput();
  assert.ok(
    validateField('problemDescription', {
      ...base,
      problemDescription: '   Too short   ',
    })
  );
  assert.ok(
    validateField('problemDescription', {
      ...base,
      problemDescription: 'a'.repeat(2001),
    })
  );
  assert.equal(
    validateField('problemDescription', {
      ...base,
      problemDescription: 'a'.repeat(80),
    }),
    undefined
  );
});

test('department composition preserves department codes and optional detail', () => {
  assert.equal(composeDepartment('M-BI', 'Powertrain'), 'M-BI — Powertrain');
  assert.equal(composeDepartment('M-BM', ''), 'M-BM');
});

test('every stored category and modality has translations in both es and en', () => {
  for (const cat of CHALLENGE_CATEGORIES) {
    assert.ok(CATEGORY_LABELS[cat].length > 0);
    assert.ok(TRANSLATIONS.es.form.categories[cat].length > 0);
    assert.ok(TRANSLATIONS.en.form.categories[cat].length > 0);
  }
  assert.equal(MODALITY_LABELS.Individual, 'Individual');
  assert.equal(MODALITY_LABELS['En equipo'], 'Team');
  assert.equal(TRANSLATIONS.es.form.modalities['En equipo'], 'En equipo');
  assert.equal(TRANSLATIONS.en.form.modalities['En equipo'], 'Team');
});

test('validateRegistrationForm accepts valid complete payload and rejects incomplete ones', () => {
  const valid = makeValidInput();
  const okResult = validateRegistrationForm(valid, 'es');
  assert.equal(okResult.isValid, true);
  assert.deepEqual(okResult.errors, {});

  const invalidResult = validateRegistrationForm(
    {
      ...valid,
      email: 'test@gmail.com',
      commitmentAccepted: false,
    },
    'en'
  );
  assert.equal(invalidResult.isValid, false);
  assert.ok(invalidResult.errors.email);
  assert.ok(invalidResult.errors.commitmentAccepted);
});

test('buildSanitizedRegistroPayload clears teammates when Individual', () => {
  const input = {
    ...makeValidInput(),
    modality: 'Individual' as const,
    teammates: 'Should be cleared',
  };
  const payload = buildSanitizedRegistroPayload(input, 'IALAB-ENE-AB12CD');
  assert.equal(payload.teammates, '');
  assert.equal(payload.edition, 'IA Labs - Enero');
  assert.equal(payload.folio, 'IALAB-ENE-AB12CD');
});

test('generateFolio matches expected pattern ^IALAB-ENE-[A-Z0-9]{6}$', () => {
  const folio = generateFolio(() => 0.5);
  assert.match(folio, /^IALAB-ENE-[A-Z0-9]{6}$/);
});

test('getRemainingCooldownSeconds computes remaining seconds accurately', () => {
  assert.equal(getRemainingCooldownSeconds(null, 100_000, 45_000), 0);
  assert.equal(getRemainingCooldownSeconds(50_000, 70_000, 45_000), 25);
  assert.equal(getRemainingCooldownSeconds(50_000, 95_000, 45_000), 0);
});
