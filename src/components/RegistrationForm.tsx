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
import { TRANSLATIONS, type Language } from '../utils/i18n';
import {
  CHALLENGE_CATEGORIES,
  COOLDOWN_STORAGE_KEY,
  DEPARTMENT_OPTIONS,
  FIELD_LIMITS,
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
  lang: Language;
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
  submittedAt: Date;
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
  lang,
  templateRequest,
}: RegistrationFormProps) {
  const formId = useId();
  const tForm = TRANSLATIONS[lang].form;
  const tReceipt = TRANSLATIONS[lang].receipt;

  const [form, setForm] = useState<RegistrationFormInput>(INITIAL_INPUT);
  const [touched, setTouched] = useState<
    Partial<Record<keyof RegistrationFormInput, boolean>>
  >({});
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitErrorKind, setSubmitErrorKind] = useState<
    'cooldown' | 'network' | null
  >(null);
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

  // Re-translate active validation errors immediately when user switches ES/EN
  useEffect(() => {
    setErrors((prevErrors) => {
      const keys = Object.keys(prevErrors) as Array<keyof ValidationErrors>;
      if (keys.length === 0) {
        return prevErrors;
      }
      const nextErrors: ValidationErrors = {};
      for (const field of keys) {
        const msg = validateField(field, form, lang);
        if (msg) {
          nextErrors[field] = msg;
        }
      }
      return nextErrors;
    });
  }, [lang, form]);

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
        const fieldError = validateField(field, next, lang);
        setErrors((prevErrors) => {
          const updated = { ...prevErrors };
          if (fieldError) {
            updated[field] = fieldError;
          } else {
            delete updated[field];
          }
          if (field === 'departmentSelect' && (forceTouch || touched.departmentDetail)) {
            const detailErr = validateField('departmentDetail', next, lang);
            if (detailErr) {
              updated.departmentDetail = detailErr;
            } else {
              delete updated.departmentDetail;
            }
          }
          if (field === 'modality') {
            const teammatesErr = validateField('teammates', next, lang);
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
    if (submitErrorKind) {
      setSubmitErrorKind(null);
    }
  };

  const handleBlur = (field: keyof RegistrationFormInput) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, form, lang);
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
        setSubmitErrorKind('cooldown');
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

    const validation = validateRegistrationForm(form, lang);
    setErrors(validation.errors);

    if (!validation.isValid) {
      focusFirstError(validation.errors);
      return;
    }

    setIsSubmitting(true);
    setSubmitErrorKind(null);

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
        submittedAt: new Date(),
      });
    } catch (error) {
      console.error('Error saving registration to Firestore:', error);
      setSubmitErrorKind('network');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterAnother = () => {
    setForm(INITIAL_INPUT);
    setTouched({});
    setErrors({});
    setSubmitErrorKind(null);
    setReceipt(null);
  };

  const isFieldValid = (field: keyof RegistrationFormInput): boolean => {
    return Boolean(touched[field]) && !errors[field];
  };

  const badgeSrc =
    theme === 'dark'
      ? './assets/Icono_App_512.png'
      : './assets/Icono_Turquesa.png';

  const submitErrorMessage =
    submitErrorKind === 'cooldown'
      ? tForm.cooldownError(cooldownSeconds)
      : submitErrorKind === 'network'
        ? tForm.submitError
        : null;

  if (receipt) {
    const formattedDate = new Intl.DateTimeFormat(tReceipt.dateLocale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(receipt.submittedAt);

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
                    {tReceipt.confirmedKicker}
                  </p>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#002733] dark:text-white">
                    {tReceipt.title}
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
                  {tReceipt.folioLabel}
                </p>
                <p
                  className="font-mono-tabular text-2xl sm:text-3xl font-bold tracking-wider text-[#C2FE06]"
                  data-testid="generated-folio"
                >
                  {receipt.folio}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs text-white/75 mb-1">
                  {tReceipt.submittedOnLabel}
                </p>
                <p className="text-sm font-medium text-white">
                  {formattedDate}
                </p>
              </div>
            </div>

            {/* Submission summary */}
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-8">
              <div className="neo-inset rounded-2xl p-4">
                <dt className="text-xs text-[#002733]/65 dark:text-[#9FC0C0] mb-1">
                  {tReceipt.applicantLabel}
                </dt>
                <dd className="font-semibold text-[#002733] dark:text-white break-words">
                  {receipt.fullName}
                </dd>
              </div>
              <div className="neo-inset rounded-2xl p-4">
                <dt className="text-xs text-[#002733]/65 dark:text-[#9FC0C0] mb-1">
                  {tReceipt.emailLabel}
                </dt>
                <dd className="font-mono-tabular text-[13px] font-medium text-[#002733] dark:text-white break-all">
                  {receipt.email}
                </dd>
              </div>
              <div className="neo-inset rounded-2xl p-4">
                <dt className="text-xs text-[#002733]/65 dark:text-[#9FC0C0] mb-1">
                  {tReceipt.deptLabel}
                </dt>
                <dd className="font-medium text-[#002733] dark:text-white break-words">
                  {receipt.department}
                </dd>
              </div>
              <div className="neo-inset rounded-2xl p-4">
                <dt className="text-xs text-[#002733]/65 dark:text-[#9FC0C0] mb-1">
                  {tReceipt.categoryModalityLabel}
                </dt>
                <dd className="font-medium text-[#002733] dark:text-white">
                  {tForm.categories[receipt.category]} · {tForm.modalities[receipt.modality]}
                </dd>
              </div>
              <div className="neo-inset rounded-2xl p-4 sm:col-span-2">
                <dt className="text-xs text-[#002733]/65 dark:text-[#9FC0C0] mb-1">
                  {tReceipt.challengeTitleLabel}
                </dt>
                <dd className="font-semibold text-[#002733] dark:text-white">
                  {receipt.challengeTitle}
                </dd>
                {receipt.teammates && (
                  <p className="mt-2 text-xs text-[#002733]/75 dark:text-[#CBE0E0]">
                    {tReceipt.teamMembersLabel}: {receipt.teammates}
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
                    {tReceipt.cooldownActive(cooldownSeconds)}
                  </span>
                ) : (
                  <span>{tReceipt.cooldownReady}</span>
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
                {tReceipt.registerAnotherBtn}
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
              {tForm.kicker}
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#002733] dark:text-white tracking-tight [text-wrap:balance]">
              {tForm.title}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#002733]/75 dark:text-[#CBE0E0] leading-relaxed max-w-2xl">
              {tForm.subtitle}
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
                  {tForm.fullNameLabel}{' '}
                  <span className="text-[#008C82] dark:text-[#C2FE06]">*</span>
                </label>
                <div className="relative">
                  <input
                    id={`${formId}-fullName`}
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    maxLength={FIELD_LIMITS.fullNameMax}
                    placeholder={tForm.fullNamePlaceholder}
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
                    {tForm.fullNameHint}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor={`${formId}-email`}
                  className="block text-sm font-semibold text-[#002733] dark:text-white mb-2"
                >
                  {tForm.emailLabel}{' '}
                  <span className="text-[#008C82] dark:text-[#C2FE06]">*</span>
                </label>
                <div className="relative">
                  <input
                    id={`${formId}-email`}
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    maxLength={FIELD_LIMITS.emailMax}
                    placeholder={tForm.emailPlaceholder}
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
                    {tForm.emailHint}
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
                  {tForm.deptLabel}{' '}
                  <span className="text-[#008C82] dark:text-[#C2FE06]">*</span>
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
                  <option value="">{tForm.deptPlaceholder}</option>
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
                    ? tForm.deptDetailOtherLabel
                    : tForm.deptDetailLabel}
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
                      ? tForm.deptDetailOtherPlaceholder
                      : tForm.deptDetailPlaceholder
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
                  {tForm.titleLabel}{' '}
                  <span className="text-[#008C82] dark:text-[#C2FE06]">*</span>
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
                  placeholder={tForm.titlePlaceholder}
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
                  {tForm.titleHint}
                </p>
              )}
            </div>

            {/* Challenge Category */}
            <fieldset>
              <legend className="block text-sm font-semibold text-[#002733] dark:text-white mb-3">
                {tForm.categoryLabel}{' '}
                <span className="text-[#008C82] dark:text-[#C2FE06]">*</span>
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
                        {tForm.categories[categoryOption]}
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
                  {tForm.problemLabel}{' '}
                  <span className="text-[#008C82] dark:text-[#C2FE06]">*</span>
                </label>
                <span
                  className={`font-mono-tabular text-xs font-semibold ${
                    cleanProblemLength >= FIELD_LIMITS.problemDescriptionMin
                      ? 'text-[#008C82] dark:text-[#2DD4BF]'
                      : 'text-[#002733]/65 dark:text-[#9FC0C0]'
                  }`}
                >
                  {cleanProblemLength} / {FIELD_LIMITS.problemDescriptionMax}{' '}
                  {tForm.charsUnit}
                </span>
              </div>

              <textarea
                ref={problemTextareaRef}
                id={`${formId}-problemDescription`}
                name="problemDescription"
                rows={6}
                maxLength={FIELD_LIMITS.problemDescriptionMax}
                placeholder={tForm.problemPlaceholder}
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
                    ? tForm.minReached
                    : tForm.minRequired(FIELD_LIMITS.problemDescriptionMin)}
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
                  {tForm.modalityLabel}{' '}
                  <span className="text-[#008C82] dark:text-[#C2FE06]">*</span>
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
                          {tForm.modalities[mode]}
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
                    {tForm.teammatesLabel}
                  </label>
                  <input
                    id={`${formId}-teammates`}
                    name="teammates"
                    type="text"
                    maxLength={FIELD_LIMITS.teammatesMax}
                    placeholder={tForm.teammatesPlaceholder}
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
                      {tForm.teammatesHint}
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
                    {tForm.commitmentBold1}
                  </strong>
                  {tForm.commitmentMid}
                  <strong className="font-semibold text-[#002733] dark:text-white">
                    {tForm.commitmentBold2}
                  </strong>
                  {tForm.commitmentEnd}
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
            {submitErrorMessage && (
              <div
                role="alert"
                className="rounded-2xl bg-[#fef2f2] dark:bg-[#2A1216] border border-[#b42318]/25 dark:border-[#F97066]/40 p-4 flex items-start gap-3 text-sm text-[#b42318] dark:text-[#FDA29B]"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{submitErrorMessage}</span>
              </div>
            )}

            {/* Submit action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <p className="text-xs text-[#002733]/65 dark:text-[#9FC0C0] leading-relaxed">
                {tForm.privacyNote}
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
                    {tForm.submittingBtn}
                  </>
                ) : cooldownSeconds > 0 ? (
                  <>
                    <Clock className="w-5 h-5" aria-hidden="true" />
                    {tForm.cooldownBtn(cooldownSeconds)}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" aria-hidden="true" />
                    {tForm.submitBtn}
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
