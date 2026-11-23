// Clave pública RSA-OAEP (SHA-256) en formato SPKI Base64.
// La clave privada correspondiente (ia-labs-private.pem) permanece ÚNICAMENTE en tu PC local.
export const CHALLENGE_PUBLIC_KEY_SPKI_B64 =
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0JaG1f5KX6xOLV7GHtqaUNKk+/FjAXRB8IPybNB2SXHcte8XhAK7xeLVmfTsanH1h0khAefwB4F6R2p+dDNsFqjrOHlnbc5v4oPhz1Yn78tMvP4JuCJrn+k2PkXSmBpCqW4kJZAew0yEDJW8px1OG92M4mssYuXNxpon5vxedaTv9w4V7oz654mZfOSCk+Fr9syzKLXEWTR/h3NnJ7S/aRP8h6ULzBYDUPGObj8nC51k+YtdOL/+jKY13IJzQzhTNqV7czIv651MuQ94Heak8L+SM5C+fMjB7q0inmPYOSf6yw2002Wx/3UynvFcFBj2wphPGtC7IvweVY5LcXg6yQIDAQAB';

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const clean = b64.replace(/\s+/g, '');
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function importPublicKey(): Promise<CryptoKey> {
  const spkiBytes = base64ToBytes(CHALLENGE_PUBLIC_KEY_SPKI_B64);
  const buffer = spkiBytes.buffer.slice(
    spkiBytes.byteOffset,
    spkiBytes.byteOffset + spkiBytes.byteLength
  );

  return crypto.subtle.importKey(
    'spki',
    buffer,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt']
  );
}

/**
 * Cifra la descripción del reto con AES-GCM (256 bits) y envuelve la llave AES
 * con RSA-OAEP usando la clave pública configurada.
 */
export async function encryptBackgroundProblem(plainText: string): Promise<string> {
  if (!CHALLENGE_PUBLIC_KEY_SPKI_B64) {
    throw new Error('Falta configurar CHALLENGE_PUBLIC_KEY_SPKI_B64 en src/utils/cryptoChallenge.ts.');
  }

  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(plainText);

  const aesKey = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    dataBytes
  );

  const rawAesKey = await crypto.subtle.exportKey('raw', aesKey);
  const rsaPublicKey = await importPublicKey();
  const wrappedKeyBuffer = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    rsaPublicKey,
    rawAesKey
  );

  const wrappedB64 = bytesToBase64(new Uint8Array(wrappedKeyBuffer));
  const ivB64 = bytesToBase64(iv);
  const cipherB64 = bytesToBase64(new Uint8Array(cipherBuffer));

  return `enc:v1:${wrappedB64}.${ivB64}.${cipherB64}`;
}

function bytesToBase64UrlSafe(bytes: Uint8Array): string {
  return bytesToBase64(bytes)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

/**
 * Cifra el correo con AES-GCM (128 bits) envolviendo la clave AES con RSA-OAEP
 * y lo formatea como un correo sintácticamente válido (@vw.com.mx) para cumplir
 * con la regex de Firestore sin exponer el correo real en claro.
 */
export async function encryptEmailAddress(plainEmail: string): Promise<string> {
  const cleanEmail = plainEmail.trim().toLowerCase();
  if (!cleanEmail) {
    return '';
  }

  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(cleanEmail);

  const aesKey = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 128 },
    true,
    ['encrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    dataBytes
  );

  const rawAesKey = await crypto.subtle.exportKey('raw', aesKey);
  const rsaPublicKey = await importPublicKey();
  const wrappedKeyBuffer = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    rsaPublicKey,
    rawAesKey
  );

  // RSA-2048 produce 256 bytes envueltos; si excede los 120 chars de Firestore en el campo `email`,
  // puedes guardar el correo cifrado también aquí o en un campo si ajustas reglas.
  // Si usas clave RSA-2048, el bloque RSA cifrado mide 256 bytes (~342 chars en base64).
  const wrappedPart = bytesToBase64UrlSafe(new Uint8Array(wrappedKeyBuffer));
  const ivPart = bytesToBase64UrlSafe(iv);
  const cipherPart = bytesToBase64UrlSafe(new Uint8Array(cipherBuffer));

  return `enc1-${wrappedPart}-${ivPart}-${cipherPart}@vw.com.mx`;
}
