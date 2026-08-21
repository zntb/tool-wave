import { Suspense } from 'react';
import { getCategoriesAction } from '@/app/actions';
import { CategoryNav } from '@/components/category-nav';
import { NavSkeleton } from '@/components/skeletons';

async function CategoriesNavInner() {
  const categories = await getCategoriesAction();
  return <CategoryNav categories={categories} />;
}

export function CategoriesNav() {
  return (
    <Suspense fallback={<NavSkeleton />}>
      <CategoriesNavInner />
    </Suspense>
  );
}
