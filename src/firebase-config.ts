import { initializeApp } from 'firebase/app';
import {
  doc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
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

export interface ChallengeRegistrationPayload {
  folio: string;
  fullName: string;
  email: string;
  department: string;
  challengeTitle: string;
  problemDescription: string;
  category: ChallengeCategory;
  modality: ParticipationModality;
  teammates: string;
  commitmentAccepted: boolean;
  edition: 'IA Labs - Enero';
}

export async function submitChallengeRegistration(
  payload: ChallengeRegistrationPayload
): Promise<{ docId: string; folio: string }> {
  const normalizedPayload: ChallengeRegistrationPayload = {
    folio: payload.folio.trim().toUpperCase(),
    fullName: payload.fullName.trim(),
    email: payload.email.trim().toLowerCase(),
    department: payload.department.trim(),
    challengeTitle: payload.challengeTitle.trim(),
    problemDescription: payload.problemDescription.trim(),
    category: payload.category,
    modality: payload.modality,
    teammates: payload.modality === 'Individual' ? '' : payload.teammates.trim(),
    commitmentAccepted: payload.commitmentAccepted,
    edition: 'IA Labs - Enero',
  };

  // El ID del documento usa el folio (ej. IALAB-ENE-A1B2C3) para cumplir isValidId() en firestore.rules
  const docId = normalizedPayload.folio;
  const docPath = `${REGISTROS_COLLECTION}/${docId}`;

  try {
    await setDoc(doc(db, REGISTROS_COLLECTION, docId), {
      ...normalizedPayload,
      createdAt: serverTimestamp(),
    });
    return { docId, folio: normalizedPayload.folio };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}
