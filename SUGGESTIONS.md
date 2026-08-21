# Tool Wave — Improvement Suggestions

Ideas to improve functionality, stability, aesthetics, safety, and user experience.

---

## 🔧 Functionality

### 1. Dark Mode Toggle
The app follows `prefers-color-scheme` but has no manual toggle. Add a sun/moon button in the header so users can override the system setting. `next-themes` is already installed — wire it up.

### 2. Tag System
Resources belong to exactly one category. Add a many-to-many tag model so users can discover resources across categories (e.g., "React", "Free", "Open Source"). Tags would also improve search relevance.

### 3. Resource Ratings
Allow users to rate resources 1–5 stars. Show average rating on cards. This adds a community signal beyond click counts.

### 4. Recently Viewed Resources
Track the last N resources a user visited (localStorage) and show a "Recently Viewed" section on the homepage or a dedicated page. Helps users pick up where they left off.

### 5. API Caching Layer
The suggestions API (`/api/suggestions`) is called on every keystroke (debounced). Add a short-lived in-memory or Redis cache to reduce database queries for repeated searches.

### 6. Database Indexing Audit
The schema has indexes on `categoryId`, `url`, `isFeatured`, `status`, and `createdAt`. Review query patterns — a compound index on `(categoryId, createdAt)` or `(clicks DESC)` for the homepage could help.

### 7. Infinite Scroll Option
Add infinite scroll as an alternative to pagination for users who prefer continuous browsing.

### 8. Resource Availability Checker
Periodically check if linked URLs are still live (200 OK). Show a badge or tooltip on resources that may be down.

---

## 🛡️ Stability

### 1. Error Boundaries per Route ✅
Created `components/route-error.tsx` with friendly error UI (warning icon, "Something went wrong" heading, error digest display, "Try again" and "Go home" buttons). Added `error.tsx` to all 8 page routes: homepage, category, category search, global search, favorites, submit, admin dashboard, and admin login. Each route's crash is isolated — a failure in one page won't blank the entire app.

### 2. API Retry with Exponential Backoff ✅
Created `lib/fetch-with-retry.ts` — wraps `fetch()` with configurable exponential backoff (default: 3 retries, 300ms base delay, 5s max). Only retries on network errors (TypeError), not on HTTP errors or aborted requests. Includes jitter to prevent thundering herd. Applied to 8 fetch calls across autocomplete, header (admin check/logout), analytics dashboard, submissions review, and bulk import form.

### 3. Graceful Offline Support
Add a service worker or `navigator.onLine` check to show a banner when the user is offline. Cache the homepage for basic read access.

### 4. Structured Logging ✅
Created `lib/logger.ts` — a zero-dependency structured logger with `debug`/`info`/`warn`/`error` levels, ISO timestamps, and context tags. Replaced all `console.warn`/`console.error`/`console.log` calls across `app/actions.ts` (6 occurrences), `lib/resources-md.ts` (14 occurrences), `lib/hooks/use-copy-to-clipboard.ts` (1), and `lib/hooks/use-favorites.ts` (1). Log format: `[timestamp] [LEVEL] [context] message`.

### 5. Environment Variable Validation ✅
Created `lib/env.ts` with Zod schema validating `DATABASE_URL` (MongoDB URL format), `ADMIN_EMAILS` (comma-separated emails), `ADMIN_PASSWORD` (min 8 chars), and `ADMIN_SESSION_SECRET` (min 16 chars). Called in `lib/db.ts` on first import — fails fast with a clear error listing all issues. Replaced the old manual URL check.

### 6. Request Size Limits
The bulk import endpoint accepts JSON without a size limit. Add a max body size (e.g., 1 MB) to prevent abuse.

### 7. Database Connection Health Check ✅
Added `GET /api/health` endpoint that runs a lightweight Prisma query (`findFirst` on Link table) to verify database connectivity. Returns `200 { status: 'healthy', database: 'connected' }` on success, `503 { status: 'unhealthy', database: 'disconnected', error }` on failure. Useful for uptime monitoring and deployment health checks.

---

## 🎨 Aesthetics

### 1. Dark Mode Toggle Button ✅
Redesigned as a pill-shaped toggle with a sliding white indicator, sun/moon icons that scale and color-shift on transition, and smooth 300ms animations. Removed Button wrapper dependency.

### 2. Improved Mobile Navigation ✅
Replaced inline search panel with a slide-out drawer containing search, navigation links (Home, Favorites, Submit, Admin), theme toggle, and logout. Includes backdrop, Escape key close, scroll lock, and click-outside dismiss.

### 3. Better Loading Skeletons ✅
Rewrote skeletons to match exact shapes: `NavSkeleton` mirrors `CategoryNav` pill layout, `GridCardSkeleton` matches grid `LinkCard` with icon/title/description/URL/buttons, `ListCardSkeleton` matches horizontal list view. Staggered animation delays preserved.

### 4. Image Fallback Component ✅
Created `<IconFallback>` component with 3 size variants (sm/md/lg). URL icons fall back to the first letter of the title on error. Emoji/text icons render directly. Missing icons show a default search icon. Replaced inline `onError` DOM manipulation in `link-card.tsx` and hardcoded icon rendering in `autocomplete.tsx`.

### 5. Smooth Page Transitions ✅
Created `components/page-transition.tsx` — a client component that detects pathname changes via `usePathname()` and applies a 300ms opacity fade transition. Uses `useRef` to track the previous path and triggers a brief fade-out on navigation, then fades back in with the new content. Integrated into root layout wrapping `{children}` inside `<main>`.

### 6. Tooltip Consistency ✅
Audited all icon-only buttons and added missing `title` attributes: Mobile Menu ("Open menu"), Favorite ("Add to favorites" / "Remove from favorites"), Copy ("Copy link" / "Copied!"), Close Menu ("Close menu"). Every icon-only button now has both `aria-label` and `title`.

---

## 🔒 Safety & Security

### 1. CSRF Protection ✅
Two-layer defense: (1) Changed admin session cookie from `SameSite=lax` to `SameSite=strict`, preventing cross-origin requests from sending the cookie. (2) Added HMAC-based CSRF token validation to admin API routes (`PATCH /api/submissions`, `DELETE /api/submissions`, `POST /api/admin/logout`). Token generated on login, validated via `x-csrf-token` header.

### 2. Rate Limiting on API Routes ✅
Implemented sliding window rate limiting via `lib/rate-limit.ts`: 5 req/min for `POST /api/submissions` (prevents spam submissions) and 30 req/min for `GET /api/suggestions` (allows autocomplete typing). Returns `X-RateLimit-Remaining` and `Retry-After` headers.

### 3. Input Sanitization ✅
Created `lib/sanitize.ts` with `sanitizeString()` and `sanitizeOptional()` helpers that strip `<script>` tags, event handlers (`onclick`, `onerror`, etc.), and `javascript:` URIs. Applied to all user input fields in `POST /api/submissions`, `app/actions.ts` (create/update category and link), and `lib/analytics.ts` (bulk import).

### 4. Content Security Policy ✅
Added comprehensive security headers in `next.config.ts` via the `headers()` function. CSP restricts script/style sources to `self` + `unsafe-inline` (required by Next.js/React), allows images from `https:` (for remote resource icons), fonts from Google Fonts, and blocks plugins/objects. Also added `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy`, and `Strict-Transport-Security` headers.

### 5. Environment Variable Exposure ✅
Verified that `.env` is in `.gitignore` and not tracked by Git. Audited all server-side logs, error messages, and API responses for secret leaks — none found. Created `.env.example` for documentation. Added `sameSite=strict` cookies and input sanitization to reduce attack surface.

### 6. Admin Session Hardening ✅
Three-layer defense: (1) Changed session cookie from `SameSite=lax` to `SameSite=strict` to prevent cross-origin cookie sending. (2) Added HMAC-based CSRF token validation on admin API routes. (3) Session rotation — every login generates a unique random session ID (`randomUUID`) embedded in the cookie as `{email}:{sessionId}:{signature}` where the HMAC covers `{email}:{sessionId}`. This prevents session fixation attacks where an attacker pre-sets a cookie before the user authenticates. Added `verifySessionValue()` helper for clean verification.

### 7. URL Validation on Submission ✅
Created `lib/ssrf-prevention.ts` with `checkSSRF()` function that resolves URLs via DNS and checks all resolved IPs against private/internal ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 127.0.0.0/8, 169.254.0.0/10, IPv6 loopback/link-local/ULA). Blocked hostnames include localhost, 0.0.0.0, 127.0.0.1, 169.254.169.254, and metadata.google.internal. Applied to `POST /api/submissions`, `createLink`, and `updateLinkAction` server actions. DNS resolution failures are blocked by default.

---

## 👤 User Experience

### 1. Keyboard Navigation ✅
Created `lib/hooks/use-keyboard-navigation.ts` with global keyboard shortcuts: `/` to focus and select the search input, `ArrowRight`/`ArrowDown` and `ArrowLeft`/`ArrowUp` to navigate between link cards with visible cyan outline and smooth scroll, `Enter` to open the preview dialog of the selected card, `Escape` to deselect. `Esc` for modals/menus was already handled by the mobile drawer and Radix Dialog. Integrated into `Header` component.

### 2. Skip-to-Content Link ✅
Added a visually hidden `<a>` link as the first focusable element in `app/layout.tsx`. Uses Tailwind's `sr-only` class to hide it visually while keeping it available to screen readers. On focus (first Tab press), it becomes visible as a fixed cyan pill button at the top-left. Links to `#main-content` on the `<main>` element.

### 3. Breadcrumb Navigation ✅
Created `components/breadcrumbs.tsx` — a server component with accessible `<nav aria-label="Breadcrumb">` and `<ol>` structure. Each item is a `<Link>` except the last (marked `aria-current="page"`), separated by chevron icons. Added to three pages: category page (Home > Category), category search (Home > Category > Search Results), and global search (Home > Search Results). Complements the existing `BreadcrumbJsonLd` for SEO.

### 4. Back-to-Top Button ✅
Created `components/back-to-top.tsx` — a floating button fixed at bottom-right that appears after scrolling 400px. Uses opacity and translate-y transitions for smooth fade-in/out. `window.scrollTo({ behavior: 'smooth' })` for smooth return. Includes `aria-label` and `title` for accessibility. Added to root layout.

### 5. Better Empty States ✅
Created `components/empty-state.tsx` — a server component with a search icon illustration, customizable title/description/query, and a "Popular Resources" section fetched from `getPopularResources()` showing the top 5 most-clicked links. Applied to 4 pages: global search, category search, category page (empty category), and homepage (no resources). Replaced plain text empty states across the app.

### 6. Search History ✅
Created `lib/hooks/use-search-history.ts` with `addSearch()`, `removeSearch()`, and `clearHistory()`. Stores last 5 unique searches in localStorage under `tool-wave-search-history`. Integrated into `Autocomplete` — shows "Recent Searches" dropdown when the input is focused but empty, each item clickable to re-run the search, with individual remove buttons.

### 7. Print Stylesheet ✅
Added `@media print` rules in `globals.css`: hides header, nav, footer, search inputs, back-to-top button, favorite/copy/share buttons, atmospheric background effects, shadows, and gradient decorations. Resets body to white background with black text. Link cards get clean borders with `break-inside: avoid`. Links show their URL in parentheses (except navigation links). Main content goes full-width.

### 8. Accessibility Audit ✅
Added `aria-live="polite"` to LinkGrid (announces view changes), search results count in global/category search pages, and favorites badge (sr-only text). Added `role="region"` with `aria-label` to LinkGrid. Added `aria-label` to autocomplete listbox. Added live region in layout for view toggle announcements. Made favorites badge `aria-hidden` with sr-only count text for screen readers. Updated tests to match new sr-only text.

### 9. Onboarding Tooltip
On first visit, show a brief tooltip or walkthrough highlighting key features: search, favorites, view toggle, and submit a resource.

### 10. Favorites Export/Import ✅
Added `exportFavorites()` and `importFavorites()` to `useFavorites` hook. Export downloads a versioned JSON file (`tool-wave-favorites-YYYY-MM-DD.json`). Import validates the file format, deduplicates by ID, and merges with existing favorites. Added Export/Import buttons to the favorites page header with status feedback.

---

## Priority Recommendations

| Priority | Item | Impact |
|----------|------|--------|
| 🔴 High | Error boundaries | Prevents full-app crashes |
| 🔴 High | Rate limiting | Prevents abuse |
| 🔴 High | Dark mode toggle | Most-requested UX feature |
| 🟡 Medium | CSP headers | Security hardening |
| 🟡 Medium | API caching | Performance |
| 🟡 Medium | Keyboard navigation | Accessibility |
| 🟡 Medium | Image fallbacks | Polish |
| 🟢 Low | Breadcrumbs | SEO + navigation |
| 🟢 Low | Back-to-top button | UX convenience |
| 🟢 Low | Print stylesheet | Niche but easy |
