import { getCategoriesAction } from '@/app/actions';
import { CategoryNav } from '@/components/category-nav';

export async function CategoriesNav() {
  const categories = await getCategoriesAction();
  return <CategoryNav categories={categories} />;
}
