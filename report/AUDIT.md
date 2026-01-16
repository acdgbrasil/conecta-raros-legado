# Security Audit Report
**Date:** January 15, 2026
**Project:** Conecta Social API

This document outlines potential security vulnerabilities identified in the codebase and provides recommendations for remediation.

## 1. Critical Vulnerabilities

### 1.1. Broken Access Control (Admin Routes)
*   **Location:** `src/presenter/routers/admRouter.ts`
*   **Issue:** The endpoints `/adm/list/all/:admEmail` and `/adm/deactivate/user` verify authorization by comparing a client-provided parameter (`admEmail` in params or body) with the `SUPER_ADM_EMAIL` environment variable.
*   **Risk:** **Critical**. A malicious actor with *any* valid JWT token (e.g., a standard user) can access these administrative functions simply by passing the super admin's email address in the request. The system fails to verify that the *authenticated user* (from the token) is actually the one making the request.
*   **Recommendation:** 
    1.  Update the `verifyToken` middleware to attach the decoded user ID/payload to the `req` object (e.g., `req.user = decoded`).
    2.  In `admRouter`, fetch the authenticated user from the database using the ID from the token.
    3.  Verify the user's role/email from the database record, ignoring the client-provided `admEmail`.

### 1.2. Insecure JWT Implementation
*   **Location:** `src/infra/jwt/jwtToken.ts`
*   **Issue:** The `verifyToken` middleware validates the token signature but **discards the decoded payload** before calling `next()`. It does not modify `req` to pass user context.
*   **Risk:** **High**. Prevents downstream controllers from implementing proper ownership checks or role-based access control (RBAC) based on identity. Forces developers to rely on insecure client-provided identifiers (as seen in 1.1).
*   **Recommendation:** Modify `verifyToken` to assign the decoded token payload to `req.user` or `res.locals.user`.

## 2. High Vulnerabilities

### 2.1. CORS Misconfiguration
*   **Location:** `src/index.ts`
*   **Issue:** `app.use(cors())` is used without options.
*   **Risk:** **High**. This allows *any* website to make authenticated requests to your API (Cross-Origin Resource Sharing) if the user's browser automatically sends credentials (though JWT usually requires explicit header, this is still bad practice). It opens the door to CSRF-like attacks or data theft if valid tokens are leaked or stored in cookies.
*   **Recommendation:** Configure CORS to allow only trusted domains (e.g., your frontend URL).
    ```typescript
    app.use(cors({ origin: 'https://your-frontend.com' }));
    ```

### 2.2. Missing Rate Limiting
*   **Location:** Global (`src/index.ts`)
*   **Issue:** No rate limiting middleware (like `express-rate-limit`) is observed.
*   **Risk:** **Medium/High**. Vulnerable to Brute Force attacks (especially on `/auth/login`) and Denial of Service (DoS) attacks.
*   **Recommendation:** Install and configure `express-rate-limit` for all routes, with stricter limits on `/auth/*` routes.

## 3. Medium Vulnerabilities

### 3.1. Insecure Direct Object References (IDOR) Potential
*   **Location:** `src/presenter/routers/userRouter.ts` (Various endpoints)
*   **Issue:** Many endpoints accept IDs (e.g., `familyCompositionID`, `personId`) directly from `req.body` to create/link records.
*   **Risk:** **Medium**. If the system does not verify that the authenticated user *owns* or has permission to modify the specific `familyCompositionID`, User A could potentially add data to User B's family records.
*   **Recommendation:** Ensure every write operation validates that the target resource belongs to the authenticated user (retrieved via the fixed JWT middleware).

### 3.2. Sensitive Data Exposure in Responses
*   **Location:** `src/useCase/controllers/authController.ts`
*   **Issue:** Returning entire User objects.
*   **Risk:** **Low/Medium**. Check if `User` entities include the `password` (hash) field when serialized to JSON. If the `User` class or database return includes the password hash, it might be leaked to the frontend.
*   **Recommendation:** Implement a `.toJSON()` method on the User entity or use DTOs to explicitly whitelist fields (exclude `password`, `__v`, etc.) before sending responses.

## 4. Low / Code Quality

### 4.1. Hardcoded Values (Legacy)
*   **Location:** `src/presenter/routers/authRouter.ts` (Fixed but worth noting for regression)
*   **Issue:** Previous versions contained hardcoded registration logic.
*   **Recommendation:** Ensure strict code reviews to prevent debug code from reaching production.

### 4.2. Error Handling Information Leakage
*   **Location:** Global `try/catch` blocks
*   **Issue:** `console.log(e)` is used in production. In some cases, raw error objects might be returned.
*   **Risk:** **Low**. Stack traces or database error details could reveal infrastructure information to attackers.
*   **Recommendation:** Use a proper logging library (e.g., `winston`, `pino`) and sanitize error messages sent to the client.

## 5. Next Steps
1.  **Immediate:** Fix the `verifyToken` middleware and `admRouter` authorization logic.
2.  **Short Term:** Configure CORS and Rate Limiting.
3.  **Long Term:** Implement comprehensive ownership checks (RBAC/ABAC) for all user data endpoints.
