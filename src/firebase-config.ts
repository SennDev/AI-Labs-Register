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
  fullName: string;
  email: string;
  department: string;
  challengeTitle: string;
  backgroundProblem: string;
  category: ChallengeCategory;
  participationType: ParticipationModality;
  teamMembers?: string;
}

export async function submitChallengeRegistration(
  input: ChallengeRegistrationInput
): Promise<{ docId: string; folio: string }> {
  const folio = (input.folio ?? '').trim().toUpperCase();
  const normalizedParticipationType: 'individual' | 'equipo' =
    input.participationType === 'equipo' ||
    String(input.participationType).toLowerCase() === 'en equipo' ||
    String(input.participationType).toLowerCase() === 'equipo'
      ? 'equipo'
      : 'individual';

  const cleanTeamMembers =
    normalizedParticipationType === 'individual'
      ? ''
      : (input.teamMembers ?? '').trim().slice(0, 300);

  // Construimos el objeto con EXACTAMENTE los campos permitidos por hasAll / hasOnly en firestore.rules
  const firestoreDoc: Record<string, unknown> = {
    fullName: input.fullName.trim().slice(0, 100),
    email: input.email.trim().toLowerCase().slice(0, 120),
    department: input.department.trim().slice(0, 100),
    challengeTitle: input.challengeTitle.trim().slice(0, 120),
    backgroundProblem: input.backgroundProblem.trim().slice(0, 2000),
    category: input.category.trim().slice(0, 80),
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
