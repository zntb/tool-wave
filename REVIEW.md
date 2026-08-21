# Code Duplication Review

This document lists duplicate code patterns across the codebase that could be refactored into reusable utilities, shared types, or components.

---

## 1. `isUrl` Utility Function

**Status:** ✅ RESOLVED

**Resolution:** Moved `isUrl` to `lib/utils.ts` as a shared utility. Updated `components/link-card.tsx` and `components/autocomplete.tsx` to import from `@/lib/utils`.

---

## 2. `ViewMode` Type

**Status:** ✅ RESOLVED

**Resolution:** Added `ViewMode` to `lib/types.ts` as a shared export. Updated all 7 files (`components/favorites-client.tsx`, `components/link-card.tsx`, `components/view-toggle.tsx`, `app/page.tsx`, `app/[slug]/page.tsx`, `app/[slug]/search/page.tsx`, `app/search/page.tsx`) to import from `@/lib/types`.

---

## 3. `SortOrder` Type

**Status:** ✅ RESOLVED

**Resolution:** Added `SortOrder` to `lib/types.ts` as a shared export. Updated `lib/data.ts` to import and re-export from `lib/types.ts` for backward compatibility. Updated `components/sort-dropdown.tsx`, `app/page.tsx`, and `app/[slug]/page.tsx` to import from `@/lib/types`.

---

## 4. `StoredFavorite` Interface & `FAVORITES_STORAGE_KEY`

**Status:** ✅ RESOLVED

**Resolution:** Created `lib/favorites-storage.ts` with the shared `FAVORITES_STORAGE_KEY`, `StoredFavorite` interface, and `getStoredFavorites()` helper. Updated `components/favorites-client.tsx` and `lib/hooks/use-favorites.ts` to import from the shared module.

---

## 5. Click-Outside Handler Pattern

**Status:** ✅ RESOLVED

**Resolution:** Created `lib/hooks/use-click-outside.ts` with a reusable `useClickOutside(refs, handler, enabled?)` hook. Updated `components/autocomplete.tsx` (single ref, always active) and `components/share-buttons.tsx` (two refs, conditionally active) to use the shared hook.

---

## 6. Copy-to-Clipboard Pattern

**Status:** ✅ RESOLVED

**Resolution:** Created `lib/hooks/use-copy-to-clipboard.ts` with a reusable `useCopyToClipboard()` hook returning `{ copied, copyToClipboard }`. Updated `components/link-card.tsx` and `components/share-buttons.tsx` to use the shared hook.

---

## 7. Background Pattern (Page Decoration)

**Status:** ✅ RESOLVED

**Resolution:** Created `components/background-pattern.tsx` as a reusable `<BackgroundPattern />` component. Updated all 5 locations (`app/page.tsx`, `app/[slug]/page.tsx`, `app/[slug]/search/page.tsx`, `app/search/page.tsx`, `components/favorites-client.tsx`) to use the shared component.

---

## 8. Footer Component

**Status:** ✅ RESOLVED

**Resolution:** Created `components/footer.tsx` with a reusable `<Footer />` component accepting optional `className` and `style` props. Updated all 4 locations to use the shared component.

---

## 9. Grid/List View Layout Pattern

**Status:** ✅ RESOLVED

**Resolution:** Created `components/link-grid.tsx` with a reusable `<LinkGrid view={view}>` component. Updated all 5 locations to use the shared component. Also removed unused `cn` imports from 4 app pages where it was no longer needed.

---

## 10. Pagination Component (Large Block)

**Status:** ✅ RESOLVED

**Resolution:** Created `components/pagination-controls.tsx` with a reusable `<PaginationControls page={totalPages} buildUrl={(p) => ...}>` component. Updated all 4 pagination blocks (`app/page.tsx`, `app/[slug]/page.tsx`, `app/[slug]/search/page.tsx`, `app/search/page.tsx`) to use the shared component.

---

## 11. `CategoriesNav` Async Server Component

**Status:** ✅ RESOLVED

**Resolution:** Created `components/category-nav-server.tsx` as a shared server component that fetches categories and renders `CategoryNav`. Updated all 4 app pages to import from the shared module, removing local definitions and unused `getCategoriesAction`/`CategoryNav` imports.

---

## 12. `LoadingState` / `ViewToggleWrapper` Helper Components

**Status:** ✅ RESOLVED

**Resolution:** Exported `LoadingState` from `components/skeletons.tsx` and `ViewToggleWrapper` from `components/view-toggle.tsx`. Updated all 4 app pages to import from the shared modules and removed local definitions.

---

## 13. `nullToUndefined` Helper & Category/Link Mapping

**Duplicate locations in `lib/data.ts`:**
- Applied in every single query function (15+ occurrences)

**Pattern:**
```ts
return {
  ...result,
  description: nullToUndefined(result.description),
  icon: nullToUndefined(result.icon),
  color: nullToUndefined(result.color),
};
```

**Recommendation:** Create a generic `mapPrismaCategory(c)` and `mapPrismaLink(l)` helper to reduce boilerplate in data access functions.

---

## 14. Sort Order → Prisma `orderBy` Mapping

**Duplicate locations in `lib/data.ts`:**
- `getCategoryWithLinks` (lines 70-77)
- `getAllLinksPaginated` (lines 143-150)
- `getLinksByCategory` (lines 167-174)

**Identical mapping:**
```ts
let orderBy: Prisma.LinkOrderByWithRelationInput;
if (sortBy === 'popular') {
  orderBy = { clicks: 'desc' };
} else if (sortBy === 'az') {
  orderBy = { title: 'asc' };
} else if (sortBy === 'za') {
  orderBy = { title: 'desc' };
} else {
  orderBy = { createdAt: 'desc' };
}
```

**Recommendation:** Create a `getSortOrder(sortBy: SortOrder): Prisma.LinkOrderByWithRelationInput` helper.

---

## 15. SSR Hydration Safety Pattern (`mounted` state)

**Duplicate locations:**
- `components/favorites-button.tsx` (lines 9-15)
- `components/link-card.tsx` (lines 39-45)

**Similar pattern:**
```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => { setMounted(true); }, []);
const displayValue = mounted ? actualValue : fallbackValue;
```

**Recommendation:** Create a `useMounted()` hook returning a boolean.

---

## 16. Search Query Parameter Handling in Header

**Duplicate locations in `components/header.tsx`:**
- Desktop search `onSearch` callback (lines 114-120)
- Mobile search `onSearch` callback (lines 186-192)

**Identical logic:**
```ts
onSearch={query => {
  if (query.trim()) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('q', query.trim());
    router.push(`/search?${params.toString()}`);
  }
}}
```

**Recommendation:** Extract to a shared `handleSearch` function within the component.

---

## Summary

| # | Duplicate | Occurrences | Impact |
|---|-----------|-------------|--------|
| 1 | `isUrl` function | 2 | Low | ✅ RESOLVED |
| 2 | `ViewMode` type | 7 | Medium | ✅ RESOLVED |
| 3 | `SortOrder` type | 4 | Medium | ✅ RESOLVED |
| 4 | `StoredFavorite` / storage key | 2 | High | ✅ RESOLVED |
| 5 | Click-outside hook | 2 | Medium | ✅ RESOLVED |
| 6 | Copy-to-clipboard hook | 2 | Medium | ✅ RESOLVED |
| 7 | Background pattern | 5 | Medium | ✅ RESOLVED |
| 8 | Footer component | 4 | **High** | ✅ RESOLVED |
| 9 | Grid/list layout | 5 | Medium | ✅ RESOLVED |
| 10 | Pagination block | 4 | **High** | ✅ RESOLVED |
| 11 | `CategoriesNav` server component | 4 | Medium | ✅ RESOLVED |
| 12 | `LoadingState` / `ViewToggleWrapper` | 3 each | Low | ✅ RESOLVED |
| 13 | `nullToUndefined` mapping | 15+ | **High** |
| 14 | Sort order mapping | 3 | Medium |
| 15 | `mounted` hydration pattern | 2 | Low |
| 16 | Search param handling | 2 | Low |

**High-impact refactoring candidates (do first):**
1. Footer component → single `<Footer />`
2. Pagination → `<PaginationControls>` component
3. `nullToUndefined` mapping → generic mapper helpers
4. Favorites storage → `lib/favorites-storage.ts`
