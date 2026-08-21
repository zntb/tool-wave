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

**Duplicate locations:**
- `components/autocomplete.tsx` (lines 91-101)
- `components/share-buttons.tsx` (lines 112-123)

**Similar pattern:**
```ts
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);
```

**Recommendation:** Create a `useClickOutside(ref, callback)` hook in `lib/hooks/`.

---

## 6. Copy-to-Clipboard Pattern

**Duplicate locations:**
- `components/link-card.tsx` (lines 57-64)
- `components/share-buttons.tsx` (lines 161-167)

**Similar pattern:**
```ts
const handleCopy = async (e?: React.MouseEvent) => {
  e?.stopPropagation();
  try {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};
```

**Recommendation:** Create a `useCopyToClipboard()` hook returning `{ copied, handleCopy }`.

---

## 7. Background Pattern (Page Decoration)

**Duplicate locations (5 occurrences):**
- `app/page.tsx` (lines 271-277)
- `app/[slug]/page.tsx` (lines 277-282)
- `app/[slug]/search/page.tsx` (lines 272-278)
- `app/search/page.tsx` (lines 259-265)
- `components/favorites-client.tsx` (lines 110-117)

**Identical JSX:**
```tsx
<div className='fixed inset-0 -z-10 opacity-30 dark:opacity-10'
  style={{
    backgroundImage: `radial-gradient(circle at 1px 1px, rgb(148 163 184) 1px, transparent 0)`,
    backgroundSize: '40px 40px',
  }}
/>
```

**Recommendation:** Extract to a `<BackgroundPattern />` component in `components/`.

---

## 8. Footer Component

**Duplicate locations (4 occurrences):**
- `app/[slug]/page.tsx` (lines 306-315)
- `app/[slug]/search/page.tsx` (lines 316-325)
- `app/search/page.tsx` (lines 294-303)
- `components/favorites-client.tsx` (lines 242-253)

**Identical footer:**
```tsx
<footer className='border-t border-slate-200 dark:border-slate-800 mt-16'>
  <div className='container mx-auto px-4 py-8 max-w-7xl'>
    <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
      <p className='text-sm text-slate-500 dark:text-slate-400'>
        © {new Date().getFullYear()} Tool Wave
      </p>
      <p className='text-sm text-slate-400 dark:text-slate-500'>
        Curated with ❤️ for the developer community
      </p>
    </div>
  </div>
</footer>
```

**Recommendation:** Extract to a `<Footer />` component in `components/`.

---

## 9. Grid/List View Layout Pattern

**Duplicate locations (5 occurrences):**
- `app/page.tsx` (lines 104-108)
- `app/[slug]/page.tsx` (lines 143-147)
- `app/[slug]/search/page.tsx` (lines 138-142)
- `app/search/page.tsx` (lines 136-140)
- `components/favorites-client.tsx` (lines 222-226)

**Identical pattern:**
```tsx
<div className={cn(
  'stagger-children',
  view === 'list'
    ? 'flex flex-col gap-2'
    : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
)}>
```

**Recommendation:** Create a `<LinkGrid view={view}>` wrapper component.

---

## 10. Pagination Component (Large Block)

**Duplicate locations (3 occurrences):**
- `app/page.tsx` (lines 148-195)
- `app/[slug]/page.tsx` (lines 149-203)
- `app/search/page.tsx` (lines 143-185)

**Very similar pagination logic** with minor differences in URL construction.

**Recommendation:** Create a `<PaginationControls page={totalPages} buildUrl={(p) => ...}>` component that accepts a URL builder function.

---

## 11. `CategoriesNav` Async Server Component

**Duplicate locations (4 occurrences):**
- `app/page.tsx` (lines 47-50)
- `app/[slug]/page.tsx` (lines 62-65)
- `app/[slug]/search/page.tsx` (lines 65-68)
- `app/search/page.tsx` (lines 47-50)

**Identical implementation:**
```ts
async function CategoriesNav() {
  const categories = await getCategoriesAction();
  return <CategoryNav categories={categories} />;
}
```

**Recommendation:** Create this as a single server component in `components/category-nav-server.tsx` or add a wrapper in `components/category-nav.tsx`.

---

## 12. `LoadingState` / `ViewToggleWrapper` Helper Components

**Duplicate locations:**
- `LoadingState` in: `app/[slug]/page.tsx`, `app/[slug]/search/page.tsx`, `app/search/page.tsx`
- `ViewToggleWrapper` in: `app/page.tsx`, `app/[slug]/search/page.tsx`, `app/search/page.tsx`

**Identical implementations:**
```tsx
function LoadingState() {
  return <LinkGridSkeleton count={6} />;
}

function ViewToggleWrapper() {
  return <ViewToggle className='hidden sm:block' />;
}
```

**Recommendation:** Export these from their respective component files or move to a shared helpers file.

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
| 5 | Click-outside hook | 2 | Medium |
| 6 | Copy-to-clipboard hook | 2 | Medium |
| 7 | Background pattern | 5 | Medium |
| 8 | Footer component | 4 | **High** |
| 9 | Grid/list layout | 5 | Medium |
| 10 | Pagination block | 3 | **High** |
| 11 | `CategoriesNav` server component | 4 | Medium |
| 12 | `LoadingState` / `ViewToggleWrapper` | 3 each | Low |
| 13 | `nullToUndefined` mapping | 15+ | **High** |
| 14 | Sort order mapping | 3 | Medium |
| 15 | `mounted` hydration pattern | 2 | Low |
| 16 | Search param handling | 2 | Low |

**High-impact refactoring candidates (do first):**
1. Footer component → single `<Footer />`
2. Pagination → `<PaginationControls>` component
3. `nullToUndefined` mapping → generic mapper helpers
4. Favorites storage → `lib/favorites-storage.ts`
