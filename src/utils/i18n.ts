import type { ChallengeCategory, ParticipationModality } from './validation';

export type Language = 'es' | 'en';

export const LANG_STORAGE_KEY = 'ia_labs_lang';

export function getInitialLanguage(): Language {
  try {
    const saved = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === 'en' || saved === 'es') {
      return saved;
    }
  } catch {
    // Ignore storage errors
  }
  return 'es';
}

export interface TranslationDictionary {
  meta: {
    pageTitle: string;
  };
  splash: {
    badgeAlt: string;
    kicker: string;
    title: string;
    status: string;
  };
  nav: {
    homeAria: string;
    primaryNavAria: string;
    overview: string;
    guide: string;
    registration: string;
    switchToLight: string;
    switchToDark: string;
    lightLabel: string;
    darkLabel: string;
    langGroupAria: string;
    cta: string;
  };
  hero: {
    edition: string;
    title: string;
    descPart1: string;
    descLabs: string;
    descPart2: string;
    descAcademy: string;
    descPart3: string;
    ctaPrimary: string;
    ctaSecondary: string;
    openCall: string;
    labTitle: string;
    highlights: Array<{
      title: string;
      description: string;
    }>;
    domainsPrefix: string;
    domainsAnd: string;
    domainsSuffix: string;
  };
  guide: {
    kicker: string;
    title: string;
    subtitlePart1: string;
    subtitleLabs: string;
    subtitlePart2: string;
    useTemplateBtn: string;
    templateText: string;
    cards: Array<{
      step: string;
      title: string;
      description: string;
      example: string;
    }>;
  };
  form: {
    kicker: string;
    title: string;
    subtitle: string;
    fullNameLabel: string;
    fullNamePlaceholder: string;
    fullNameHint: string;
    emailLabel: string;
    emailPlaceholder: string;
    emailHint: string;
    deptLabel: string;
    deptPlaceholder: string;
    deptDetailLabel: string;
    deptDetailOtherLabel: string;
    deptDetailPlaceholder: string;
    deptDetailOtherPlaceholder: string;
    titleLabel: string;
    titlePlaceholder: string;
    titleHint: string;
    categoryLabel: string;
    categories: Record<ChallengeCategory, string>;
    problemLabel: string;
    problemPlaceholder: string;
    charsUnit: string;
    minReached: string;
    minRequired: (min: number) => string;
    modalityLabel: string;
    modalities: Record<ParticipationModality, string>;
    teammatesLabel: string;
    teammatesPlaceholder: string;
    teammatesHint: string;
    commitmentBold1: string;
    commitmentMid: string;
    commitmentBold2: string;
    commitmentEnd: string;
    privacyNote: string;
    submitBtn: string;
    submittingBtn: string;
    cooldownBtn: (seconds: number) => string;
    cooldownError: (seconds: number) => string;
    submitError: string;
  };
  receipt: {
    confirmedKicker: string;
    title: string;
    folioLabel: string;
    submittedOnLabel: string;
    applicantLabel: string;
    emailLabel: string;
    deptLabel: string;
    categoryModalityLabel: string;
    challengeTitleLabel: string;
    teamMembersLabel: string;
    cooldownActive: (seconds: number) => string;
    cooldownReady: string;
    registerAnotherBtn: string;
    dateLocale: string;
  };
  footer: {
    navAria: string;
    overview: string;
    guide: string;
    registration: string;
    copyright: string;
  };
  errorBoundary: {
    title: string;
    description: string;
    retryBtn: string;
  };
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  es: {
    meta: {
      pageTitle: 'IA Labs · Edición Enero — Procurement Academy',
    },
    splash: {
      badgeAlt: 'Insignia de Procurement Academy IA Labs',
      kicker: 'Procurement Academy',
      title: 'IA Labs · Edición Enero',
      status: 'Preparando entorno de postulación...',
    },
    nav: {
      homeAria: 'Inicio de Procurement Academy IA Labs',
      primaryNavAria: 'Navegación principal',
      overview: 'Convocatoria',
      guide: 'Cómo plantearlo',
      registration: 'Postulación',
      switchToLight: 'Cambiar a modo claro',
      switchToDark: 'Cambiar a modo oscuro',
      lightLabel: 'Claro',
      darkLabel: 'Oscuro',
      langGroupAria: 'Seleccionar idioma',
      cta: 'Postular reto',
    },
    hero: {
      edition: 'Edición Enero',
      title: 'Postula un problema real de compras y prototipa su solución con IA.',
      descPart1: 'En las sesiones prácticas de ',
      descLabs: 'IA Labs · Enero',
      descPart2: ' de ',
      descAcademy: 'Procurement Academy',
      descPart3:
        ', trabajaremos sobre retos reales de tu operación diaria para diseñar y validar prototipos funcionales con Inteligencia Artificial.',
      ctaPrimary: 'Postular mi reto',
      ctaSecondary: 'Cómo plantear el problema',
      openCall: 'Convocatoria Abierta',
      labTitle: 'IA Labs · Enero',
      highlights: [
        {
          title: 'Sesiones prácticas en enero',
          description:
            'Acompañamiento guiado para pasar del cuello de botella al prototipo.',
        },
        {
          title: 'Individual o en equipo',
          description:
            'Postula un caso propio o colabora con compañeros de tu gerencia.',
        },
        {
          title: 'Sin requisitos previos de código',
          description:
            'Lo esencial es la claridad del problema de negocio y su impacto.',
        },
      ],
      domainsPrefix: 'Registro habilitado para dominios ',
      domainsAnd: ' y ',
      domainsSuffix: '.',
    },
    guide: {
      kicker: 'Guía de postulación',
      title: '¿Cómo plantear tu problema de fondo?',
      subtitlePart1: 'Los mejores casos de ',
      subtitleLabs: 'IA Labs',
      subtitlePart2:
        ' parten de un dolor operativo bien definido, no de una tecnología específica. Estructura tu propuesta con estos tres elementos:',
      useTemplateBtn: 'Usar estructura en el formulario',
      templateText: `1. Proceso o cuello de botella actual:
Describe paso a paso qué tarea o flujo genera retrasos o trabajo manual hoy.

2. Impacto en tiempo, calidad u operación:
Indica cuántas horas toma, con qué frecuencia ocurre y qué errores o riesgos provoca.

3. Resultado esperado:
Explica qué te gustaría lograr o validar en las sesiones de IA Labs en enero.`,
      cards: [
        {
          step: '01.',
          title: 'Proceso o cuello de botella actual',
          description:
            'Describe qué actividad repetitiva, captura manual o espera de validación frena hoy tu flujo de trabajo.',
          example:
            'Ejemplo: “Cada semana consolidamos manualmente 12 hojas de cálculo con cotizaciones RFQ en distintos formatos antes de comparar ofertas.”',
        },
        {
          step: '02.',
          title: 'Impacto en tiempo, calidad u operación',
          description:
            'Cuantifica o explica qué costo operativo tiene el problema: horas invertidas, retrabajos o demoras en respuesta.',
          example:
            'Ejemplo: “Toma 6 horas semanales por comprador y genera omisiones en vigencias de precios o cláusulas de entrega.”',
        },
        {
          step: '03.',
          title: 'Resultado esperado con IA',
          description:
            'Indica qué entregable o mejora concreta esperas validar durante las sesiones de enero, sin preocuparte por la herramienta técnica.',
          example:
            'Ejemplo: “Un prototipo que lea las cotizaciones y genere automáticamente una tabla comparativa con alertas de desviación.”',
        },
      ],
    },
    form: {
      kicker: 'Formulario de inscripción',
      title: 'Postula tu reto para IA Labs · Enero',
      subtitle:
        'Completa los campos con la descripción de tu problema operativo. Todas las postulaciones se cifran en el navegador y se guardan de forma privada.',
      fullNameLabel: 'Nombre completo',
      fullNamePlaceholder: 'Ej. Laura Hernández Vázquez',
      fullNameHint: 'Mínimo 5 caracteres, solo letras y espacios.',
      emailLabel: 'Correo electrónico autorizado',
      emailPlaceholder: 'nombre.apellido@vw.com.mx',
      emailHint:
        'Acepta únicamente @vw.com.mx, @proveed-vw.com.mx o @outlook.com.',
      deptLabel: 'Gerencia / Área',
      deptPlaceholder: 'Selecciona tu área...',
      deptDetailLabel: 'Subárea o célula (opcional)',
      deptDetailOtherLabel: 'Especifica tu gerencia o área',
      deptDetailPlaceholder: 'Ej. Célula Eléctricos / CapEx Planta',
      deptDetailOtherPlaceholder: 'Nombre de tu gerencia o departamento',
      titleLabel: 'Título del reto',
      titlePlaceholder:
        'Ej. Comparativa automática de cotizaciones RFQ de proveedores',
      titleHint: 'Resumen claro entre 10 y 100 caracteres.',
      categoryLabel: 'Categoría del reto',
      categories: {
        'Automatización de tareas repetitivas':
          'Automatización de tareas repetitivas',
        'Análisis y cruce de datos': 'Análisis y cruce de datos',
        'Gestión documental / reportes': 'Gestión documental / reportes',
        'Asistente de consulta / conocimiento':
          'Asistente de consulta / conocimiento',
        Otro: 'Otro',
      },
      problemLabel: 'Problema de fondo a resolver',
      problemPlaceholder:
        'Describe el flujo actual, el cuello de botella, su impacto en horas o calidad y qué resultado esperas validar con IA...',
      charsUnit: 'caracteres',
      minReached: 'Longitud mínima alcanzada (80+ caracteres)',
      minRequired: (min) => `Mínimo requerido: ${min} caracteres`,
      modalityLabel: 'Modalidad de participación',
      modalities: {
        Individual: 'Individual',
        'En equipo': 'En equipo',
      },
      teammatesLabel: 'Compañeros de equipo (opcional)',
      teammatesPlaceholder: 'Ej. Ana López, Roberto Díaz',
      teammatesHint:
        'Puedes incluir hasta 300 caracteres con los nombres de tu equipo.',
      commitmentBold1: 'Confirmo mi compromiso de asistencia',
      commitmentMid: ' a las sesiones prácticas de ',
      commitmentBold2: 'IA Labs · Enero',
      commitmentEnd:
        ' de Procurement Academy para desarrollar y validar este reto.',
      privacyNote:
        'Al enviar, tu registro se cifra en el cliente y se guarda directamente en Firestore con validación de dominio y sello de tiempo oficial.',
      submitBtn: 'Enviar postulación',
      submittingBtn: 'Registrando postulación...',
      cooldownBtn: (s) => `Disponible en ${s}s`,
      cooldownError: (s) =>
        `Por protección contra envíos duplicados, espera ${s} segundos antes de registrar otro caso.`,
      submitError:
        'No fue posible completar el registro en este momento. Verifica tu conexión e intenta nuevamente.',
    },
    receipt: {
      confirmedKicker: 'Registro confirmado · IA Labs Enero',
      title: 'Postulación recibida',
      folioLabel: 'Folio de seguimiento',
      submittedOnLabel: 'Fecha de registro',
      applicantLabel: 'Postulante',
      emailLabel: 'Correo autorizado',
      deptLabel: 'Gerencia / Área',
      categoryModalityLabel: 'Categoría y Modalidad',
      challengeTitleLabel: 'Título del reto',
      teamMembersLabel: 'Equipo',
      cooldownActive: (s) =>
        `Protección anti-duplicados activa (${s}s para nuevo envío)`,
      cooldownReady: 'Listo para registrar un nuevo reto si lo necesitas.',
      registerAnotherBtn: 'Registrar otro caso',
      dateLocale: 'es-MX',
    },
    footer: {
      navAria: 'Enlaces institucionales',
      overview: 'Convocatoria',
      guide: 'Cómo plantearlo',
      registration: 'Postulación',
      copyright: 'Procurement AI Academy · IA Labs Edición Enero',
    },
    errorBoundary: {
      title: 'No fue posible cargar la vista',
      description:
        'Se detectó una interrupción temporal al procesar la aplicación. Puedes intentar recargar la vista actual.',
      retryBtn: 'Reintentar',
    },
  },
  en: {
    meta: {
      pageTitle: 'IA Labs · January Edition — Procurement Academy',
    },
    splash: {
      badgeAlt: 'Procurement Academy IA Labs Badge',
      kicker: 'Procurement Academy',
      title: 'IA Labs · January Edition',
      status: 'Preparing registration portal...',
    },
    nav: {
      homeAria: 'Procurement Academy IA Labs home',
      primaryNavAria: 'Primary navigation',
      overview: 'Overview',
      guide: 'Problem Guide',
      registration: 'Registration',
      switchToLight: 'Switch to light mode',
      switchToDark: 'Switch to dark mode',
      lightLabel: 'Light',
      darkLabel: 'Dark',
      langGroupAria: 'Select language',
      cta: 'Submit challenge',
    },
    hero: {
      edition: 'January Edition',
      title: 'Submit a real procurement problem and prototype its AI solution.',
      descPart1: 'During the hands-on ',
      descLabs: 'IA Labs · January',
      descPart2: ' sessions at ',
      descAcademy: 'Procurement Academy',
      descPart3:
        ', we will work directly on real day-to-day operational bottlenecks to design and validate practical Artificial Intelligence prototypes.',
      ctaPrimary: 'Submit my challenge',
      ctaSecondary: 'How to frame your problem',
      openCall: 'Open Call',
      labTitle: 'IA Labs · January',
      highlights: [
        {
          title: 'Hands-on sessions in January',
          description:
            'Guided coaching to move from an operational bottleneck to a working prototype.',
        },
        {
          title: 'Individual or team format',
          description:
            'Submit a solo initiative or collaborate with colleagues from your department.',
        },
        {
          title: 'No prior coding required',
          description:
            'What matters most is clearly articulating the business pain point and its impact.',
        },
      ],
      domainsPrefix: 'Registration open for ',
      domainsAnd: ', and ',
      domainsSuffix: ' addresses.',
    },
    guide: {
      kicker: 'Submission Guide',
      title: 'How should you frame your underlying problem?',
      subtitlePart1: 'The strongest ',
      subtitleLabs: 'IA Labs',
      subtitlePart2:
        ' cases start with a clearly defined operational pain point rather than a specific tool. Structure your proposal around these three elements:',
      useTemplateBtn: 'Use template in form',
      templateText: `1. Current workflow or bottleneck:
Describe step by step which task or handoff causes delays or manual rework today.

2. Time, quality, or operational impact:
Indicate how many hours it takes, how often it happens, and what errors or risks it creates.

3. Expected outcome:
Explain what you want to achieve or validate during the January IA Labs sessions.`,
      cards: [
        {
          step: '01.',
          title: 'Current workflow or bottleneck',
          description:
            'Describe which repetitive task, manual data entry, or approval delay slows down your daily workflow.',
          example:
            'Example: “Every Monday we manually consolidate 12 RFQ spreadsheets in different supplier layouts before we can compare pricing.”',
        },
        {
          step: '02.',
          title: 'Time, quality, or operational impact',
          description:
            'Quantify or explain the operational cost of the problem: hours spent, rework cycles, or delayed supplier responses.',
          example:
            'Example: “It takes 6 hours per buyer each week and leads to missed price validity dates or delivery terms.”',
        },
        {
          step: '03.',
          title: 'Expected AI outcome',
          description:
            'Define the concrete deliverable or improvement you want to validate during the January sessions, without worrying about the technical stack.',
          example:
            'Example: “A prototype that reads incoming quotes and automatically builds a comparison matrix flagging deviations.”',
        },
      ],
    },
    form: {
      kicker: 'Registration Form',
      title: 'Submit your challenge for IA Labs · January',
      subtitle:
        'Complete the fields below with a clear description of your operational problem. All submissions are encrypted client-side and stored privately.',
      fullNameLabel: 'Full name',
      fullNamePlaceholder: 'e.g. Laura Hernandez Vazquez',
      fullNameHint: 'Minimum 5 characters, letters and spaces only.',
      emailLabel: 'Authorized email address',
      emailPlaceholder: 'first.last@vw.com.mx',
      emailHint:
        'Accepts @vw.com.mx, @proveed-vw.com.mx, or @outlook.com only.',
      deptLabel: 'Department / Area',
      deptPlaceholder: 'Select your department...',
      deptDetailLabel: 'Sub-area or team cell (optional)',
      deptDetailOtherLabel: 'Specify your department or area',
      deptDetailPlaceholder: 'e.g. Powertrain / Plant CapEx',
      deptDetailOtherPlaceholder: 'Name of your department or unit',
      titleLabel: 'Challenge title',
      titlePlaceholder: 'e.g. Automated comparison of supplier RFQ quotes',
      titleHint: 'Clear summary between 10 and 100 characters.',
      categoryLabel: 'Challenge category',
      categories: {
        'Automatización de tareas repetitivas': 'Repetitive task automation',
        'Análisis y cruce de datos': 'Data analysis & cross-referencing',
        'Gestión documental / reportes': 'Document management & reporting',
        'Asistente de consulta / conocimiento': 'Knowledge & query assistant',
        Otro: 'Other',
      },
      problemLabel: 'Underlying problem to solve',
      problemPlaceholder:
        'Describe the current workflow, the bottleneck, its impact on hours or quality, and the outcome you hope to validate with AI...',
      charsUnit: 'characters',
      minReached: 'Minimum length reached (80+ characters)',
      minRequired: (min) => `Minimum required: ${min} characters`,
      modalityLabel: 'Participation format',
      modalities: {
        Individual: 'Individual',
        'En equipo': 'Team',
      },
      teammatesLabel: 'Team members (optional)',
      teammatesPlaceholder: 'e.g. Ana Lopez, Roberto Diaz',
      teammatesHint:
        'Include up to 300 characters with your teammates’ names.',
      commitmentBold1: 'I confirm my commitment to attend',
      commitmentMid: ' the hands-on ',
      commitmentBold2: 'IA Labs · January',
      commitmentEnd:
        ' sessions at Procurement Academy to develop and validate this challenge.',
      privacyNote:
        'Upon submission, your proposal is encrypted client-side and stored in Firestore with domain validation and an official server timestamp.',
      submitBtn: 'Submit challenge',
      submittingBtn: 'Submitting challenge...',
      cooldownBtn: (s) => `Available in ${s}s`,
      cooldownError: (s) =>
        `To prevent duplicate submissions, please wait ${s} seconds before submitting another challenge.`,
      submitError:
        'We could not complete your registration right now. Please check your connection and try again.',
    },
    receipt: {
      confirmedKicker: 'Registration confirmed · IA Labs January',
      title: 'Submission received',
      folioLabel: 'Reference folio',
      submittedOnLabel: 'Submitted on',
      applicantLabel: 'Applicant',
      emailLabel: 'Authorized email',
      deptLabel: 'Department / Area',
      categoryModalityLabel: 'Category & Format',
      challengeTitleLabel: 'Challenge title',
      teamMembersLabel: 'Team members',
      cooldownActive: (s) =>
        `Duplicate protection active (${s}s until next submission)`,
      cooldownReady: 'Ready to submit another challenge if needed.',
      registerAnotherBtn: 'Submit another challenge',
      dateLocale: 'en-US',
    },
    footer: {
      navAria: 'Institutional links',
      overview: 'Overview',
      guide: 'Problem Guide',
      registration: 'Registration',
      copyright: 'Procurement AI Academy · IA Labs January Edition',
    },
    errorBoundary: {
      title: 'Unable to load view',
      description:
        'A temporary interruption occurred while rendering the application. You can try reloading the current view.',
      retryBtn: 'Try again',
    },
  },
};
