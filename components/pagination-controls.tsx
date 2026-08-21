import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  buildUrl: (pageNum: number) => string;
}

export function PaginationControls({
  page,
  totalPages,
  buildUrl,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  return (
    <Pagination className='mt-8'>
      <PaginationContent>
        {page > 1 && (
          <PaginationItem>
            <PaginationPrevious href={buildUrl(page - 1)} />
          </PaginationItem>
        )}

        {/* First page */}
        <PaginationItem>
          <PaginationLink href={buildUrl(1)} isActive={page === 1}>
            1
          </PaginationLink>
        </PaginationItem>

        {/* Ellipsis if needed */}
        {page > 3 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {/* Previous page */}
        {page > 2 && (
          <PaginationItem>
            <PaginationLink href={buildUrl(page - 1)}>
              {page - 1}
            </PaginationLink>
          </PaginationItem>
        )}

        {/* Current page */}
        {page !== 1 && page !== totalPages && (
          <PaginationItem>
            <PaginationLink href={buildUrl(page)} isActive>
              {page}
            </PaginationLink>
          </PaginationItem>
        )}

        {/* Next page */}
        {page < totalPages - 1 && (
          <PaginationItem>
            <PaginationLink href={buildUrl(page + 1)}>
              {page + 1}
            </PaginationLink>
          </PaginationItem>
        )}

        {/* Ellipsis if needed */}
        {page < totalPages - 2 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {/* Last page */}
        {totalPages > 1 && (
          <PaginationItem>
            <PaginationLink
              href={buildUrl(totalPages)}
              isActive={page === totalPages}
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        )}

        {page < totalPages && (
          <PaginationItem>
            <PaginationNext href={buildUrl(page + 1)} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}
