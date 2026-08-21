import { Suspense } from 'react';
import type { Metadata } from 'next';
import {
  getAllLinksPaginatedAction,
  getAllLinksCountAction,
  getAllCategoriesWithLinksCountAction,
} from './actions';
import { CategoriesNav } from '@/components/category-nav-server';
import { ViewSortControls } from '@/components/view-sort-controls';
import { LinkCard } from '@/components/link-card';
import { LinkGridSkeleton } from '@/components/skeletons';
import { LinkGrid } from '@/components/link-grid';
import { PageLayout } from '@/components/page-layout';
import type { ViewMode, SortOrder } from '@/lib/types';
import { parseSearchParams, buildPaginationUrl } from '@/lib/utils';
import { PaginationControls } from '@/components/pagination-controls';
import { EmptyState } from '@/components/empty-state';

export const metadata: Metadata = {
  title: 'Tool Wave',
  description:
    'Discover the best design resources for your web and mobile projects',
  alternates: {
    canonical: 'https://tool-wave.vercel.app/',
  },
};

const ITEMS_PER_PAGE = 12;

interface HomePageProps {
  searchParams: Promise<{
    page?: string;
    view?: string;
    sort?: string;
  }>;
}

async function LinksByCategory({
  page,
  view,
  sortBy,
}: {
  page: number;
  view: ViewMode;
  sortBy: SortOrder;
}) {
  const skip = (page - 1) * ITEMS_PER_PAGE;
  const links = await getAllLinksPaginatedAction({
    limit: ITEMS_PER_PAGE,
    skip,
    sortBy,
  });
  const totalLinks = await getAllLinksCountAction();
  const totalPages = Math.ceil(totalLinks / ITEMS_PER_PAGE);

  const buildUrl = (pageNum: number) => buildPaginationUrl('/', pageNum, { view, sort: sortBy });

  if (links.length === 0) {
    return (
      <EmptyState
        title='No resources yet'
        description='Be the first to add a resource! Check out popular resources below.'
      />
    );
  }

  return (
    <div className='space-y-12'>
      {/* All links display on home page */}
      <section className='space-y-6'>
        <header className='space-y-2'>
          <h2 className='text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-slate-100'>
            All Resources
          </h2>
          <p className='text-slate-500 dark:text-slate-400 max-w-2xl'>
            Browse all design resources across all categories
          </p>
        </header>

        <LinkGrid view={view}>
          {links.map((link, index) => (
            <LinkCard key={link.id} link={link} index={index} view={view} />
          ))}
        </LinkGrid>

        {links.length === 0 && (
          <p className='text-slate-400 dark:text-slate-500 text-center py-8'>
            No links available yet.
          </p>
        )}
      </section>

      {/* Pagination */}
      <PaginationControls
        page={page}
        totalPages={totalPages}
        buildUrl={buildUrl}
      />
    </div>
  );
}



async function StatsDisplay() {
  const [totalCategories, totalLinks] = await Promise.all([
    getAllCategoriesWithLinksCountAction(),
    getAllLinksCountAction(),
  ]);

  return (
    <div className='flex items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400'>
      <div className='flex items-center gap-2'>
        <svg
          className='w-4 h-4'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z'
          />
        </svg>
        <span>
          <strong className='text-slate-700 dark:text-slate-300'>
            {totalCategories}
          </strong>{' '}
          {totalCategories === 1 ? 'category' : 'categories'}
        </span>
      </div>
      <div className='flex items-center gap-2'>
        <svg
          className='w-4 h-4'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1'
          />
        </svg>
        <span>
          <strong className='text-slate-700 dark:text-slate-300'>
            {totalLinks}
          </strong>{' '}
          {totalLinks === 1 ? 'resource' : 'resources'}
        </span>
      </div>
    </div>
  );
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { page: pageStr, view: viewStr, sort: sortStr } = await searchParams;
  const { page: validPage, view: currentView, sort: currentSort } = parseSearchParams({ page: pageStr, view: viewStr, sort: sortStr });

  return (
    <PageLayout showFooter={false}>
      {/* Header */}
      <header className='text-center mb-12 space-y-4 animate-fade-in'>
        <h1 className='text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight'>
          <span className='gradient-text'>Tool Wave</span>
        </h1>
        <p className='text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto'>
          A curated collection of design resources for developers
        </p>
        <StatsDisplay />
      </header>

      {/* Category Navigation */}
      <div className='mb-8 animate-fade-in'>
        <CategoriesNav />
      </div>

      {/* View Toggle and Sort */}
      <ViewSortControls defaultValue={currentSort} className='mb-6 animate-fade-in' />

      {/* Links Grid/List */}
      <Suspense fallback={<LinkGridSkeleton />}>
        <LinksByCategory
          page={validPage}
          view={currentView}
          sortBy={currentSort}
        />
      </Suspense>
    </PageLayout>
  );
}
