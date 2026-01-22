'use client';
import { searchForCompanies } from '@/app/actions/user';
import { SearchBar } from '@/components/common';
import { SearchSuggestion } from '@/interfaces';
import { toastMessage } from '@/lib';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

function page() {
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleSearch = async(query: string) => {
        console.log('Searching:', query);
        setIsLoading(true);
        try {
            const suggestions = await searchForCompanies(query);
            if (!suggestions.okay) {
                toastMessage.error(suggestions.error.message);
                setSuggestions([]);
                return;
            }
            setSuggestions(suggestions.data);
        } finally {
            setIsLoading(false);
        }
    }

    // Debounce search with 2 seconds delay
    useEffect(() => {
        // Clear existing timeout
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        // Only search if query has at least 2 characters
        if (searchQuery.trim().length < 2) {
            setSuggestions([]);
            setIsLoading(false);
            return;
        }

        // Set new timeout for 2 seconds
        debounceTimeoutRef.current = setTimeout(() => {
            handleSearch(searchQuery.trim());
        }, 2000);

        // Cleanup function
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [searchQuery]);
    const {push}=useRouter()

  return (
    <div className="min-h-screen w-full flex justify-center pt-[25vh]">
      <div className="w-full max-w-2xl px-4">
        <SearchBar
          placeholder="Search stocks, companies..."
          isLoading={isLoading}
          suggestions={suggestions}
          onSearch={(query) => {
            setSearchQuery(query);
          }}
          onSuggestionSelect={(suggestion) =>{
            push(`/user/dashboard/${suggestion.symbol}`)
          }
          }
        />
      </div>
    </div>
  );
}

export default page;
