# Security Audit — eOIS (eOffice Intelligence System)

**Date:** 2026-05-30  
**Scope:** All microservices in `qlda-system/` and `frontend/`  
**Method:** Static code analysis, configuration review

---

## Summary

| Severity | Count | Fixed in this audit | Remaining |
|---|---|---|---|
| CRITICAL | 0 | — | 0 |
| HIGH | 2 | 2 | 0 |
| MEDIUM | 4 | 1 | 3 |
| LOW | 3 | 0 | 3 |
| INFO | 3 | 0 | 3 |

**Overall result: PASS-WITH-WARNINGS** — No CRITICAL issues. All HIGH issues resolved.

---

## HIGH — Fixed

### H1: API Gateway — No CORS configuration
**File:** `qlda-system/api-gateway/src/main/resources/application.yml`  
**Risk:** Browsers enforce Same-Origin Policy. Without a CORS config, the API Gateway either rejects all cross-origin requests (breaking the frontend) or an incorrectly configured downstream service accidentally allows all origins.

**Fix applied:** Added `globalcors` under `spring.cloud.gateway.server.webflux` limiting `allowed-origins` to:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (alternate dev)

**Production action required:** Replace with the actual production frontend domain before deploy.

---

### H2: Test suite — WorkflowApiServiceImplTest missing `@Mock UyQuyenRepository`
**File:** `qlda-system/workflow-service/src/test/java/.../WorkflowApiServiceImplTest.java`  
**Risk:** Phase 5 added `UyQuyenRepository` as a required constructor dependency. Without the matching `@Mock`, Mockito injected `null`, causing NPE on any delegation method call. Delegation tests were silently broken.

**Fix applied:** Added `@Mock UyQuyenRepository uyQuyenRepository` and rewrote the three delegation tests (`createAndCancelDelegation_success`, `cancelDelegation_notFound`, `getDelegations_filterByUser`) to mock the JPA repository instead of the removed in-memory store.

---

## MEDIUM — Remaining (action required before production)

### M1: API Gateway — No rate limiting
**File:** `qlda-system/api-gateway/src/main/resources/application.yml`  
**Risk:** Any unauthenticated endpoint (e.g., `/api/auth/login/dev`, `/api/auth/login/azure`) can be brute-forced without restriction.

**Recommended fix:** Add Spring Cloud Gateway `RequestRateLimiter` filter backed by Redis:
```yaml
filters:
  - name: RequestRateLimiter
    args:
      redis-rate-limiter.replenishRate: 10
      redis-rate-limiter.burstCapacity: 20
      key-resolver: "#{@remoteAddrKeyResolver}"
```
Requires Redis to be added to the stack.

---

### M2: Dev login endpoint accessible in production
**File:** `qlda-system/auth-service/src/main/java/.../controller/AuthController.java` (`POST /api/auth/login/dev`)  
**File:** `qlda-system/auth-service/src/main/java/.../config/SecurityConfig.java`  
**Risk:** The endpoint is `permitAll()`. It is gated by `authProperties.getDevPassword().isEnabled()` — returning HTTP 403 when disabled. This is a **controlled risk**, not a vulnerability, provided the prod config sets `auth.dev-password.enabled=false`.

**Recommended fix:** Add a Spring Profile guard so the endpoint's bean is not registered at all in production:
```java
@PostMapping("/login/dev")
@Profile("!prod")
public ApiResponse<AuthTokenResponse> loginDev(...) { ... }
```

---

### M3: Refresh token — blacklist not verified at gateway level
**File:** `qlda-system/api-gateway/src/main/resources/application.yml`  
**Risk:** The API Gateway validates JWT signatures against `public.pem` but does not check whether a token has been revoked (e.g., after logout). Token blacklisting is implemented in `auth-service` but the gateway's `spring-security oauth2 resource server` only checks signature + expiry.  
**Recommended fix:** Reduce JWT access token TTL to ≤15 minutes. Treat refresh-token blacklisting (managed in auth-service) as the primary revocation mechanism.

---

### M4: SharePointService / DigitalSignatureService stubbed
**Files:** `document-service/.../service/SharePointService.java`, `DigitalSignatureService.java`  
**Risk:** These services exist as skeleton/optional beans. If incorrectly wired in production with non-null responses, they could silently fail and send partial documents. Not a current attack surface but a reliability risk.  
**Recommended fix:** Ensure both are explicitly disabled via feature flags in `application.yml` until fully implemented.

---

## LOW — Remaining (best-effort before deploy)

### L1: Swagger / OpenAPI exposed without auth
**File:** `SecurityConfig.java` (all services) — `.requestMatchers("/v3/api-docs/**", "/swagger-ui/**").permitAll()`  
**Risk:** Exposes full API surface to unauthenticated callers. Acceptable in dev; should be restricted in production.  
**Recommended fix:** Add `spring.springdoc.swagger-ui.enabled=false` to prod profiles, or restrict to internal network via reverse proxy.

---

### L2: `LichSuHeThong` — no IP or user recorded for scheduler runs
**File:** `qlda-system/notification-service/.../scheduler/SlaScheduler.java`  
**Risk:** Audit log entries from the SLA scheduler have no `nguoiDungId`, `diaChiIP`, or `trangThai` — making forensic analysis harder.  
**Recommended fix:** Set `trangThai = 1` and populate `nguoiDungId = null, diaChiIP = "scheduler"` for clear identification.

---

### L3: JWT private key path in docker-compose environment variable
**File:** `qlda-system/docker-compose.yml`  
**Risk:** If `qlda-system/.env` is accidentally committed, the private key path is exposed.  
**Status:** `.env` is already gitignored. Ensure `.gitignore` at repo root also excludes `qlda-system/.env`. JWT keys in `qlda-system/jwt-keys/` are gitignored and have been rotated (see prior incident).

---

## INFO — For next security review

### I1: Dependency CVE scan not automated
**Recommendation:** Add OWASP Dependency-Check to Maven build or enable GitHub Dependabot.

### I2: OWASP ZAP baseline scan
**Recommendation:** Run `zap-baseline.py` against staging after deployment:
```bash
docker run -t owasp/zap2docker-stable zap-baseline.py -t http://staging.eois.internal
```
Expected targets: login flow, file upload (`POST /api/documents/{id}/attachments`), search (XSS via `keyword` param).

### I3: HTTPS enforcement not configured
**Recommendation:** Production deployment must terminate TLS at the reverse proxy (nginx/Azure App Gateway). Add `Strict-Transport-Security` header:
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

## Checklist Status

| Check | Status |
|---|---|
| No hardcoded secrets in application.yml files | ✅ Pass — all credentials via `${ENV_VAR}` |
| JWT uses RSA key files (not inline) | ✅ Pass — `classpath:public.pem` / `private.pem` |
| JWT keys gitignored and rotated | ✅ Pass |
| `.env` gitignored | ✅ Pass |
| SQL injection — JPA parameterized queries throughout | ✅ Pass |
| XSS — frontend uses React JSX (auto-escaped) | ✅ Pass |
| CSRF — stateless JWT (no session cookies) | ✅ N/A |
| File upload path sanitization | ✅ Pass — `LocalFileStorageService` uses UUID-based filenames |
| CORS configured | ✅ Fixed (H1) |
| Dev login endpoint gated | ✅ Pass (M2 — configurable) |
| Rate limiting | ⚠️ Missing (M1) |
| Swagger disabled in prod | ⚠️ Not yet (L1) |
| Refresh token TTL short | ⚠️ Verify in AuthProperties config |
| Dependency CVE scan | ⚠️ Not automated (I1) |
