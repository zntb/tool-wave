import { Category, Link, CategoryWithLinks, SortOrder } from './types';
export type { SortOrder } from './types';
import { slugify } from './utils';
import { prisma } from './db';
import { Prisma } from '@prisma/client';

// Helper to convert null to undefined for optional string fields
function nullToUndefined<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

// Mapping helpers to reduce nullToUndefined boilerplate
function mapPrismaCategory<
  T extends { description: string | null; icon: string | null; color?: string | null },
>(c: T): Omit<T, 'description' | 'icon'> & { description?: string; icon?: string; color?: string } {
  return {
    ...c,
    description: nullToUndefined(c.description),
    icon: nullToUndefined(c.icon),
    color: nullToUndefined(c.color),
  };
}

function mapPrismaLink<T extends { description: string | null; icon: string | null }>(
  l: T,
): Omit<T, 'description' | 'icon'> & { description?: string; icon?: string } {
  return {
    ...l,
    description: nullToUndefined(l.description),
    icon: nullToUndefined(l.icon),
  };
}

function getSortOrder(sortBy?: SortOrder): Prisma.LinkOrderByWithRelationInput {
  if (sortBy === 'popular') return { clicks: 'desc' };
  if (sortBy === 'az') return { title: 'asc' };
  if (sortBy === 'za') return { title: 'desc' };
  return { createdAt: 'desc' };
}

// Category operations
export async function getCategories(): Promise<Category[]> {
  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
  });
  return categories.map(mapPrismaCategory);
}

export async function getCategoryBySlug(
  slug: string,
): Promise<Category | null> {
  const category = await prisma.category.findUnique({
    where: { slug },
  });
  if (!category) return null;
  return mapPrismaCategory(category);
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const category = await prisma.category.findUnique({
    where: { id },
  });
  if (!category) return null;
  return mapPrismaCategory(category);
}

export async function getCategoryWithLinks(
  slug: string,
  options?: { limit?: number; skip?: number; sortBy?: SortOrder },
): Promise<CategoryWithLinks | null> {
  const { limit, skip, sortBy } = options || {};
  const linksInclude: Prisma.LinkFindManyArgs = {
    orderBy: getSortOrder(sortBy),
  };
  if (limit !== undefined) {
    linksInclude.take = limit;
  }
  if (skip !== undefined) {
    linksInclude.skip = skip;
  }
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      links: linksInclude,
    },
  });
  if (!category) return null;
  return {
    ...mapPrismaCategory(category),
    links: category.links.map(mapPrismaLink),
  };
}

export async function getCategoryWithLinksCount(slug: string): Promise<number> {
  const category = await prisma.category.findUnique({
    where: { slug },
    select: { _count: { select: { links: true } } },
  });
  return category?._count?.links ?? 0;
}

export async function getAllCategoriesWithLinks(options?: {
  limit?: number;
  skip?: number;
}): Promise<CategoryWithLinks[]> {
  const { limit, skip } = options || {};
  const linksInclude: Prisma.LinkFindManyArgs = {};
  if (limit !== undefined) {
    linksInclude.take = limit;
  }
  if (skip !== undefined) {
    linksInclude.skip = skip;
  }
  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
    include: {
      links: linksInclude,
    },
  });
  return categories.map(c => ({
    ...mapPrismaCategory(c),
    links: c.links.map(mapPrismaLink),
  }));
}

export async function getAllCategoriesWithLinksCount(): Promise<number> {
  const count = await prisma.category.count();
  return count;
}

export async function getAllLinksCount(): Promise<number> {
  const count = await prisma.link.count();
  return count;
}

export async function getAllLinksPaginated(options?: {
  limit?: number;
  skip?: number;
  sortBy?: SortOrder;
}): Promise<Link[]> {
  const { limit, skip, sortBy } = options || {};
  const links = await prisma.link.findMany({
    take: limit,
    skip,
    orderBy: getSortOrder(sortBy),
  });
  return links.map(mapPrismaLink);
}

export async function createCategory(data: {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}): Promise<Category> {
  // Get the highest order number
  const lastCategory = await prisma.category.findFirst({
    orderBy: { order: 'desc' },
  });
  const newOrder = lastCategory ? lastCategory.order + 1 : 1;

  const category = await prisma.category.create({
    data: {
      name: data.name,
      slug: slugify(data.name),
      description: data.description,
      icon: data.icon,
      color: data.color,
      order: newOrder,
    },
  });
  return mapPrismaCategory(category);
}

export async function updateCategory(
  id: string,
  data: Partial<{
    name: string;
    description?: string;
    icon?: string;
    color?: string;
  }>,
): Promise<Category | null> {
  const updateData: Prisma.CategoryUpdateInput = { ...data };
  // Remove id from updateData if present (should not be updatable)
  delete (updateData as { id?: unknown }).id;
  if (data.name) {
    updateData.slug = slugify(data.name);
  }

  const category = await prisma.category.update({
    where: { id },
    data: updateData,
  });

  if (!category) {
    return null;
  }

  return mapPrismaCategory(category);
}

export async function deleteCategory(id: string): Promise<boolean> {
  await prisma.category.delete({
    where: { id },
  });
  return true;
}

// Link operations
export async function getLinksByCategory(
  categoryId: string,
  sortBy?: SortOrder,
): Promise<Link[]> {
  const links = await prisma.link.findMany({
    where: { categoryId },
    orderBy: getSortOrder(sortBy),
  });
  return links.map(mapPrismaLink);
}

export async function getLinkById(id: string): Promise<Link | null> {
  const link = await prisma.link.findUnique({
    where: { id },
  });
  if (!link) return null;
  return mapPrismaLink(link);
}

export async function createLink(data: {
  title: string;
  url: string;
  description?: string;
  icon?: string;
  categoryId: string;
}): Promise<Link> {
  const link = await prisma.link.create({
    data: {
      title: data.title,
      url: data.url,
      description: data.description,
      icon: data.icon,
      categoryId: data.categoryId,
    },
  });
  return mapPrismaLink(link);
}

export async function updateLink(
  id: string,
  data: Partial<{
    title: string;
    url: string;
    description?: string;
    icon?: string;
  }>,
): Promise<Link | null> {
  const updateData = { ...data };
  // Remove id from updateData if present (should not be updatable)
  delete (updateData as { id?: unknown }).id;
  const link = await prisma.link.update({
    where: { id },
    data: updateData,
  });
  return mapPrismaLink(link);
}

export async function deleteLink(id: string): Promise<boolean> {
  await prisma.link.delete({
    where: { id },
  });
  return true;
}

export async function incrementLinkClicks(id: string): Promise<void> {
  await prisma.link.update({
    where: { id },
    data: {
      clicks: { increment: 1 },
    },
  });
}

export async function searchLinks(query: string): Promise<Link[]> {
  const links = await prisma.link.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
  });
  return links.map(mapPrismaLink);
}

export async function searchLinksByCategory(
  query: string,
  categorySlug: string,
): Promise<Link[]> {
  const links = await prisma.link.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
      category: {
        slug: categorySlug,
      },
    },
  });
  return links.map(mapPrismaLink);
}

export async function searchLinksWithCategorySlug(
  query: string,
  categorySlug?: string,
): Promise<(Link & { categorySlug?: string })[]> {
  const links = await prisma.link.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
      ...(categorySlug && {
        category: {
          slug: categorySlug,
        },
      }),
    },
    include: {
      category: {
        select: { slug: true },
      },
    },
  });
  return links.map(l => ({
    ...mapPrismaLink(l),
    categorySlug: l.category?.slug,
  }));
}
