'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Search as SearchIcon, KeyboardArrowDown } from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import { SearchSuggestion } from '@/interfaces';

interface SearchBarProps {
  placeholder?: string;
  suggestions?: SearchSuggestion[];
  onSearch?: (query: string) => void | Promise<void>;
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  className?: string;
  minCharsToSearch?: number;
  debounceMs?: number;
  isLoading?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  suggestions = [],
  onSearch,
  onSuggestionSelect,
  className = '',
  minCharsToSearch = 2,
  debounceMs = 300,
  isLoading = false,
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastSearchedRef = useRef('');

  const normalizedQuery = useMemo(() => query.trim(), [query]);

  const filteredSuggestions = useMemo(() => {
    if (query.trim() === '') {
      return suggestions;
    }

    const queryLower = query.toLowerCase();
    return suggestions.filter(
      (suggestion) =>
        suggestion.name.toLowerCase().includes(queryLower) ||
        suggestion.region?.toLowerCase().includes(queryLower),
    );
  }, [query, suggestions]);


  useEffect(() => {
    if (!onSearch || !isFocused) return;
    if (normalizedQuery.length < minCharsToSearch) return;
    if (normalizedQuery === lastSearchedRef.current) return;

    const timeoutId = setTimeout(async () => {
      try {
        await onSearch(normalizedQuery);
        lastSearchedRef.current = normalizedQuery;
      } catch {
        // parent handles error states
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [debounceMs, isFocused, minCharsToSearch, normalizedQuery, onSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.name);
    setIsFocused(false);
    onSuggestionSelect?.(suggestion);

    if (onSearch) {
      onSearch(suggestion.name);
      lastSearchedRef.current = suggestion.name;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (filteredSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev,
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredSuggestions.length) {
          handleSuggestionClick(filteredSuggestions[selectedIndex]);
          return;
        }

        if (normalizedQuery) {
          setIsFocused(false);
          onSearch?.(normalizedQuery);
          lastSearchedRef.current = normalizedQuery;
        }
        break;
      case 'Escape':
        setIsFocused(false);
        inputRef.current?.blur();
        break;
      default:
        break;
    }
  };

  const showDropdown =
    isFocused &&
    (filteredSuggestions.length > 0 ||
      (normalizedQuery.length >= minCharsToSearch && !isLoading));
  const showNoResults =
    isFocused &&
    normalizedQuery.length >= minCharsToSearch &&
    filteredSuggestions.length === 0 &&
    !isLoading;

  return (
    <div ref={containerRef} className={`relative w-full max-w-2xl ${className}`}>
      <div
        className={`
          flex items-center
          w-full
          border border-gray-300 rounded-2xl
          shadow-sm
          transition-all duration-200
          ${isFocused ? 'shadow-md border-gray-400' : 'hover:shadow-md hover:border-gray-400'}
          bg-white
        `}
      >
        <div className='pl-4 pr-2 text-gray-400'>
          <SearchIcon />
        </div>

        <input
          ref={inputRef}
          type='text'
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(-1);
            setIsFocused(true);
          }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className='flex-1 py-3 px-2 text-base outline-none bg-transparent text-gray-900 placeholder:text-gray-400'
        />

        {query && (
          <div className='mr-2 flex items-center'>
            {isLoading ? <CircularProgress size={24} className='text-blue-500' /> : null}
          </div>
        )}
      </div>

      {showDropdown && !isLoading && (
        <div
          ref={suggestionsRef}
          className='absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-2xl shadow-lg max-h-96 overflow-hidden z-50'
        >
          <div className='max-h-96 overflow-y-auto search-suggestions-scrollbar pr-1'>
            {showNoResults ? (
              <div className='px-4 py-8 text-center'>
                <div className='flex flex-col items-center justify-center gap-2'>
                  <SearchIcon className='text-gray-300 text-4xl' />
                  <div className='text-sm font-medium text-gray-600'>No results found</div>
                  <div className='text-xs text-gray-500 max-w-xs'>
                    Try searching with a different keyword or check your spelling
                  </div>
                </div>
              </div>
            ) : (
              filteredSuggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`
                    px-4 py-3 cursor-pointer transition-colors duration-150 flex items-center justify-between
                    ${index === selectedIndex ? 'bg-gray-100' : 'hover:bg-gray-50'}
                    ${index === 0 ? 'rounded-t-2xl' : ''}
                    ${index === filteredSuggestions.length - 1 ? 'rounded-b-2xl' : ''}
                  `}
                >
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2'>
                      <SearchIcon className='text-gray-400 text-sm' />
                      <span className='text-sm text-gray-900 truncate'>{suggestion.name}</span>
                    </div>
                    {suggestion.region && (
                      <div className='text-xs text-gray-500 mt-1 ml-6 truncate'>
                        {suggestion.region}
                      </div>
                    )}
                  </div>
                  {index === selectedIndex && (
                    <KeyboardArrowDown className='text-gray-400 text-sm rotate-180' />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
