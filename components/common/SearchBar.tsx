'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Search as SearchIcon, KeyboardArrowDown } from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import { SearchSuggestion } from '@/interfaces';

interface SearchBarProps {
  placeholder?: string;
  suggestions?: SearchSuggestion[];
  /**
   * Called when the user types (debounced) and when they submit (Enter/button).
   * Parent should fetch and then update `suggestions` prop.
   */
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
  const [filteredSuggestions, setFilteredSuggestions] = useState<
    SearchSuggestion[]
  >([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastSearchedRef = useRef<string>('');

  // Filter suggestions based on query
  useEffect(() => {
    if (query.trim() === '') {
      setFilteredSuggestions(suggestions);
    } else {
      const filtered = suggestions.filter(
        (suggestion) =>
          suggestion.name.toLowerCase().includes(query.toLowerCase()) ||
          suggestion.region?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    }
    setSelectedIndex(-1);
  }, [query, suggestions]);

  const normalizedQuery = useMemo(() => query.trim(), [query]);

  // Trigger search on typing (debounced)
  useEffect(() => {
    if (!onSearch) return;
    if (!isFocused) return;
    if (normalizedQuery.length < minCharsToSearch) return;
    if (normalizedQuery === lastSearchedRef.current) return;

    const t = setTimeout(async () => {
      try {
        await onSearch(normalizedQuery);
        lastSearchedRef.current = normalizedQuery;
      } catch {
        // parent can handle errors; suggestions just won't update
      }
    }, debounceMs);

    return () => clearTimeout(t);
  }, [debounceMs, isFocused, minCharsToSearch, normalizedQuery, onSearch]);

  // Handle click outside
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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsFocused(true);
  };

  const handleInputFocus = () => {
    setIsFocused(true);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.name);
    setIsFocused(false);
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
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
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
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
        } else if (normalizedQuery) {
          setIsFocused(false);
          if (onSearch) {
            onSearch(normalizedQuery);
            lastSearchedRef.current = normalizedQuery;
          }
        }
        break;
      case 'Escape':
        setIsFocused(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSearch = () => {
    if (normalizedQuery) {
      setIsFocused(false);
      if (onSearch) {
        onSearch(normalizedQuery);
        lastSearchedRef.current = normalizedQuery;
      }
    }
  };

  const showDropdown = isFocused && (filteredSuggestions.length > 0 || (normalizedQuery.length >= minCharsToSearch && !isLoading));
  const showNoResults = isFocused && normalizedQuery.length >= minCharsToSearch && filteredSuggestions.length === 0 && !isLoading;

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-2xl ${className}`}
    >
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
        {/* Search Icon */}
        <div className="pl-4 pr-2 text-gray-400">
          <SearchIcon />
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="
            flex-1
            py-3 px-2
            text-base
            outline-none
            bg-transparent
            text-gray-900
            placeholder:text-gray-400
          "
        />

        {/* Loading Spinner or Search Button */}
        {query && (
          <div className="mr-2 flex items-center">
            {isLoading ? (
              <CircularProgress size={24} className="text-blue-500" />
            ) : (
              null
            )}
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showDropdown && !isLoading && (
        <div
          ref={suggestionsRef}
          className="
            absolute
            top-full mt-1
            w-full
            bg-white
            border border-gray-200
            rounded-2xl
            shadow-lg
            max-h-96
            overflow-hidden
            z-50
          "
        >
          <div className="max-h-96 overflow-y-auto search-suggestions-scrollbar pr-1">
            {showNoResults ? (
              <div className="px-4 py-8 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <SearchIcon className="text-gray-300 text-4xl" />
                  <div className="text-sm font-medium text-gray-600">
                    No results found
                  </div>
                  <div className="text-xs text-gray-500 max-w-xs">
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
                    px-4 py-3
                    cursor-pointer
                    transition-colors duration-150
                    flex items-center justify-between
                    ${index === selectedIndex ? 'bg-gray-100' : 'hover:bg-gray-50'}
                    ${index === 0 ? 'rounded-t-2xl' : ''}
                    ${
                      index === filteredSuggestions.length - 1 ? 'rounded-b-2xl' : ''
                    }
                  `}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <SearchIcon className="text-gray-400 text-sm" />
                      <span className="text-sm text-gray-900 truncate">
                        {suggestion.name}
                      </span>
                    </div>
                    {suggestion.region && (
                      <div className="text-xs text-gray-500 mt-1 ml-6 truncate">
                        {suggestion.region}
                      </div>
                    )}
                  </div>
                  {index === selectedIndex && (
                    <KeyboardArrowDown className="text-gray-400 text-sm rotate-180" />
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
