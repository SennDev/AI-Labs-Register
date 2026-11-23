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
  input: RegistrationFormInput
): string | undefined {
  switch (field) {
    case 'fullName': {
      const clean = sanitizeText(input.fullName, false);
      if (!clean) {
        return 'Please enter your full name.';
      }
      if (clean.length < FIELD_LIMITS.fullNameMin) {
        return `Must be at least ${FIELD_LIMITS.fullNameMin} characters long.`;
      }
      if (clean.length > FIELD_LIMITS.fullNameMax) {
        return `Must not exceed ${FIELD_LIMITS.fullNameMax} characters.`;
      }
      if (!FULL_NAME_REGEX.test(clean)) {
        return 'Use letters and valid spaces only (no numbers or symbols).';
      }
      return undefined;
    }

    case 'email': {
      const normalized = normalizeEmail(input.email);
      if (!normalized) {
        return 'Please enter your corporate or authorized email address.';
      }
      if (normalized.length > FIELD_LIMITS.emailMax) {
        return `Email must not exceed ${FIELD_LIMITS.emailMax} characters.`;
      }
      if (!EMAIL_DOMAIN_REGEX.test(normalized)) {
        return 'Only email addresses ending in @vw.com.mx, @proveed-vw.com.mx, or @outlook.com are allowed.';
      }
      return undefined;
    }

    case 'departmentSelect': {
      const clean = sanitizeText(input.departmentSelect, false);
      if (!clean) {
        return 'Please select your department or area.';
      }
      return undefined;
    }

    case 'departmentDetail': {
      const cleanSelect = sanitizeText(input.departmentSelect, false);
      const cleanDetail = sanitizeText(input.departmentDetail, false);
      if (cleanSelect === 'Otro (especificar)' && cleanDetail.length < 2) {
        return 'Please specify your department or area name (minimum 2 characters).';
      }
      const composed = composeDepartment(input.departmentSelect, input.departmentDetail);
      if (composed.length > FIELD_LIMITS.departmentMax) {
        return `Department and detail combined must not exceed ${FIELD_LIMITS.departmentMax} characters.`;
      }
      return undefined;
    }

    case 'challengeTitle': {
      const clean = sanitizeText(input.challengeTitle, false);
      if (!clean) {
        return 'Please enter a short title for your challenge.';
      }
      if (clean.length < FIELD_LIMITS.challengeTitleMin) {
        return `Title must be at least ${FIELD_LIMITS.challengeTitleMin} characters long.`;
      }
      if (clean.length > FIELD_LIMITS.challengeTitleMax) {
        return `Title must not exceed ${FIELD_LIMITS.challengeTitleMax} characters.`;
      }
      return undefined;
    }

    case 'problemDescription': {
      const clean = sanitizeText(input.problemDescription, true);
      if (!clean) {
        return 'Please describe the underlying problem you want to solve.';
      }
      if (clean.length < FIELD_LIMITS.problemDescriptionMin) {
        return `${FIELD_LIMITS.problemDescriptionMin - clean.length} more characters needed to reach the ${FIELD_LIMITS.problemDescriptionMin}-character minimum.`;
      }
      if (clean.length > FIELD_LIMITS.problemDescriptionMax) {
        return `You have exceeded the maximum limit of ${FIELD_LIMITS.problemDescriptionMax} characters.`;
      }
      return undefined;
    }

    case 'category': {
      const clean = sanitizeText(input.category, false);
      if (
        !clean ||
        !(CHALLENGE_CATEGORIES as readonly string[]).includes(clean)
      ) {
        return 'Please select a valid category for your challenge.';
      }
      return undefined;
    }

    case 'modality': {
      if (input.modality !== 'Individual' && input.modality !== 'En equipo') {
        return 'Please select a participation format.';
      }
      return undefined;
    }

    case 'teammates': {
      if (input.modality === 'En equipo') {
        const clean = sanitizeText(input.teammates, false);
        if (clean.length > FIELD_LIMITS.teammatesMax) {
          return `Must not exceed ${FIELD_LIMITS.teammatesMax} characters.`;
        }
      }
      return undefined;
    }

    case 'commitmentAccepted': {
      if (!input.commitmentAccepted) {
        return 'Please confirm your commitment to attend the January IA Labs sessions.';
      }
      return undefined;
    }
  }
}

export function validateRegistrationForm(input: RegistrationFormInput): {
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
    const err = validateField(field, input);
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
