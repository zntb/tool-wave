'use client';

import { Input } from '@/components/ui/input';

interface AdminSearchInputProps {
  className?: string;
  placeholder?: string;
  onSearch: (query: string) => void;
}

export function AdminSearchInput({
  placeholder = 'Search categories and links...',
  onSearch,
}: AdminSearchInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  return (
    <form onSubmit={e => e.preventDefault()} className='relative flex w-full'>
      <Input
        type='search'
        onChange={handleChange}
        placeholder={placeholder}
        className='flex-1 h-10 pl-10 pr-4'
      />
    </form>
  );
}
