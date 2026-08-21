import { Suspense } from 'react';
import type { Metadata } from 'next';
import { searchLinksAction, getCategoriesAction } from '../actions';
import { LinkCard } from '@/components/link-card';
import { LoadingState } from '@/components/skeletons';
import { CategoriesNav } from '@/components/category-nav-server';
import { ViewToggleWrapper } from '@/components/view-toggle';
import type { Link as LinkType, ViewMode } from '@/lib/types';
import { parseSearchParams, buildPaginationUrl } from '@/lib/utils';
import { LinkGrid } from '@/components/link-grid';
import { PageLayout } from '@/components/page-layout';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { PaginationControls } from '@/components/pagination-controls';
import { EmptyState } from '@/components/empty-state';

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    view?: string;
  }>;
}

const ITEMS_PER_PAGE = 9;

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const query = q?.trim() || '';
  return {
    title: query
      ? `Search results for "${query}" - Tool Wave`
      : 'Search - Tool Wave',
    description: query
      ? `Search results for "${query}" among curated design resources`
      : 'Search through curated design resources for developers',
    alternates: {
      canonical: query
        ? `https://tool-wave.vercel.app/search?q=${encodeURIComponent(query)}`
        : 'https://tool-wave.vercel.app/search',
    },
  };
}

async function SearchResults({
  query,
  page,
  view,
}: {
  query: string;
  page: number;
  view: ViewMode;
}) {
  const skip = (page - 1) * ITEMS_PER_PAGE;
  const [result, categories] = await Promise.all([
    searchLinksAction(query),
    getCategoriesAction(),
  ]);

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
        description='Try a different search term or browse popular resources below.'
        query={query}
      />
    );
  }

  // Create a map of categoryId to category name
  const categoryMap = categories.reduce((acc, category) => {
    acc[category.id] = category.name;
    return acc;
  }, {} as Record<string, string>);

  // Group links by category for better organization
  const linksByCategory = paginatedLinks.reduce((acc, link) => {
    if (!acc[link.categoryId]) {
      acc[link.categoryId] = {
        categoryId: link.categoryId,
        categoryName: categoryMap[link.categoryId] || 'Unknown Category',
        links: [],
      };
    }
    acc[link.categoryId].links.push(link);
    return acc;
  }, {} as Record<string, { categoryId: string; categoryName: string; links: LinkType[] }>);

  return (
    <div className='space-y-8'>
      <div className='text-center mb-8'>
        <h1 className='text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100'>
          Search Results
        </h1>
        <p className='mt-2 text-slate-500 dark:text-slate-400' aria-live='polite'>
          Found {totalLinks} result{totalLinks !== 1 ? 's' : ''} for &quot;
          {query}&quot; — Page {page} of {totalPages}
        </p>
      </div>

      {Object.values(linksByCategory).map(
        ({ categoryId, categoryName, links: categoryLinks }) => (
          <section key={categoryId} className='space-y-4'>
            <h2 className='text-xl font-semibold text-slate-800 dark:text-slate-200'>
              {categoryName}
            </h2>
            <LinkGrid view={view}>
              {categoryLinks.map((link, index) => (
                <LinkCard key={link.id} link={link} index={index} view={view} />
              ))}
            </LinkGrid>
          </section>
        ),
      )}

      {/* Pagination */}
      <PaginationControls
        page={page}
        totalPages={totalPages}
        buildUrl={p => buildPaginationUrl(`/search?q=${encodeURIComponent(query)}`, p)}
      />
    </div>
  );
}



export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, page: pageStr, view: viewStr } = await searchParams;
  const query = q?.trim();
  const { page: validPage, view: currentView } = parseSearchParams({ page: pageStr, view: viewStr });

  const searchQuery = query || '';

  return (
    <PageLayout>
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Search Results' },
        ]}
        className='mb-6'
      />

      {/* Category Navigation */}
      <div className='mb-8'>
        <CategoriesNav />
      </div>

      {/* View Toggle */}
      <div className='flex justify-end mb-4'>
        <Suspense fallback={null}>
          <ViewToggleWrapper />
        </Suspense>
      </div>

      {/* Search Results */}
      <Suspense fallback={<LoadingState />}>
        <SearchResults
          query={searchQuery}
          page={validPage}
          view={currentView}
        />
      </Suspense>
    </PageLayout>
  );
}
