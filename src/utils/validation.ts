import type { Language } from './i18n';

export const ALLOWED_EMAIL_DOMAINS = [
  'vw.com.mx',
  'proveed-vw.com.mx',
  'outlook.com',
] as const;

export const EMAIL_DOMAIN_REGEX =
  /^[a-zA-Z0-9._%+-]+@(vw\.com\.mx|proveed-vw\.com\.mx|outlook\.com)$/i;

export const FULL_NAME_REGEX =
  /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]+(?:\s+[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]+)*$/;

export const EDITION_LABEL = 'IA Labs - Enero' as const;

export const CHALLENGE_CATEGORIES = [
  'Automatización de tareas repetitivas',
  'Análisis y cruce de datos',
  'Gestión documental / reportes',
  'Asistente de consulta / conocimiento',
  'Otro',
] as const;

export type ChallengeCategory = (typeof CHALLENGE_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<ChallengeCategory, string> = {
  'Automatización de tareas repetitivas': 'Repetitive task automation',
  'Análisis y cruce de datos': 'Data analysis & cross-referencing',
  'Gestión documental / reportes': 'Document management & reporting',
  'Asistente de consulta / conocimiento': 'Knowledge & query assistant',
  Otro: 'Other',
};

export const DEPARTMENT_OPTIONS = [
  'M-BI',
  'M-BM',
  'M-BN',
  'M-BP',
  'M-BS',
  'M-BX',
  'M-BZ',
  'M-BA',
  'M-BW',
  'M-BB',
] as const;

export type ParticipationModality = 'Individual' | 'En equipo';

export const MODALITY_LABELS: Record<ParticipationModality, string> = {
  Individual: 'Individual',
  'En equipo': 'Team',
};

export interface RegistrationFormInput {
  fullName: string;
  email: string;
  departmentSelect: string;
  departmentDetail: string;
  challengeTitle: string;
  problemDescription: string;
  category: string;
  modality: ParticipationModality;
  teammates: string;
  commitmentAccepted: boolean;
}

export type ValidationErrors = Partial<
  Record<
    | 'fullName'
    | 'email'
    | 'departmentSelect'
    | 'departmentDetail'
    | 'challengeTitle'
    | 'problemDescription'
    | 'category'
    | 'modality'
    | 'teammates'
    | 'commitmentAccepted',
    string
  >
>;

export const FIELD_LIMITS = {
  fullNameMin: 5,
  fullNameMax: 100,
  emailMin: 6,
  emailMax: 120,
  departmentMin: 2,
  departmentMax: 120,
  challengeTitleMin: 10,
  challengeTitleMax: 100,
  problemDescriptionMin: 80,
  problemDescriptionMax: 2000,
  teammatesMax: 300,
} as const;

export const COOLDOWN_MS = 45_000;
export const COOLDOWN_STORAGE_KEY = 'ia_labs_enero_last_submit_ts';

const VALIDATION_MESSAGES: Record<
  Language,
  {
    fullNameRequired: string;
    fullNameMin: (min: number) => string;
    fullNameMax: (max: number) => string;
    fullNameInvalid: string;
    emailRequired: string;
    emailMax: (max: number) => string;
    emailDomainInvalid: string;
    deptRequired: string;
    deptDetailRequired: string;
    deptCombinedMax: (max: number) => string;
    titleRequired: string;
    titleMin: (min: number) => string;
    titleMax: (max: number) => string;
    problemRequired: string;
    problemRemaining: (missing: number, min: number) => string;
    problemMax: (max: number) => string;
    categoryInvalid: string;
    modalityInvalid: string;
    teammatesMax: (max: number) => string;
    commitmentRequired: string;
  }
> = {
  es: {
    fullNameRequired: 'Ingresa tu nombre completo.',
    fullNameMin: (min) => `Debe tener al menos ${min} caracteres.`,
    fullNameMax: (max) => `No debe superar los ${max} caracteres.`,
    fullNameInvalid:
      'Usa únicamente letras y espacios válidos (sin números ni símbolos).',
    emailRequired: 'Ingresa tu correo institucional o autorizado.',
    emailMax: (max) => `El correo no debe superar ${max} caracteres.`,
    emailDomainInvalid:
      'Solo se permiten correos terminados en @vw.com.mx, @proveed-vw.com.mx o @outlook.com.',
    deptRequired: 'Selecciona tu gerencia o área.',
    deptDetailRequired:
      'Especifica el nombre de tu gerencia o área (mínimo 2 caracteres).',
    deptCombinedMax: (max) =>
      `La gerencia y detalle no deben superar ${max} caracteres.`,
    titleRequired: 'Escribe un título breve para tu reto.',
    titleMin: (min) => `El título debe tener al menos ${min} caracteres.`,
    titleMax: (max) => `El título no debe superar ${max} caracteres.`,
    problemRequired: 'Describe el problema de fondo que deseas resolver.',
    problemRemaining: (missing, min) =>
      `Faltan ${missing} caracteres para completar el mínimo de ${min}.`,
    problemMax: (max) =>
      `Has superado el máximo permitido de ${max} caracteres.`,
    categoryInvalid: 'Selecciona una categoría válida para el reto.',
    modalityInvalid: 'Selecciona una modalidad de participación.',
    teammatesMax: (max) => `No debe superar ${max} caracteres.`,
    commitmentRequired:
      'Debes confirmar tu compromiso para asistir a los IA Labs en enero.',
  },
  en: {
    fullNameRequired: 'Please enter your full name.',
    fullNameMin: (min) => `Must be at least ${min} characters long.`,
    fullNameMax: (max) => `Must not exceed ${max} characters.`,
    fullNameInvalid:
      'Use letters and valid spaces only (no numbers or symbols).',
    emailRequired: 'Please enter your corporate or authorized email address.',
    emailMax: (max) => `Email must not exceed ${max} characters.`,
    emailDomainInvalid:
      'Only email addresses ending in @vw.com.mx, @proveed-vw.com.mx, or @outlook.com are allowed.',
    deptRequired: 'Please select your department or area.',
    deptDetailRequired:
      'Please specify your department or area name (minimum 2 characters).',
    deptCombinedMax: (max) =>
      `Department and detail combined must not exceed ${max} characters.`,
    titleRequired: 'Please enter a short title for your challenge.',
    titleMin: (min) => `Title must be at least ${min} characters long.`,
    titleMax: (max) => `Title must not exceed ${max} characters.`,
    problemRequired: 'Please describe the underlying problem you want to solve.',
    problemRemaining: (missing, min) =>
      `${missing} more characters needed to reach the ${min}-character minimum.`,
    problemMax: (max) =>
      `You have exceeded the maximum limit of ${max} characters.`,
    categoryInvalid: 'Please select a valid category for your challenge.',
    modalityInvalid: 'Please select a participation format.',
    teammatesMax: (max) => `Must not exceed ${max} characters.`,
    commitmentRequired:
      'Please confirm your commitment to attend the January IA Labs sessions.',
  },
};

/**
 * Sanitizes text input by stripping HTML tags, javascript: schemes, and control characters.
 */
export function sanitizeText(value: string, preserveNewlines = false): string {
  if (typeof value !== 'string') {
    return '';
  }

  let cleaned = value
    .replace(/\u0000/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/on\w+\s*=/gi, '');

  if (preserveNewlines) {
    cleaned = cleaned
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  } else {
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
  }

  return cleaned;
}

export function normalizeEmail(email: string): string {
  return sanitizeText(email, false).toLowerCase();
}

export function composeDepartment(
  departmentSelect: string,
  departmentDetail: string
): string {
  const cleanSelect = sanitizeText(departmentSelect, false);
  const cleanDetail = sanitizeText(departmentDetail, false);

  if (!cleanSelect) {
    return '';
  }
  if (cleanSelect === 'Otro (especificar)') {
    return cleanDetail.slice(0, FIELD_LIMITS.departmentMax);
  }
  if (cleanDetail) {
    const combined = `${cleanSelect} — ${cleanDetail}`;
    return combined.slice(0, FIELD_LIMITS.departmentMax);
  }
  return cleanSelect.slice(0, FIELD_LIMITS.departmentMax);
}

export function validateField(
  field: keyof RegistrationFormInput,
  input: RegistrationFormInput,
  lang: Language = 'es'
): string | undefined {
  const msg = VALIDATION_MESSAGES[lang];

  switch (field) {
    case 'fullName': {
      const clean = sanitizeText(input.fullName, false);
      if (!clean) {
        return msg.fullNameRequired;
      }
      if (clean.length < FIELD_LIMITS.fullNameMin) {
        return msg.fullNameMin(FIELD_LIMITS.fullNameMin);
      }
      if (clean.length > FIELD_LIMITS.fullNameMax) {
        return msg.fullNameMax(FIELD_LIMITS.fullNameMax);
      }
      if (!FULL_NAME_REGEX.test(clean)) {
        return msg.fullNameInvalid;
      }
      return undefined;
    }

    case 'email': {
      const normalized = normalizeEmail(input.email);
      if (!normalized) {
        return msg.emailRequired;
      }
      if (normalized.length > FIELD_LIMITS.emailMax) {
        return msg.emailMax(FIELD_LIMITS.emailMax);
      }
      if (!EMAIL_DOMAIN_REGEX.test(normalized)) {
        return msg.emailDomainInvalid;
      }
      return undefined;
    }

    case 'departmentSelect': {
      const clean = sanitizeText(input.departmentSelect, false);
      if (!clean) {
        return msg.deptRequired;
      }
      return undefined;
    }

    case 'departmentDetail': {
      const cleanSelect = sanitizeText(input.departmentSelect, false);
      const cleanDetail = sanitizeText(input.departmentDetail, false);
      if (cleanSelect === 'Otro (especificar)' && cleanDetail.length < 2) {
        return msg.deptDetailRequired;
      }
      const composed = composeDepartment(
        input.departmentSelect,
        input.departmentDetail
      );
      if (composed.length > FIELD_LIMITS.departmentMax) {
        return msg.deptCombinedMax(FIELD_LIMITS.departmentMax);
      }
      return undefined;
    }

    case 'challengeTitle': {
      const clean = sanitizeText(input.challengeTitle, false);
      if (!clean) {
        return msg.titleRequired;
      }
      if (clean.length < FIELD_LIMITS.challengeTitleMin) {
        return msg.titleMin(FIELD_LIMITS.challengeTitleMin);
      }
      if (clean.length > FIELD_LIMITS.challengeTitleMax) {
        return msg.titleMax(FIELD_LIMITS.challengeTitleMax);
      }
      return undefined;
    }

    case 'problemDescription': {
      const clean = sanitizeText(input.problemDescription, true);
      if (!clean) {
        return msg.problemRequired;
      }
      if (clean.length < FIELD_LIMITS.problemDescriptionMin) {
        return msg.problemRemaining(
          FIELD_LIMITS.problemDescriptionMin - clean.length,
          FIELD_LIMITS.problemDescriptionMin
        );
      }
      if (clean.length > FIELD_LIMITS.problemDescriptionMax) {
        return msg.problemMax(FIELD_LIMITS.problemDescriptionMax);
      }
      return undefined;
    }

    case 'category': {
      const clean = sanitizeText(input.category, false);
      if (
        !clean ||
        !(CHALLENGE_CATEGORIES as readonly string[]).includes(clean)
      ) {
        return msg.categoryInvalid;
      }
      return undefined;
    }

    case 'modality': {
      if (input.modality !== 'Individual' && input.modality !== 'En equipo') {
        return msg.modalityInvalid;
      }
      return undefined;
    }

    case 'teammates': {
      if (input.modality === 'En equipo') {
        const clean = sanitizeText(input.teammates, false);
        if (clean.length > FIELD_LIMITS.teammatesMax) {
          return msg.teammatesMax(FIELD_LIMITS.teammatesMax);
        }
      }
      return undefined;
    }

    case 'commitmentAccepted': {
      if (!input.commitmentAccepted) {
        return msg.commitmentRequired;
      }
      return undefined;
    }
  }
}

export function validateRegistrationForm(
  input: RegistrationFormInput,
  lang: Language = 'es'
): {
  isValid: boolean;
  errors: ValidationErrors;
} {
  const fields: Array<keyof RegistrationFormInput> = [
    'fullName',
    'email',
    'departmentSelect',
    'departmentDetail',
    'challengeTitle',
    'problemDescription',
    'category',
    'modality',
    'teammates',
    'commitmentAccepted',
  ];

  const errors: ValidationErrors = {};
  for (const field of fields) {
    const err = validateField(field, input, lang);
    if (err) {
      errors[field] = err;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function buildSanitizedRegistroPayload(
  input: RegistrationFormInput,
  folio: string
) {
  const modality: ParticipationModality =
    input.modality === 'En equipo' ? 'En equipo' : 'Individual';

  return {
    folio,
    fullName: sanitizeText(input.fullName, false),
    email: normalizeEmail(input.email),
    department: composeDepartment(input.departmentSelect, input.departmentDetail),
    challengeTitle: sanitizeText(input.challengeTitle, false),
    problemDescription: sanitizeText(input.problemDescription, true),
    category: sanitizeText(input.category, false) as ChallengeCategory,
    modality,
    teammates:
      modality === 'En equipo' ? sanitizeText(input.teammates, false) : '',
    commitmentAccepted: Boolean(input.commitmentAccepted),
    edition: EDITION_LABEL,
  };
}

export function generateFolio(randomFn: () => number = Math.random): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 6; i += 1) {
    const idx = Math.floor(randomFn() * alphabet.length);
    suffix += alphabet.charAt(idx);
  }
  return `IALAB-ENE-${suffix}`;
}

export function getRemainingCooldownSeconds(
  lastSubmitTs: number | null,
  nowTs: number = Date.now(),
  cooldownMs: number = COOLDOWN_MS
): number {
  if (!lastSubmitTs || Number.isNaN(lastSubmitTs)) {
    return 0;
  }
  const elapsed = nowTs - lastSubmitTs;
  if (elapsed < 0 || elapsed >= cooldownMs) {
    return 0;
  }
  return Math.ceil((cooldownMs - elapsed) / 1000);
}
