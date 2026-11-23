import { initializeApp } from 'firebase/app';
import {
  doc,
  getDocFromServer,
  getFirestore,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import type { ChallengeCategory, ParticipationModality } from './utils/validation';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

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
  const docId = `${payload.folio}-${Date.now().toString(36).toUpperCase()}`;
  const docPath = `${REGISTROS_COLLECTION}/${docId}`;

  try {
    await setDoc(doc(db, REGISTROS_COLLECTION, docId), {
      ...payload,
      createdAt: serverTimestamp(),
    });
    return { docId, folio: payload.folio };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}
