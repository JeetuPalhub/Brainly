import React from 'react';
import { FiSearch } from 'react-icons/fi';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  semanticMode: boolean;
  onSemanticModeChange: (enabled: boolean) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  semanticMode,
  onSemanticModeChange
}) => {
  const SearchIcon = FiSearch as React.ComponentType<{ className?: string }>;

  return (
    <div className="relative w-full">
      <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xl" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search your content..."
        className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <label className="mt-2 inline-flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
        <input
          type="checkbox"
          checked={semanticMode}
          onChange={(e) => onSemanticModeChange(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        Semantic search (AI)
      </label>
    </div>
  );
};

export default SearchBar;
