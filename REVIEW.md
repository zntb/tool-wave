# Code Duplication Review

Audit of duplicate functions, components, and patterns across the codebase.

---

## 1. Search Params Parsing Pattern ✅
Created `parseSearchParams()` in `lib/utils.ts` returning `{ page, view, sort }`. Applied to all 4 pages: `app/page.tsx`, `app/[slug]/page.tsx`, `app/[slug]/search/page.tsx`, and `app/search/page.tsx`. Each page now calls `parseSearchParams({ page, view, sort })` instead of duplicating the parseInt/isNaN/cast logic.

---

## 2. Page Layout Wrapper Pattern ✅
Created `components/page-layout.tsx` — a reusable `<PageLayout>` component that encapsulates `BackgroundPattern`, the `<main>` container, and `<Footer>`. Props: `showFooter` (default true), `footerClassName`, `footerStyle`, `className`, `testId`. Applied to all 5 locations: `app/page.tsx` (with `showFooter={false}`), `app/[slug]/page.tsx`, `app/[slug]/search/page.tsx`, `app/search/page.tsx`, and `components/favorites-client.tsx`.

---

## 3. CategoriesNav Suspense Wrapper ✅
Moved the `<Suspense fallback={<NavSkeleton />}>` boundary into `CategoriesNav` in `components/category-nav-server.tsx`. The component now self-contains its loading state. All 4 pages now just use `<CategoriesNav />` without wrapping it. Removed unused `NavSkeleton` imports from all 4 pages.

---

## 4. View Toggle + Sort Dropdown Section ✅
Created `components/view-sort-controls.tsx` — a `<ViewSortControls>` client component wrapping `<ViewToggle>` (with Suspense) and `<SortDropdown>`. Props: `defaultValue` (SortOrder), `className`. Applied to `app/page.tsx` and `app/[slug]/page.tsx`. Removed unused imports from both pages.

---

## 5. Pagination URL Builder ✅
Created `buildPaginationUrl(basePath, pageNum, { view?, sort? })` in `lib/utils.ts`. Replaced 7-line `buildUrl` functions in `app/page.tsx` and `app/[slug]/page.tsx` with one-liner calls. Updated inline lambda in `app/search/page.tsx` to use the utility as well.

---

## 6. Server Action Error Handling Pattern ✅
Created `ActionResult` type and `withErrorHandling(fn, fallbackMessage)` in `lib/utils.ts`. Applied to 6 CRUD actions (`createCategory`, `updateCategoryAction`, `deleteCategoryAction`, `createLink`, `updateLinkAction`, `deleteLinkAction`) — each now wraps its body in `withErrorHandling()`. The 3 data-returning actions (`searchLinksAction`, `searchLinksByCategoryAction`, `getAutocompleteSuggestionsAction`) were simplified with `as const` return types but kept inline since they return `data` alongside `success`.

---

## 7. Admin API Authentication Check ✅
Created `requireAdmin()` in `lib/admin-auth.ts` returning `string | NextResponse`. Applied to 4 API routes: `GET/PATCH/DELETE /api/submissions` and `POST /api/bulk-import`. Each route now uses `const authResult = await requireAdmin(); if (authResult instanceof NextResponse) return authResult;`. Updated test mocks to use `requireAdmin` with `NextResponse.json()` for unauthorized cases.

---

## 8. CSRF Token Check Pattern ✅
Created `requireAuthenticatedAdmin(request)` in `lib/admin-auth.ts` combining admin auth + CSRF token validation. Applied to `PATCH /api/submissions` and `DELETE /api/submissions`, replacing the 2-step `requireAdmin()` + `requireCsrfToken()` pattern. Updated test mocks to use `requireAuthenticatedAdmin`.

---

## 9. Admin Form Submission Pattern ✅
Extended `FormToastHandler` with render props (`{ isPending })` to expose loading state to children. Refactored 4 form-based components (`CategoryUpdateModal`, `LinkUpdateModal`, `AddCategoryForm`, `AddLinkForm`) to use `FormToastHandler`. The 2 delete modals (`CategoryDeleteModal`, `LinkDeleteModal`) were simplified (removed unnecessary `async` from `handleDelete`) but kept manual since they use button clicks, not form submissions.

---

## 10. API Response Error Pattern

**Duplicate locations (8+ occurrences):**
- `app/api/submissions/route.ts` (lines 62-65, 73-76, 85-88, 97-100, 119-122, 140-143)
- `app/api/bulk-import/route.ts` (lines 34-37)
- `app/api/analytics/route.ts`

**Identical pattern:**
```ts
} catch (error) {
  return NextResponse.json(
    {
      error:
        error instanceof Error
          ? error.message
          : 'Failed to ...',
    },
    { status: 500 },
  );
}
```

**Recommendation:** Create a `handleApiError(error, context)` utility that returns a consistent `NextResponse` error. Could also log the error with `logger.error`.

---

## 11. Search Params to URL Building in Header/MobileNav

**Duplicate locations (2 occurrences):**
- `components/header.tsx` (lines 107-113, `handleSearch`)
- `components/mobile-nav-drawer.tsx` (lines 72-77, `handleSearch`)

**Identical pattern:**
```ts
const handleSearch = (query: string) => {
  if (query.trim()) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('q', query.trim());
    router.push(`/search?${params.toString()}`);
    setIsMobileMenuOpen(false); // header only
  }
};
```

**Recommendation:** Create a `useSearchNavigation()` hook that returns a `handleSearch(query)` function, or add the search navigation logic to the `SearchInput` component.

---

## 12. Fetch Response Handling Pattern in Admin Components

**Duplicate locations (3 occurrences):**
- `components/admin/AnalyticsDashboard.tsx` (lines 12-25, `fetchAnalytics`)
- `components/admin/SubmissionsReview.tsx` (lines 17-26, `fetchSubmissions`)
- `components/admin/BulkImportForm.tsx` (lines 22-33, import)

**Similar pattern:**
```ts
try {
  const response = await fetchWithRetry('/api/...');
  const data = await response.json();
  if (data.success) {
    setData(data.data);
  } else {
    toast.error(data.error || 'Failed to ...');
  }
} catch {
  toast.error('Failed to ...');
}
```

**Recommendation:** Create a `fetchAdminApi<T>(url, options?)` utility that handles the fetch, JSON parsing, success check, and error toasting in one call. Returns `T | null`.

---

## 13. `ViewToggleWrapper` Component

**Duplicate locations (already extracted but worth noting):**
- `components/view-toggle.tsx` exports `ViewToggleWrapper`

**Current state:** This was already refactored in a previous session. `ViewToggleWrapper` is a thin wrapper that passes `className='hidden sm:block'`. No further action needed.

---

## 14. Empty State with Heart Icon in Favorites

**Single location but notable:**
- `components/favorites-client.tsx` (lines 188-207)

**Pattern:** Shows a heart icon, "No favorites yet" message, description, and a "Browse resources" CTA button. This is similar to `EmptyState` component but with different content and styling.

**Recommendation:** Consider extending `EmptyState` to accept an optional `icon`, `actionLabel`, and `actionHref` props to unify the two empty state patterns.

---

## 15. `console.error` Left in Client Components

**Locations found:**
- `components/favorites-client.tsx` (line 47): `console.error('Failed to load favorites:', error);`
- `components/admin/AnalyticsDashboard.tsx` (line 39): `console.error('Failed to fetch analytics:', error);`
- `components/share-buttons.tsx` (line 115): `console.error('Error sharing:', err);`

**Recommendation:** Replace remaining `console.error` calls with `logger.error()` for consistency with the structured logging system.

---

## 16. Admin Tab Navigation Pattern

**Location:**
- `components/admin/AdminPageContent.tsx` (lines 29-55)

**Pattern:** Manual tab buttons with inline `className` ternaries:
```tsx
<button
  onClick={() => setActiveTab('manage')}
  className={`px-4 py-2 rounded ${
    activeTab === 'manage' ? 'bg-blue-600 text-white' : 'bg-gray-200'
  }`}
>
  Manage
</button>
```

**Recommendation:** Use a `<Tabs>` component from the UI library or create a simple `TabBar` component to eliminate the repeated button styling pattern.

---

## Priority Summary

| # | Issue | Occurrences | Impact |
|---|-------|-------------|--------|
| 1 | Search params parsing ✅ | 4× | Boilerplate reduction |
| 2 | Page layout wrapper ✅ | 5× | Consistent layout, easy global changes |
| 3 | CategoriesNav Suspense ✅ | 4× | Boilerplate reduction |
| 4 | View + Sort controls ✅ | 2× | Component cohesion |
| 5 | Pagination URL builder ✅ | 3× | DRY utility |
| 6 | Server action error handling ✅ | 8× | Consistent error responses |
| 7 | Admin auth check ✅ | 6× | Security + DRY |
| 8 | CSRF check ✅ | 2× | Security + DRY |
| 9 | Admin form submission ✅ | 6× | Use existing FormToastHandler |
| 10 | API response error | 8+× | Consistent error format |
| 11 | Search navigation | 2× | DRY hook |
| 12 | Admin fetch pattern | 3× | DRY utility |
| 15 | console.error → logger | 3× | Structured logging consistency |
| 16 | Admin tab navigation | 1× | Use UI component |
