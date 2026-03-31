'use client';

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
      const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`, {
        credentials: 'include',
      });
      const responseJson = (await response.json().catch(() => null)) as
        | { data: SearchSuggestion[] }
        | { message: string }
        | null;

      if (!response.ok || !responseJson || !('data' in responseJson)) {
        toastMessage.error(
          responseJson && 'message' in responseJson
            ? responseJson.message
            : 'Failed to search companies',
        );
        setSuggestions([]);
        return;
      }

      setSuggestions(responseJson.data);
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
            const response = await fetch('/api/company/ensure', {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ symbol: suggestion.symbol }),
            });
            const responseJson = (await response.json().catch(() => null)) as
              | { data: null }
              | { message: string }
              | null;

            if (!response.ok || (!responseJson && response.status !== 200)) {
              toastMessage.error(
                responseJson && 'message' in responseJson
                  ? responseJson.message
                  : 'Failed to select company',
              );
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
