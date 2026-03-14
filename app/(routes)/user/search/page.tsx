'use client';

import { searchForCompanies } from '@/app/actions/user';
import { SearchBar } from '@/components/common';
import { SearchSuggestion } from '@/interfaces';
import { toastMessage } from '@/lib';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

function Page() {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { push } = useRouter();

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    try {
      const result = await searchForCompanies(query);
      if (!result.okay) {
        toastMessage.error(result.error.message);
        setSuggestions([]);
        return;
      }

      setSuggestions(result.data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    debounceTimeoutRef.current = setTimeout(() => {
      handleSearch(searchQuery.trim());
    }, 2000);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  return (
    <div className='min-h-screen w-full flex justify-center pt-[25vh]'>
      <div className='w-full max-w-2xl px-4'>
        <SearchBar
          placeholder='Search stocks, companies...'
          isLoading={isLoading}
          suggestions={suggestions}
          onSearch={setSearchQuery}
          onSuggestionSelect={(suggestion) => {
            push(`/user/dashboard/${suggestion.symbol}`);
          }}
        />
      </div>
    </div>
  );
}

export default Page;
