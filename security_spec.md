# Security Specification — IA Labs · Edición Enero

## 1. Data Invariants
- All submitted challenges in `/ia_labs_enero_registros/{registroId}` are strictly confidential business problems and PII (`fullName`, `email`, `teammates`).
- Public `get`, `list`, `update`, and `delete` operations are unconditionally denied (`if false;`) to prevent scraping, enumeration, or tampering.
- Document creation (`create`) is permitted only when all 12 exact fields are present (`hasAll` + `hasOnly`), `registroId` matches `^[a-zA-Z0-9_\-]+$` (<= 128 chars), `createdAt == request.time`, `commitmentAccepted == true`, `edition == 'IA Labs - Enero'`, and `email` belongs exclusively to `@vw.com.mx`, `@proveed-vw.com.mx`, or `@outlook.com`.

## 2. "Dirty Dozen" Adversarial Payloads (Must Fail with PERMISSION_DENIED)
1. **Unauthorized Email Domain (`@gmail.com`)**: Payload with `email: "user@gmail.com"` -> Rejected by regex gate.
2. **Unauthorized Subdomain Spoof (`@vw.com.mx.evil.com`)**: Payload with `email: "user@vw.com.mx.evil.com"` -> Rejected by `$` anchor.
3. **Shadow / Ghost Field Injection**: Valid payload plus `"isAdmin": true` or `"approved": true` -> Rejected by `hasOnly`.
4. **Missing Required Field**: Payload omitting `commitmentAccepted` or `folio` -> Rejected by `hasAll`.
5. **Client-Spoofed Timestamp**: Payload with `createdAt: Timestamp(2020-01-01)` instead of `request.time` -> Rejected by `createdAt == request.time`.
6. **Problem Description Too Short (< 80 chars)**: Payload with 20-character `problemDescription` -> Rejected by `.size() >= 80`.
7. **Resource Exhaustion / Denial of Wallet (> 2000 chars)**: Payload with 10,000-character `problemDescription` -> Rejected by `.size() <= 2000`.
8. **Invalid Category Injection**: Payload with `category: "Arbitrary"` -> Rejected by allowlist check.
9. **Commitment False**: Payload with `commitmentAccepted: false` -> Rejected by `== true`.
10. **Path Variable Poisoning**: Document ID longer than 128 chars or containing invalid symbols -> Rejected by `isValidId(registroId)`.
11. **Public Read / Enumeration Attempt**: `get` or `list` on `/ia_labs_enero_registros` -> Rejected by `allow read: if false;`.
12. **Public Mutation / Deletion Attempt**: `update` or `delete` on existing doc -> Rejected by `allow update, delete: if false;`.
