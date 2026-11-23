import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Loader2,
  PlusCircle,
  Send,
  User,
  Users,
} from 'lucide-react';
import type { ThemeMode } from '../App';
import {
  CATEGORY_LABELS,
  CHALLENGE_CATEGORIES,
  COOLDOWN_STORAGE_KEY,
  DEPARTMENT_OPTIONS,
  FIELD_LIMITS,
  MODALITY_LABELS,
  buildSanitizedRegistroPayload,
  generateFolio,
  getRemainingCooldownSeconds,
  sanitizeText,
  validateField,
  validateRegistrationForm,
  type ChallengeCategory,
  type ParticipationModality,
  type RegistrationFormInput,
  type ValidationErrors,
} from '../utils/validation';
import { submitChallengeRegistration } from '../firebase-config';
import { triggerRipple } from './Navbar';

interface RegistrationFormProps {
  theme: ThemeMode;
  templateRequest: { text: string; nonce: number } | null;
}

interface SubmittedReceipt {
  folio: string;
  fullName: string;
  email: string;
  department: string;
  challengeTitle: string;
  category: ChallengeCategory;
  modality: ParticipationModality;
  teammates: string;
  submittedAtLabel: string;
}

const INITIAL_INPUT: RegistrationFormInput = {
  fullName: '',
  email: '',
  departmentSelect: '',
  departmentDetail: '',
  challengeTitle: '',
  problemDescription: '',
  category: '',
  modality: 'Individual',
  teammates: '',
  commitmentAccepted: false,
};

export function RegistrationForm({
  theme,
  templateRequest,
}: RegistrationFormProps) {
  const formId = useId();
  const [form, setForm] = useState<RegistrationFormInput>(INITIAL_INPUT);
  const [touched, setTouched] = useState<
    Partial<Record<keyof RegistrationFormInput, boolean>>
  >({});
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<SubmittedReceipt | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(() => {
    try {
      const saved = window.localStorage.getItem(COOLDOWN_STORAGE_KEY);
      return getRemainingCooldownSeconds(saved ? Number(saved) : null);
    } catch {
      return 0;
    }
  });
  const [badgeError, setBadgeError] = useState(false);

  const problemTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  // Update local cooldown countdown every second while active
  useEffect(() => {
    if (cooldownSeconds <= 0) {
      return;
    }
    const interval = window.setInterval(() => {
      try {
        const saved = window.localStorage.getItem(COOLDOWN_STORAGE_KEY);
        const remaining = getRemainingCooldownSeconds(
          saved ? Number(saved) : null
        );
        setCooldownSeconds(remaining);
      } catch {
        setCooldownSeconds(0);
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [cooldownSeconds]);

  // Apply structured prompt template to problem description when requested
  useEffect(() => {
    if (!templateRequest) {
      return;
    }
    setReceipt(null);
    setForm((prev) => {
      const hasContent = prev.problemDescription.trim().length > 0;
      const nextProblem = hasContent
        ? prev.problemDescription
        : templateRequest.text;
      return {
        ...prev,
        problemDescription: nextProblem,
      };
    });
    window.setTimeout(() => {
      problemTextareaRef.current?.focus();
    }, 120);
  }, [templateRequest]);

  const updateField = <K extends keyof RegistrationFormInput>(
    field: K,
    value: RegistrationFormInput[K],
    forceTouch = false
  ) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (forceTouch || touched[field]) {
        const fieldError = validateField(field, next);
        setErrors((prevErrors) => {
          const updated = { ...prevErrors };
          if (fieldError) {
            updated[field] = fieldError;
          } else {
            delete updated[field];
          }
          if (field === 'departmentSelect' && (forceTouch || touched.departmentDetail)) {
            const detailErr = validateField('departmentDetail', next);
            if (detailErr) {
              updated.departmentDetail = detailErr;
            } else {
              delete updated.departmentDetail;
            }
          }
          if (field === 'modality') {
            const teammatesErr = validateField('teammates', next);
            if (teammatesErr) {
              updated.teammates = teammatesErr;
            } else {
              delete updated.teammates;
            }
          }
          return updated;
        });
      }
      return next;
    });
    if (forceTouch) {
      setTouched((prev) => ({ ...prev, [field]: true }));
    }
    if (submitError) {
      setSubmitError(null);
    }
  };

  const handleBlur = (field: keyof RegistrationFormInput) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, form);
    setErrors((prev) => {
      const updated = { ...prev };
      if (err) {
        updated[field] = err;
      } else {
        delete updated[field];
      }
      return updated;
    });
  };

  const cleanProblemLength = sanitizeText(form.problemDescription, true).length;
  const problemProgressPct = Math.min(
    100,
    Math.round((cleanProblemLength / FIELD_LIMITS.problemDescriptionMin) * 100)
  );
  const cleanTitleLength = sanitizeText(form.challengeTitle, false).length;

  const focusFirstError = (validationErrors: ValidationErrors) => {
    const order: Array<{ key: keyof ValidationErrors; selector: string }> = [
      { key: 'fullName', selector: `#${formId}-fullName` },
      { key: 'email', selector: `#${formId}-email` },
      { key: 'departmentSelect', selector: `#${formId}-departmentSelect` },
      { key: 'departmentDetail', selector: `#${formId}-departmentDetail` },
      { key: 'challengeTitle', selector: `#${formId}-challengeTitle` },
      { key: 'category', selector: `input[name="${formId}-category"]` },
      { key: 'problemDescription', selector: `#${formId}-problemDescription` },
      { key: 'teammates', selector: `#${formId}-teammates` },
      { key: 'commitmentAccepted', selector: `#${formId}-commitment` },
    ];

    for (const item of order) {
      if (validationErrors[item.key]) {
        const el = formRef.current?.querySelector<HTMLElement>(item.selector);
        el?.focus();
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        break;
      }
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    // Check local cooldown
    try {
      const saved = window.localStorage.getItem(COOLDOWN_STORAGE_KEY);
      const remaining = getRemainingCooldownSeconds(
        saved ? Number(saved) : null
      );
      if (remaining > 0) {
        setCooldownSeconds(remaining);
        setSubmitError(
          `To prevent duplicate submissions, please wait ${remaining} seconds before submitting another challenge.`
        );
        return;
      }
    } catch {
      // Ignore if localStorage is unavailable
    }

    const allTouched: Partial<Record<keyof RegistrationFormInput, boolean>> = {
      fullName: true,
      email: true,
      departmentSelect: true,
      departmentDetail: true,
      challengeTitle: true,
      problemDescription: true,
      category: true,
      modality: true,
      teammates: true,
      commitmentAccepted: true,
    };
    setTouched(allTouched);

    const validation = validateRegistrationForm(form);
    setErrors(validation.errors);

    if (!validation.isValid) {
      focusFirstError(validation.errors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const folio = generateFolio();
      const payload = buildSanitizedRegistroPayload(form, folio);
      await submitChallengeRegistration(payload);

      const now = Date.now();
      try {
        window.localStorage.setItem(COOLDOWN_STORAGE_KEY, String(now));
      } catch {
        // Ignore storage errors
      }
      setCooldownSeconds(getRemainingCooldownSeconds(now, now));

      setReceipt({
        folio,
        fullName: payload.fullName,
        email: payload.email,
        department: payload.department,
        challengeTitle: payload.challengeTitle,
        category: payload.category,
        modality: payload.modality,
        teammates: payload.teammates,
        submittedAtLabel: new Intl.DateTimeFormat('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(new Date()),
      });
    } catch (error) {
      console.error('Error saving registration to Firestore:', error);
      setSubmitError(
        'We could not complete your registration right now. Please check your connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterAnother = () => {
    setForm(INITIAL_INPUT);
    setTouched({});
    setErrors({});
    setSubmitError(null);
    setReceipt(null);
  };

  const isFieldValid = (field: keyof RegistrationFormInput): boolean => {
    return Boolean(touched[field]) && !errors[field];
  };

  const badgeSrc =
    theme === 'dark'
      ? './assets/Icono_App_512.png'
      : './assets/Icono_Turquesa.png';

  if (receipt) {
    return (
      <section id="registro" className="scroll-mt-20 py-10 sm:py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div
            role="status"
            aria-live="polite"
            className="neo-surface-elevated rounded-3xl p-7 sm:p-11"
            data-testid="registration-success"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#002733]/10 dark:border-white/10">
              <div className="flex items-center gap-4">
                <div className="neo-inset w-14 h-14 rounded-2xl flex items-center justify-center text-[#008C82] dark:text-[#2DD4BF] shrink-0">
                  <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#008C82] dark:text-[#2DD4BF] tracking-wide">
                    Registration confirmed · IA Labs January
                  </p>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#002733] dark:text-white">
                    Submission received
                  </h2>
                </div>
              </div>

              {!badgeError && (
                <img
                  src={badgeSrc}
                  alt="Procurement Academy"
                  className="w-10 h-10 object-contain rounded-lg"
                  referrerPolicy="no-referrer"
                  onError={() => setBadgeError(true)}
                />
              )}
            </div>

            {/* Generated reference code */}
            <div className="my-6 neo-navy-panel rounded-2xl p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-white/75 mb-1">
                  Reference folio
                </p>
                <p
                  className="font-mono-tabular text-2xl sm:text-3xl font-bold tracking-wider text-[#C2FE06]"
                  data-testid="generated-folio"
                >
                  {receipt.folio}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs text-white/75 mb-1">Submitted on</p>
                <p className="text-sm font-medium text-white">
                  {receipt.submittedAtLabel}
                </p>
              </div>
            </div>

            {/* Submission summary */}
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-8">
              <div className="neo-inset rounded-2xl p-4">
                <dt className="text-xs text-[#002733]/65 dark:text-[#9FC0C0] mb-1">
                  Applicant
                </dt>
                <dd className="font-semibold text-[#002733] dark:text-white break-words">
                  {receipt.fullName}
                </dd>
              </div>
              <div className="neo-inset rounded-2xl p-4">
                <dt className="text-xs text-[#002733]/65 dark:text-[#9FC0C0] mb-1">
                  Authorized email
                </dt>
                <dd className="font-mono-tabular text-[13px] font-medium text-[#002733] dark:text-white break-all">
                  {receipt.email}
                </dd>
              </div>
              <div className="neo-inset rounded-2xl p-4">
                <dt className="text-xs text-[#002733]/65 dark:text-[#9FC0C0] mb-1">
                  Department / Area
                </dt>
                <dd className="font-medium text-[#002733] dark:text-white break-words">
                  {receipt.department}
                </dd>
              </div>
              <div className="neo-inset rounded-2xl p-4">
                <dt className="text-xs text-[#002733]/65 dark:text-[#9FC0C0] mb-1">
                  Category & Format
                </dt>
                <dd className="font-medium text-[#002733] dark:text-white">
                  {CATEGORY_LABELS[receipt.category]} · {MODALITY_LABELS[receipt.modality]}
                </dd>
              </div>
              <div className="neo-inset rounded-2xl p-4 sm:col-span-2">
                <dt className="text-xs text-[#002733]/65 dark:text-[#9FC0C0] mb-1">
                  Challenge title
                </dt>
                <dd className="font-semibold text-[#002733] dark:text-white">
                  {receipt.challengeTitle}
                </dd>
                {receipt.teammates && (
                  <p className="mt-2 text-xs text-[#002733]/75 dark:text-[#CBE0E0]">
                    Team members: {receipt.teammates}
                  </p>
                )}
              </div>
            </dl>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#002733]/10 dark:border-white/10">
              <div className="flex items-center gap-2 text-xs text-[#002733]/75 dark:text-[#CBE0E0]">
                <Clock
                  className="w-4 h-4 text-[#008C82] dark:text-[#2DD4BF] shrink-0"
                  aria-hidden="true"
                />
                {cooldownSeconds > 0 ? (
                  <span className="font-mono-tabular">
                    Duplicate protection active ({cooldownSeconds}s until next submission)
                  </span>
                ) : (
                  <span>Ready to submit another challenge if needed.</span>
                )}
              </div>

              <button
                type="button"
                onClick={(e) => {
                  triggerRipple(e);
                  handleRegisterAnother();
                }}
                className="btn-neo inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold cursor-pointer min-h-[44px]"
              >
                <PlusCircle
                  className="w-4 h-4 text-[#008C82] dark:text-[#C2FE06]"
                  aria-hidden="true"
                />
                Submit another challenge
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="registro" className="scroll-mt-20 py-10 sm:py-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="neo-surface-elevated rounded-3xl p-6 sm:p-10 md:p-12 reveal-item is-visible">
          <div className="mb-8 pb-6 border-b border-[#002733]/10 dark:border-white/10">
            <p className="text-sm font-semibold text-[#008C82] dark:text-[#2DD4BF] mb-2">
              Registration Form
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#002733] dark:text-white tracking-tight [text-wrap:balance]">
              Submit your challenge for IA Labs · January
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#002733]/75 dark:text-[#CBE0E0] leading-relaxed max-w-2xl">
              Complete the fields below with a clear description of your operational problem. All submissions are encrypted client-side and stored privately.
            </p>
          </div>

          <form
            ref={formRef}
            onSubmit={handleSubmit}
            noValidate
            className="space-y-7"
          >
            {/* Row 1: Full name & Authorized email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor={`${formId}-fullName`}
                  className="block text-sm font-semibold text-[#002733] dark:text-white mb-2"
                >
                  Full name <span className="text-[#008C82] dark:text-[#C2FE06]">*</span>
                </label>
                <div className="relative">
                  <input
                    id={`${formId}-fullName`}
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    maxLength={FIELD_LIMITS.fullNameMax}
                    placeholder="e.g. Laura Hernandez Vazquez"
                    value={form.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    onBlur={() => handleBlur('fullName')}
                    aria-invalid={Boolean(errors.fullName)}
                    aria-describedby={
                      errors.fullName ? `${formId}-fullName-error` : undefined
                    }
                    className={`w-full rounded-2xl px-4 py-3.5 pr-10 text-sm sm:text-base text-[#002733] dark:text-[#F0F6F6] placeholder:text-[#002733]/40 dark:placeholder:text-[#CBE0E0]/45 neo-inset ${
                      errors.fullName
                        ? 'neo-inset-error'
                        : isFieldValid('fullName')
                          ? 'neo-inset-valid'
                          : ''
                    }`}
                  />
                  {isFieldValid('fullName') && (
                    <Check
                      className="w-4 h-4 text-[#008C82] dark:text-[#2DD4BF] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                  )}
                </div>
                {errors.fullName ? (
                  <p
                    id={`${formId}-fullName-error`}
                    role="alert"
                    className="mt-2 flex items-start gap-1.5 text-xs font-medium text-[#b42318] dark:text-[#FDA29B]"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{errors.fullName}</span>
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-[#002733]/60 dark:text-[#9FC0C0]">
                    Minimum 5 characters, letters and spaces only.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor={`${formId}-email`}
                  className="block text-sm font-semibold text-[#002733] dark:text-white mb-2"
                >
                  Authorized email address <span className="text-[#008C82] dark:text-[#C2FE06]">*</span>
                </label>
                <div className="relative">
                  <input
                    id={`${formId}-email`}
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    maxLength={FIELD_LIMITS.emailMax}
                    placeholder="first.last@vw.com.mx"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={`${formId}-email-help`}
                    className={`w-full rounded-2xl px-4 py-3.5 pr-10 text-sm sm:text-base text-[#002733] dark:text-[#F0F6F6] placeholder:text-[#002733]/40 dark:placeholder:text-[#CBE0E0]/45 neo-inset ${
                      errors.email
                        ? 'neo-inset-error'
                        : isFieldValid('email')
                          ? 'neo-inset-valid'
                          : ''
                    }`}
                  />
                  {isFieldValid('email') && (
                    <Check
                      className="w-4 h-4 text-[#008C82] dark:text-[#2DD4BF] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                  )}
                </div>
                {errors.email ? (
                  <p
                    id={`${formId}-email-help`}
                    role="alert"
                    className="mt-2 flex items-start gap-1.5 text-xs font-medium text-[#b42318] dark:text-[#FDA29B]"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{errors.email}</span>
                  </p>
                ) : (
                  <p
                    id={`${formId}-email-help`}
                    className="mt-2 text-xs text-[#002733]/60 dark:text-[#9FC0C0]"
                  >
                    Accepts @vw.com.mx, @proveed-vw.com.mx, or @outlook.com only.
                  </p>
                )}
              </div>
            </div>

            {/* Row 2: Department / Area (select + optional sub-area) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor={`${formId}-departmentSelect`}
                  className="block text-sm font-semibold text-[#002733] dark:text-white mb-2"
                >
                  Department / Area <span className="text-[#008C82] dark:text-[#C2FE06]">*</span>
                </label>
                <select
                  id={`${formId}-departmentSelect`}
                  name="departmentSelect"
                  value={form.departmentSelect}
                  onChange={(e) =>
                    updateField('departmentSelect', e.target.value, true)
                  }
                  onBlur={() => handleBlur('departmentSelect')}
                  aria-invalid={Boolean(errors.departmentSelect)}
                  aria-describedby={
                    errors.departmentSelect
                      ? `${formId}-departmentSelect-error`
                      : undefined
                  }
                  className={`w-full rounded-2xl px-4 py-3.5 text-sm sm:text-base text-[#002733] dark:text-[#F0F6F6] neo-inset cursor-pointer ${
                    errors.departmentSelect
                      ? 'neo-inset-error'
                      : isFieldValid('departmentSelect')
                        ? 'neo-inset-valid'
                        : ''
                  }`}
                >
                  <option value="">Select your department...</option>
                  {DEPARTMENT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors.departmentSelect && (
                  <p
                    id={`${formId}-departmentSelect-error`}
                    role="alert"
                    className="mt-2 flex items-start gap-1.5 text-xs font-medium text-[#b42318] dark:text-[#FDA29B]"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{errors.departmentSelect}</span>
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor={`${formId}-departmentDetail`}
                  className="block text-sm font-semibold text-[#002733] dark:text-white mb-2"
                >
                  {form.departmentSelect === 'Otro (especificar)'
                    ? 'Specify your department or area'
                    : 'Sub-area or team cell (optional)'}
                  {form.departmentSelect === 'Otro (especificar)' && (
                    <span className="text-[#008C82] dark:text-[#C2FE06]"> *</span>
                  )}
                </label>
                <input
                  id={`${formId}-departmentDetail`}
                  name="departmentDetail"
                  type="text"
                  maxLength={80}
                  placeholder={
                    form.departmentSelect === 'Otro (especificar)'
                      ? 'Name of your department or unit'
                      : 'e.g. Powertrain / Plant CapEx'
                  }
                  value={form.departmentDetail}
                  onChange={(e) =>
                    updateField('departmentDetail', e.target.value)
                  }
                  onBlur={() => handleBlur('departmentDetail')}
                  aria-invalid={Boolean(errors.departmentDetail)}
                  aria-describedby={
                    errors.departmentDetail
                      ? `${formId}-departmentDetail-error`
                      : undefined
                  }
                  className={`w-full rounded-2xl px-4 py-3.5 text-sm sm:text-base text-[#002733] dark:text-[#F0F6F6] placeholder:text-[#002733]/40 dark:placeholder:text-[#CBE0E0]/45 neo-inset ${
                    errors.departmentDetail ? 'neo-inset-error' : ''
                  }`}
                />
                {errors.departmentDetail && (
                  <p
                    id={`${formId}-departmentDetail-error`}
                    role="alert"
                    className="mt-2 flex items-start gap-1.5 text-xs font-medium text-[#b42318] dark:text-[#FDA29B]"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{errors.departmentDetail}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Challenge Title */}
            <div>
              <div className="flex items-center justify-between gap-4 mb-2">
                <label
                  htmlFor={`${formId}-challengeTitle`}
                  className="block text-sm font-semibold text-[#002733] dark:text-white"
                >
                  Challenge title <span className="text-[#008C82] dark:text-[#C2FE06]">*</span>
                </label>
                <span className="font-mono-tabular text-xs text-[#002733]/65 dark:text-[#9FC0C0]">
                  {cleanTitleLength} / {FIELD_LIMITS.challengeTitleMax}
                </span>
              </div>
              <div className="relative">
                <input
                  id={`${formId}-challengeTitle`}
                  name="challengeTitle"
                  type="text"
                  maxLength={FIELD_LIMITS.challengeTitleMax}
                  placeholder="e.g. Automated comparison of supplier RFQ quotes"
                  value={form.challengeTitle}
                  onChange={(e) =>
                    updateField('challengeTitle', e.target.value)
                  }
                  onBlur={() => handleBlur('challengeTitle')}
                  aria-invalid={Boolean(errors.challengeTitle)}
                  aria-describedby={`${formId}-challengeTitle-help`}
                  className={`w-full rounded-2xl px-4 py-3.5 pr-10 text-sm sm:text-base text-[#002733] dark:text-[#F0F6F6] placeholder:text-[#002733]/40 dark:placeholder:text-[#CBE0E0]/45 neo-inset ${
                    errors.challengeTitle
                      ? 'neo-inset-error'
                      : isFieldValid('challengeTitle')
                        ? 'neo-inset-valid'
                        : ''
                  }`}
                />
                {isFieldValid('challengeTitle') && (
                  <Check
                    className="w-4 h-4 text-[#008C82] dark:text-[#2DD4BF] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                )}
              </div>
              {errors.challengeTitle ? (
                <p
                  id={`${formId}-challengeTitle-help`}
                  role="alert"
                  className="mt-2 flex items-start gap-1.5 text-xs font-medium text-[#b42318] dark:text-[#FDA29B]"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{errors.challengeTitle}</span>
                </p>
              ) : (
                <p
                  id={`${formId}-challengeTitle-help`}
                  className="mt-2 text-xs text-[#002733]/60 dark:text-[#9FC0C0]"
                >
                  Clear summary between 10 and 100 characters.
                </p>
              )}
            </div>

            {/* Challenge Category */}
            <fieldset>
              <legend className="block text-sm font-semibold text-[#002733] dark:text-white mb-3">
                Challenge category <span className="text-[#008C82] dark:text-[#C2FE06]">*</span>
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {CHALLENGE_CATEGORIES.map((categoryOption, idx) => {
                  const selected = form.category === categoryOption;
                  const isLastOdd =
                    idx === CHALLENGE_CATEGORIES.length - 1 &&
                    CHALLENGE_CATEGORIES.length % 2 === 1;
                  return (
                    <label
                      key={categoryOption}
                      className={`relative flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium cursor-pointer transition-all min-h-[48px] ${
                        isLastOdd ? 'sm:col-span-2' : ''
                      } ${
                        selected
                          ? 'btn-neo-active border border-[#008C82]/50 dark:border-[#00C4B4]/70 text-[#002733] dark:text-white'
                          : 'btn-neo text-[#002733]/85 dark:text-[#D5E6E6]'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`${formId}-category`}
                        value={categoryOption}
                        checked={selected}
                        onChange={() =>
                          updateField('category', categoryOption, true)
                        }
                        className="sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                          selected
                            ? 'border-[#008C82] bg-[#008C82] dark:border-[#00C4B4] dark:bg-[#008C82]'
                            : 'border-[#002733]/30 dark:border-white/30 bg-[#F0F6F6] dark:bg-[#03131A]'
                        }`}
                      >
                        {selected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C2FE06]" />
                        )}
                      </span>
                      <span className="leading-snug">
                        {CATEGORY_LABELS[categoryOption]}
                      </span>
                    </label>
                  );
                })}
              </div>
              {errors.category && (
                <p
                  role="alert"
                  className="mt-2 flex items-start gap-1.5 text-xs font-medium text-[#b42318] dark:text-[#FDA29B]"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{errors.category}</span>
                </p>
              )}
            </fieldset>

            {/* Underlying Problem to Solve */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <label
                  htmlFor={`${formId}-problemDescription`}
                  className="block text-sm font-semibold text-[#002733] dark:text-white"
                >
                  Underlying problem to solve <span className="text-[#008C82] dark:text-[#C2FE06]">*</span>
                </label>
                <span
                  className={`font-mono-tabular text-xs font-semibold ${
                    cleanProblemLength >= FIELD_LIMITS.problemDescriptionMin
                      ? 'text-[#008C82] dark:text-[#2DD4BF]'
                      : 'text-[#002733]/65 dark:text-[#9FC0C0]'
                  }`}
                >
                  {cleanProblemLength} / {FIELD_LIMITS.problemDescriptionMax} characters
                </span>
              </div>

              <textarea
                ref={problemTextareaRef}
                id={`${formId}-problemDescription`}
                name="problemDescription"
                rows={6}
                maxLength={FIELD_LIMITS.problemDescriptionMax}
                placeholder="Describe the current workflow, the bottleneck, its impact on hours or quality, and the outcome you hope to validate with AI..."
                value={form.problemDescription}
                onChange={(e) =>
                  updateField('problemDescription', e.target.value)
                }
                onBlur={() => handleBlur('problemDescription')}
                aria-invalid={Boolean(errors.problemDescription)}
                aria-describedby={`${formId}-problemDescription-help`}
                className={`w-full rounded-2xl px-4 py-3.5 text-sm sm:text-base text-[#002733] dark:text-[#F0F6F6] placeholder:text-[#002733]/40 dark:placeholder:text-[#CBE0E0]/45 neo-inset leading-relaxed resize-y min-h-[150px] ${
                  errors.problemDescription
                    ? 'neo-inset-error'
                    : isFieldValid('problemDescription')
                      ? 'neo-inset-valid'
                      : ''
                }`}
              />

              {/* Progress bar toward 80-character minimum */}
              <div className="mt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex-1 max-w-xs h-1.5 rounded-full bg-[#002733]/10 dark:bg-white/10 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-200 ${
                      cleanProblemLength >= FIELD_LIMITS.problemDescriptionMin
                        ? 'bg-[#008C82] dark:bg-[#C2FE06]'
                        : 'bg-[#002733]/40 dark:bg-white/40'
                    }`}
                    style={{ width: `${problemProgressPct}%` }}
                  />
                </div>
                <span className="text-xs text-[#002733]/65 dark:text-[#9FC0C0]">
                  {cleanProblemLength >= FIELD_LIMITS.problemDescriptionMin
                    ? 'Minimum length reached (80+ characters)'
                    : `Minimum required: ${FIELD_LIMITS.problemDescriptionMin} characters`}
                </span>
              </div>

              {errors.problemDescription && (
                <p
                  id={`${formId}-problemDescription-help`}
                  role="alert"
                  className="mt-2 flex items-start gap-1.5 text-xs font-medium text-[#b42318] dark:text-[#FDA29B]"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{errors.problemDescription}</span>
                </p>
              )}
            </div>

            {/* Participation Format */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <fieldset>
                <legend className="block text-sm font-semibold text-[#002733] dark:text-white mb-3">
                  Participation format <span className="text-[#008C82] dark:text-[#C2FE06]">*</span>
                </legend>
                <div className="grid grid-cols-2 gap-3">
                  {(['Individual', 'En equipo'] as const).map((mode) => {
                    const active = form.modality === mode;
                    const Icon = mode === 'Individual' ? User : Users;
                    return (
                      <label
                        key={mode}
                        className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold cursor-pointer min-h-[48px] transition-all ${
                          active
                            ? 'btn-neo-active border border-[#008C82]/50 dark:border-[#00C4B4]/70 text-[#002733] dark:text-white'
                            : 'btn-neo text-[#002733]/80 dark:text-[#D5E6E6]'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`${formId}-modality`}
                          value={mode}
                          checked={active}
                          onChange={() => updateField('modality', mode, true)}
                          className="sr-only"
                        />
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            active
                              ? 'text-[#008C82] dark:text-[#C2FE06]'
                              : 'text-[#002733]/60 dark:text-[#9FC0C0]'
                          }`}
                          aria-hidden="true"
                        />
                        <span className="whitespace-nowrap">
                          {MODALITY_LABELS[mode]}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {form.modality === 'En equipo' && (
                <div>
                  <label
                    htmlFor={`${formId}-teammates`}
                    className="block text-sm font-semibold text-[#002733] dark:text-white mb-2"
                  >
                    Team members (optional)
                  </label>
                  <input
                    id={`${formId}-teammates`}
                    name="teammates"
                    type="text"
                    maxLength={FIELD_LIMITS.teammatesMax}
                    placeholder="e.g. Ana Lopez, Roberto Diaz"
                    value={form.teammates}
                    onChange={(e) => updateField('teammates', e.target.value)}
                    onBlur={() => handleBlur('teammates')}
                    aria-invalid={Boolean(errors.teammates)}
                    aria-describedby={
                      errors.teammates ? `${formId}-teammates-error` : undefined
                    }
                    className={`w-full rounded-2xl px-4 py-3.5 text-sm sm:text-base text-[#002733] dark:text-[#F0F6F6] placeholder:text-[#002733]/40 dark:placeholder:text-[#CBE0E0]/45 neo-inset ${
                      errors.teammates ? 'neo-inset-error' : ''
                    }`}
                  />
                  {errors.teammates ? (
                    <p
                      id={`${formId}-teammates-error`}
                      role="alert"
                      className="mt-2 flex items-start gap-1.5 text-xs font-medium text-[#b42318] dark:text-[#FDA29B]"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{errors.teammates}</span>
                    </p>
                  ) : (
                    <p className="mt-2 text-xs text-[#002733]/60 dark:text-[#9FC0C0]">
                      Include up to 300 characters with your teammates&apos; names.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Attendance commitment */}
            <div className="neo-inset rounded-2xl p-5">
              <label
                htmlFor={`${formId}-commitment`}
                className="flex items-start gap-3.5 cursor-pointer"
              >
                <input
                  id={`${formId}-commitment`}
                  name="commitmentAccepted"
                  type="checkbox"
                  checked={form.commitmentAccepted}
                  onChange={(e) =>
                    updateField('commitmentAccepted', e.target.checked, true)
                  }
                  aria-invalid={Boolean(errors.commitmentAccepted)}
                  aria-describedby={
                    errors.commitmentAccepted
                      ? `${formId}-commitment-error`
                      : undefined
                  }
                  className="mt-0.5 w-5 h-5 rounded accent-[#008C82] cursor-pointer shrink-0"
                />
                <span className="text-sm text-[#002733] dark:text-[#E6F2F2] leading-relaxed">
                  <strong className="font-semibold text-[#002733] dark:text-white">
                    I confirm my commitment to attend
                  </strong>{' '}
                  the hands-on <strong className="font-semibold text-[#002733] dark:text-white">IA Labs · January</strong> sessions at Procurement Academy to develop and validate this challenge.
                </span>
              </label>

              {errors.commitmentAccepted && (
                <p
                  id={`${formId}-commitment-error`}
                  role="alert"
                  className="mt-2.5 flex items-start gap-1.5 text-xs font-medium text-[#b42318] dark:text-[#FDA29B]"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{errors.commitmentAccepted}</span>
                </p>
              )}
            </div>

            {/* Submission error banner */}
            {submitError && (
              <div
                role="alert"
                className="rounded-2xl bg-[#fef2f2] dark:bg-[#2A1216] border border-[#b42318]/25 dark:border-[#F97066]/40 p-4 flex items-start gap-3 text-sm text-[#b42318] dark:text-[#FDA29B]"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Submit action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <p className="text-xs text-[#002733]/65 dark:text-[#9FC0C0] leading-relaxed">
                Upon submission, your proposal is encrypted client-side and stored in Firestore with domain validation and an official server timestamp.
              </p>

              <button
                type="submit"
                disabled={isSubmitting || cooldownSeconds > 0}
                onClick={(e) => triggerRipple(e)}
                className="btn-lime inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl text-sm sm:text-base font-bold cursor-pointer whitespace-nowrap shrink-0 min-h-[48px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                    Submitting challenge...
                  </>
                ) : cooldownSeconds > 0 ? (
                  <>
                    <Clock className="w-5 h-5" aria-hidden="true" />
                    Available in {cooldownSeconds}s
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" aria-hidden="true" />
                    Submit challenge
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
