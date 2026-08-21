import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getCategoryBySlugAction,
  searchLinksByCategoryAction,
} from '../../actions';
import { LinkCard } from '@/components/link-card';
import { NavSkeleton, LoadingState } from '@/components/skeletons';
import { CategoriesNav } from '@/components/category-nav-server';
import { ViewToggleWrapper } from '@/components/view-toggle';
import { SearchInput } from '@/components/search-input';
import { LinkGrid } from '@/components/link-grid';
import { BackgroundPattern } from '@/components/background-pattern';
import { Footer } from '@/components/footer';
import { Breadcrumbs } from '@/components/breadcrumbs';
import type { ViewMode } from '@/lib/types';
import { PaginationControls } from '@/components/pagination-controls';
import { EmptyState } from '@/components/empty-state';

interface CategorySearchPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    q?: string;
    page?: string;
    view?: string;
  }>;
}

const ITEMS_PER_PAGE = 9;

export async function generateMetadata({
  params,
  searchParams,
}: CategorySearchPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { q } = await searchParams;
  const category = await getCategoryBySlugAction(slug);
  const query = q?.trim() || '';

  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: query
      ? `Search in ${category.name}: "${query}" - Tool Wave`
      : `${category.name} - Tool Wave`,
    description: query
      ? `Search results for "${query}" in ${category.name} category`
      : `Browse ${category.name} design resources for developers`,
    alternates: {
      canonical: query
        ? `https://tool-wave.vercel.app/${slug}/search?q=${encodeURIComponent(
            query,
          )}`
        : `https://tool-wave.vercel.app/${slug}`,
    },
  };
}

async function CategorySearchResults({
  slug,
  query,
  page,
  view,
}: {
  slug: string;
  query: string;
  page: number;
  view: ViewMode;
}) {
  const skip = (page - 1) * ITEMS_PER_PAGE;
  const [result, category] = await Promise.all([
    searchLinksByCategoryAction(query, slug),
    getCategoryBySlugAction(slug),
  ]);

  if (!category) {
    notFound();
  }

  if (!result.success) {
    return (
      <div className='text-center py-12'>
        <p className='text-red-500 dark:text-red-400'>
          Error searching: {result.error}
        </p>
      </div>
    );
  }

  const allLinks = result.data;
  const totalLinks = allLinks?.length ?? 0;
  const totalPages = Math.ceil(totalLinks / ITEMS_PER_PAGE);
  const paginatedLinks = allLinks?.slice(skip, skip + ITEMS_PER_PAGE) ?? [];

  if (!paginatedLinks || paginatedLinks.length === 0) {
    return (
      <EmptyState
        title='No results found'
        description={`Try a different search term or browse popular resources below.`}
        query={`${query} in ${category.name}`}
      />
    );
  }

  return (
    <div className='space-y-8'>
      <div className='text-center mb-8'>
        <h1 className='text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100'>
          Search Results in {category.name}
        </h1>
        <p className='mt-2 text-slate-500 dark:text-slate-400' aria-live='polite'>
          Found {totalLinks} result{totalLinks !== 1 ? 's' : ''} for "{query}" —
          Page {page} of {totalPages}
        </p>
      </div>

      <LinkGrid view={view}>
        {paginatedLinks.map((link, index) => (
          <LinkCard key={link.id} link={link} index={index} view={view} />
        ))}
      </LinkGrid>

      {/* Pagination */}
      <PaginationControls
        page={page}
        totalPages={totalPages}
        buildUrl={p => `/${slug}/search?q=${query}&page=${p}`}
      />
    </div>
  );
}



export default async function CategorySearchPage({
  params,
  searchParams,
}: CategorySearchPageProps) {
  const { slug } = await params;
  const { q, page, view } = await searchParams;
  const query = q?.trim();
  const currentPage = page ? parseInt(page, 10) : 1;
  const validPage = isNaN(currentPage) || currentPage < 1 ? 1 : currentPage;
  const currentView = (view as ViewMode) || 'grid';
  const searchQuery = query || '';
  const category = await getCategoryBySlugAction(slug);

  if (!category) {
    notFound();
  }

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950'>
      <BackgroundPattern />

      <main className='container mx-auto px-4 py-8 md:py-12 lg:py-16 max-w-7xl'>
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: category.name, href: `/${slug}` },
            { label: 'Search Results' },
          ]}
          className='mb-6'
        />

        {/* Category Navigation */}
        <div className='mb-8'>
          <Suspense fallback={<NavSkeleton />}>
            <CategoriesNav />
          </Suspense>
        </div>

        {/* View Toggle */}
        <div className='flex justify-end mb-4'>
          <Suspense fallback={null}>
            <ViewToggleWrapper />
          </Suspense>
        </div>

        {/* Search Input */}
        <div className='max-w-md mx-auto mb-8'>
          <SearchInput
            placeholder={`Search in ${category.name}...`}
            categorySlug={slug}
          />
        </div>

        {/* Search Results */}
        <Suspense fallback={<LoadingState />}>
          <CategorySearchResults
            slug={slug}
            query={searchQuery}
            page={validPage}
            view={currentView}
          />
        </Suspense>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
