import test from 'node:test';
import assert from 'node:assert/strict';
import {
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
    departmentSelect: 'Compras Directas / Materiales Productivos',
    departmentDetail: 'Célula Tren Motriz',
    challengeTitle: 'Automatización de comparativas RFQ de proveedores',
    problemDescription:
      'Cada semana invertimos más de diez horas consolidando cotizaciones en Excel de distintos proveedores, lo que retrasa la adjudicación y aumenta el riesgo de error humano.',
    category: 'Análisis y cruce de datos',
    modality: 'En equipo',
    teammates: 'Carlos Ruiz, Sofía Mendoza',
    commitmentAccepted: true,
  };
}

test('sanitizeText strips HTML tags, script payloads, and collapses whitespace', () => {
  assert.equal(
    sanitizeText('  <b>Hola</b> <script>alert(1)</script>  Mundo  '),
    'Hola alert(1) Mundo'
  );
  assert.equal(
    sanitizeText('javascript:alert(1) onclick=hack() Texto limpio'),
    'alert(1) hack() Texto limpio'
  );
  assert.equal(
    sanitizeText('Línea 1\r\n\r\n\r\nLínea 2   con espacios', true),
    'Línea 1\n\nLínea 2 con espacios'
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
      validateField('email', { ...base, email: allowed }),
      undefined,
      `Expected ${allowed} to be valid`
    );
  }

  for (const blocked of [
    'usuario@gmail.com',
    'alguien@yahoo.com',
    'hack@vw.com.mx.evil.com',
    'sin-arroba.com',
    '   ',
  ]) {
    assert.ok(
      validateField('email', { ...base, email: blocked }),
      `Expected ${blocked} to be rejected`
    );
  }
});

test('fullName validation enforces letters/spaces and 5..100 characters', () => {
  const base = makeValidInput();
  assert.ok(validateField('fullName', { ...base, fullName: 'Ana' }));
  assert.ok(validateField('fullName', { ...base, fullName: '     ' }));
  assert.ok(validateField('fullName', { ...base, fullName: 'Carlos 123' }));
  assert.equal(
    validateField('fullName', { ...base, fullName: 'José Ángel Pérez' }),
    undefined
  );
});

test('problemDescription enforces 80..2000 character boundaries after trim', () => {
  const base = makeValidInput();
  assert.ok(
    validateField('problemDescription', {
      ...base,
      problemDescription: '   Texto muy corto   ',
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

test('department composition handles selector + detail and Otro (especificar)', () => {
  assert.equal(
    composeDepartment('Otro (especificar)', 'Ingeniería de Costos'),
    'Ingeniería de Costos'
  );
  assert.equal(
    composeDepartment('Compras Indirectas / Servicios y CapEx', ''),
    'Compras Indirectas / Servicios y CapEx'
  );
  const base = makeValidInput();
  assert.ok(
    validateField('departmentDetail', {
      ...base,
      departmentSelect: 'Otro (especificar)',
      departmentDetail: ' ',
    })
  );
});

test('validateRegistrationForm accepts valid complete payload and rejects incomplete ones', () => {
  const valid = makeValidInput();
  const okResult = validateRegistrationForm(valid);
  assert.equal(okResult.isValid, true);
  assert.deepEqual(okResult.errors, {});

  const invalidResult = validateRegistrationForm({
    ...valid,
    email: 'test@gmail.com',
    commitmentAccepted: false,
  });
  assert.equal(invalidResult.isValid, false);
  assert.ok(invalidResult.errors.email);
  assert.ok(invalidResult.errors.commitmentAccepted);
});

test('buildSanitizedRegistroPayload clears teammates when Individual', () => {
  const input = {
    ...makeValidInput(),
    modality: 'Individual' as const,
    teammates: 'Debe limpiarse',
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
