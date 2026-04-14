'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
  isLoading?: boolean;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onClear, isLoading, value, ...props }, ref) => {
    const showClearButton = value && String(value).length > 0;

    return (
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="search"
          ref={ref}
          value={value}
          className={cn(
            'block w-full rounded-2xl border border-stone-300 bg-stone-50 py-3 pl-10 pr-10 text-sm text-stone-900 shadow-sm transition',
            'placeholder:text-stone-400 focus:border-stone-950 focus:bg-white focus:outline-none',
            'dark:border-stone-700 dark:bg-stone-950/70 dark:text-stone-50 dark:placeholder:text-stone-500',
            'dark:focus:border-stone-100 dark:focus:bg-stone-900',
            className
          )}
          {...props}
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-stone-500 border-t-transparent dark:border-stone-300"></div>
          </div>
        )}
        {showClearButton && !isLoading && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export default SearchInput;
