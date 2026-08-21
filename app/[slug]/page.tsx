import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getCategoryBySlugAction,
  getCategoryWithLinksAction,
  getCategoryWithLinksCountAction,
} from '../actions';
import { CategoriesNav } from '@/components/category-nav-server';
import { ViewToggle } from '@/components/view-toggle';
import { SortDropdown } from '@/components/sort-dropdown';
import { LinkCard } from '@/components/link-card';
import { SearchInput } from '@/components/search-input';
import { NavSkeleton, LoadingState } from '@/components/skeletons';

import { BreadcrumbJsonLd } from '@/components/json-ld';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { LinkGrid } from '@/components/link-grid';
import { PageLayout } from '@/components/page-layout';
import type { ViewMode, SortOrder } from '@/lib/types';
import { parseSearchParams } from '@/lib/utils';
import { PaginationControls } from '@/components/pagination-controls';
import { EmptyState } from '@/components/empty-state';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
    view?: string;
    sort?: string;
  }>;
}

const ITEMS_PER_PAGE = 9;

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlugAction(slug);

  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: `${category.name} - Tool Wave`,
    description:
      category.description ||
      `Browse ${category.name} design resources for developers`,
    alternates: {
      canonical: `https://tool-wave.vercel.app/${slug}`,
    },
  };
}

async function CategoryContent({
  slug,
  page,
  view,
  sortBy,
}: {
  slug: string;
  page: number;
  view: ViewMode;
  sortBy: SortOrder;
}) {
  const skip = (page - 1) * ITEMS_PER_PAGE;
  const category = await getCategoryWithLinksAction(slug, {
    limit: ITEMS_PER_PAGE,
    skip,
    sortBy,
  });
  const totalLinks = await getCategoryWithLinksCountAction(slug);
  const totalPages = Math.ceil(totalLinks / ITEMS_PER_PAGE);

  // Helper to build URL with preserved query params
  const buildUrl = (pageNum: number) => {
    const params = new URLSearchParams();
    params.set('page', String(pageNum));
    if (view !== 'grid') params.set('view', view);
    if (sortBy !== 'newest') params.set('sort', sortBy);
    return `/${slug}?${params.toString()}`;
  };

  if (!category) {
    notFound();
  }

  return (
    <div className='space-y-8'>
      <header className='space-y-4 text-center animate-fade-in'>
        <h1 className='text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight'>
          <span className='gradient-text'>{category.name}</span>
        </h1>
        {category.description && (
          <p className='text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto'>
            {category.description}
          </p>
        )}
        <p className='text-sm text-slate-500 dark:text-slate-400'>
          <strong className='text-slate-700 dark:text-slate-300'>
            {totalLinks}
          </strong>{' '}
          {totalLinks === 1 ? 'resource' : 'resources'} in this category
        </p>
      </header>

      {/* Search */}
      <div className='max-w-md mx-auto'>
        <SearchInput
          placeholder={`Search in ${category.name}...`}
          categorySlug={slug}
        />
      </div>

      {/* View Toggle and Sort */}
      <div className='flex justify-end items-center gap-2 mb-4'>
        <Suspense fallback={null}>
          <ViewToggle />
        </Suspense>
        <SortDropdown defaultValue={sortBy} />
      </div>

      {/* Links Grid */}
      <LinkGrid view={view}>
        {category.links.map((link, index) => (
          <LinkCard key={link.id} link={link} index={index} view={view} />
        ))}
      </LinkGrid>

      {category.links.length === 0 && (
        <EmptyState
          title='No links in this category yet'
          description='Be the first to add a resource!'
        />
      )}      {/* Pagination */}
      <PaginationControls
        page={page}
        totalPages={totalPages}
        buildUrl={buildUrl}
      />
    </div>
  );
}



export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const { page: pageStr, view: viewStr, sort: sortStr } = await searchParams;
  const { page: validPage, view: currentView, sort: currentSort } = parseSearchParams({ page: pageStr, view: viewStr, sort: sortStr });
  const category = await getCategoryBySlugAction(slug);

  return (
    <>
      {category && (
        <BreadcrumbJsonLd
          items={[
            {
              name: 'Home',
              url: 'https://tool-wave.vercel.app/',
            },
            {
              name: category.name,
              url: `https://tool-wave.vercel.app/${slug}`,
            },
          ]}
        />
      )}
      <PageLayout>
        {/* Breadcrumbs */}
        {category && (
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: category.name },
            ]}
            className='mb-6'
          />
        )}

        {/* Category Navigation */}
        <div className='mb-12'>
          <Suspense fallback={<NavSkeleton />}>
            <CategoriesNav />
          </Suspense>
        </div>

        {/* Category Content */}
        <Suspense fallback={<LoadingState />}>
          <CategoryContent
            slug={slug}
            page={validPage}
            view={currentView}
            sortBy={currentSort}
          />
        </Suspense>
      </PageLayout>
    </>
  );
}
