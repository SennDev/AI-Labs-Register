import { initializeApp } from 'firebase/app';
import {
  addDoc,
  collection,
  doc,
  getDocFromServer,
  getFirestore,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import {
  encryptBackgroundProblem,
  encryptEmailAddress,
} from './utils/cryptoChallenge';
import type { ChallengeCategory, ParticipationModality } from './utils/validation';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const REGISTROS_COLLECTION = 'ia_labs_enero_registros';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo: Array<{
      providerId?: string | null;
      email?: string | null;
    }>;
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('the client is offline')
    ) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

export interface ChallengeRegistrationInput {
  folio?: string;
  fullName?: string;
  email?: string;
  department?: string;
  challengeTitle?: string;
  backgroundProblem?: string;
  problemDescription?: string;
  category?: ChallengeCategory | string;
  participationType?: ParticipationModality | string;
  modality?: ParticipationModality | string;
  teamMembers?: string;
  teammates?: string;
}

const safeTrim = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';

export async function submitChallengeRegistration(
  input: ChallengeRegistrationInput
): Promise<{ docId: string; folio: string }> {
  const safeInput = input ?? {};
  const folio = safeTrim(safeInput.folio).toUpperCase();

  const rawModality = safeTrim(
    safeInput.participationType ?? safeInput.modality
  ).toLowerCase();

  const normalizedParticipationType: 'individual' | 'equipo' =
    rawModality === 'equipo' || rawModality === 'en equipo'
      ? 'equipo'
      : 'individual';

  const rawEmail = safeTrim(safeInput.email).toLowerCase().slice(0, 120);
  const encryptedEmail = await encryptEmailAddress(rawEmail);

  const rawProblem = safeTrim(
    safeInput.backgroundProblem ?? safeInput.problemDescription
  ).slice(0, 2000);
  const encryptedBackgroundProblem = await encryptBackgroundProblem(rawProblem);

  const rawTeamMembers = safeTrim(
    safeInput.teamMembers ?? safeInput.teammates
  );

  const cleanTeamMembers =
    normalizedParticipationType === 'individual'
      ? ''
      : rawTeamMembers.slice(0, 300);

  const firestoreDoc: Record<string, unknown> = {
    fullName: safeTrim(safeInput.fullName).slice(0, 100),
    email: encryptedEmail,
    department: safeTrim(safeInput.department).slice(0, 100),
    challengeTitle: safeTrim(safeInput.challengeTitle).slice(0, 120),
    backgroundProblem: encryptedBackgroundProblem,
    category: safeTrim(safeInput.category).slice(0, 80),
    participationType: normalizedParticipationType,
    createdAt: serverTimestamp(),
  };

  if (cleanTeamMembers.length > 0) {
    firestoreDoc.teamMembers = cleanTeamMembers;
  }

  try {
    const docRef = await addDoc(collection(db, REGISTROS_COLLECTION), firestoreDoc);
    return {
      docId: docRef.id,
      folio: folio || docRef.id.slice(0, 8).toUpperCase(),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, REGISTROS_COLLECTION);
  }
}
