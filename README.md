# IA Labs · Registration Portal (Procurement Academy)

**Live Demo:** [https://senndev.github.io/AI-Labs-Register/](https://senndev.github.io/AI-Labs-Register/)

---

## Overview & Purpose

The **IA Labs Registration Portal** is a static web application for **Volkswagen Procurement Academy** designed to collect and structure real operational challenge proposals for the **IA Labs · January Edition** program.

Participants submit day-to-day procurement bottlenecks—either individually or as a department team—so those cases can be evaluated and transformed into functional Artificial Intelligence prototypes during the January workshop sessions. Built for static hosting on **GitHub Pages** with direct **Firebase Firestore** persistence, the portal enforces strict validation and client-side end-to-end hybrid encryption before any sensitive payload leaves the browser.

---

## Key Features

- **Bilingual Interface (`ES | EN`)**: Instant Spanish / English header switcher persisted in `localStorage` (`ia_labs_lang`), dynamically updating navigation, 3-step problem guide, template insertion, active inline validation errors, loading splash screen, and submission receipts while keeping stored Firestore keys consistent.
- **Persistent Light & Dark Neomorphic Theme**: Header theme toggle persisted in `localStorage` (`ia_labs_theme`) with zero-flash HTML pre-hydration styling and an initial dual-theme **Splash Screen** (`#041820` / `#07222D` / `#C2FE06` / `#008C82` in Dark Mode; `#F0F6F6` / `#008C82` in Light Mode).
- **Interactive Dot-Grid Canvas Background**: Lightweight `requestAnimationFrame` full-viewport `<canvas>` layer (`pointer-events: none`) featuring smooth ambient dot drift and a green radial cursor spotlight effect that gently decays on `mouseleave`, pauses when hidden, and falls back to static dots under `prefers-reduced-motion: reduce`.
- **3-Step Operational Problem Framing Guide**: Interactive guide cards illustrating *Current Bottleneck*, *Operational Impact*, and *Expected AI Outcome* with one-click template pre-fill into the submission form.
- **Strict Input Sanitization & Validation**:
  - Real-time validation and HTML/script stripping (`sanitizeText`).
  - Corporate/authorized email domain allowlist (`@vw.com.mx`, `@proveed-vw.com.mx`, `@outlook.com`).
  - Structured department codes (`M-BI`–`M-BB`) with optional sub-area detail, character counters (`80–2000` characters for problem description), team member tracking, and anti-duplicate submission cooldown.
  - Confirmation receipt displaying an official reference folio (`IALAB-ENE-XXXXXX`) and submission summary.
- **Client-Side Hybrid Encryption**: Sensitive fields (`email` and `backgroundProblem`) are encrypted in the browser using **RSA-OAEP (2048-bit, SHA-256)** + **AES-256-GCM** before writing to Firestore.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| **UI Framework** | React 19, TypeScript |
| **Build Tool** | Vite (`base: './'` for static GitHub Pages subpaths) |
| **Styling** | Tailwind CSS v4 (`@tailwindcss/vite`, `@custom-variant dark`), custom neomorphic elevation system |
| **Icons** | `lucide-react` |
| **Database & Rules** | Firebase Firestore (`ia_labs_enero_registros`) + strict `firestore.rules` |
| **Cryptography** | Browser Web Crypto API (`crypto.subtle`) — RSA-OAEP 2048-bit + AES-256-GCM |
| **Hosting & CI/CD** | GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`) |

---

## Project Structure

```text
├── .github/workflows/deploy.yml   # GitHub Pages CI/CD build & deploy workflow
├── public/assets/                 # Official Procurement Academy logos & badges
├── src/
│   ├── components/
│   │   ├── DotGridBackground.tsx  # Full-viewport interactive canvas & spotlight
│   │   ├── ErrorBoundary.tsx      # Localized fallback UI
│   │   ├── Footer.tsx             # Institutional footer links
│   │   ├── HeroSection.tsx        # Call overview & highlights panel
│   │   ├── Navbar.tsx             # Sticky 3-zone header (ES|EN, theme, CTA)
│   │   ├── ProblemGuideSection.tsx# 3-step framing cards & template button
│   │   ├── RegistrationForm.tsx   # Validated form, cooldown & folio receipt
│   │   └── SplashScreen.tsx       # Dual-theme initial loading screen
│   ├── utils/
│   │   ├── cryptoChallenge.ts     # Client-side RSA-OAEP + AES-256-GCM encryption
│   │   ├── dotFieldMath.ts        # Grid geometry, spotlight falloff & palettes
│   │   ├── i18n.ts                # Typed Spanish / English translation dictionary
│   │   └── validation.ts          # Input sanitization, domain rules & folio logic
│   ├── App.tsx                    # Root layout, theme/language state & reveal observer
│   ├── firebase-config.ts         # Firebase initialization & Firestore submission
│   └── index.css                  # Tailwind v4 setup & Light/Dark neomorphic tokens
├── firebase-applet-config.json    # Public Firebase project configuration
├── firestore.rules                # Server-side Firestore schema & validation rules
├── index.html                     # Entry HTML with pre-paint theme/lang bootstrap
└── vite.config.ts                 # Relative-path static build configuration
```

---

## Local Setup & Build Instructions

### Prerequisites
- **Node.js 20+** and **npm**

### Install Dependencies
```bash
npm install
```

### Run Development Server
Starts Vite on `http://localhost:3000`:
```bash
npm run dev
```

### Run Unit Tests & Production Build
Run unit tests for validation, i18n dictionary parity, and dot-field math:
```bash
npx tsx --test src/utils/validation.test.ts src/utils/dotFieldMath.test.ts
```

Build the static production bundle into `./dist`:
```bash
npm run build
```

Preview the compiled `./dist` build locally:
```bash
npm run preview
```

### GitHub Pages Deployment
Pushes to `main` automatically trigger `.github/workflows/deploy.yml`, which installs dependencies, runs `npm run build`, uploads `./dist`, and deploys directly to GitHub Pages (`base: './'` ensures all assets resolve cleanly under `/AI-Labs-Register/`).

---

## Security Architecture Summary

1. **Client-Side Hybrid Encryption (`src/utils/cryptoChallenge.ts`)**:
   - Before calling Firestore `addDoc`, the browser generates an ephemeral **256-bit AES-GCM** key and random **96-bit IV** per encrypted field via the Web Crypto API (`crypto.subtle`).
   - That AES key is wrapped using the embedded **2048-bit RSA-OAEP (SHA-256)** public SPKI key (`CHALLENGE_PUBLIC_KEY_SPKI_B64`).
   - `backgroundProblem` is stored in the format `enc:v1:<wrappedKey>.<iv>.<ciphertext>`.
   - `email` is encrypted into a schema-compatible address format (`mail1-<wrappedKey>-<iv>-<ciphertext>@vw.com.mx`) so plaintext participant emails are never exposed in Firestore documents while still passing Firestore regex validation.
2. **Offline Private Key Hygiene**:
   - The corresponding RSA private decryption key (`ia-labs-private.pem`) stays **strictly offline on the administrator's local workstation** and is **never committed** to this repository or bundled into client code.
   - Because encryption happens purely on the client with the public key, unauthorized database reads cannot decrypt participant emails or operational challenge descriptions.
3. **Firestore Security Rules (`firestore.rules`)**:
   - Public client access is write-only (`allow create`) against `ia_labs_enero_registros`; reads, updates, and deletes from clients (`allow read, update, delete: if false`) are completely blocked.
   - Rules strictly validate required keys, allowed fields, character lengths, `participationType` (`individual` / `equipo`), `createdAt == request.time`, and email format patterns on the server side.
