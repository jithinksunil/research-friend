'use client';

import { ensureCompanyFromSearch, searchForCompanies } from '@/app/actions/user';
import { SearchBar } from '@/components/common';
import { SearchSuggestion } from '@/interfaces';
import { toastMessage } from '@/lib';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function Page() {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { push } = useRouter();

  const handleSearch = async (query: string) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

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

  return (
    <div className="min-h-screen w-full flex justify-center pt-[25vh]">
      <div className="w-full max-w-2xl px-4">
        <SearchBar
          placeholder="Search stocks, companies..."
          isLoading={isLoading}
          suggestions={suggestions}
          onSearch={handleSearch}
          onSuggestionSelect={async (suggestion) => {
            const result = await ensureCompanyFromSearch(suggestion.symbol);
            if (!result.okay) {
              toastMessage.error(result.error.message);
              return;
            }
            push(`/user/dashboard/${suggestion.symbol}`);
          }}
        />
      </div>
    </div>
  );
}

export default Page;
