import React from 'react';
import { Filter, SortAsc, Search } from 'lucide-react';
import Button from '../ui/Button';

interface MarketplaceFiltersProps {
  selectedCategory: string;
  sortBy: string;
  searchQuery: string;
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: string) => void;
  onSearchChange: (query: string) => void;
}

const MarketplaceFilters: React.FC<MarketplaceFiltersProps> = ({
  selectedCategory,
  sortBy,
  searchQuery,
  onCategoryChange,
  onSortChange,
  onSearchChange
}) => {
  const categories = [
    { id: 'all', label: 'All Products', icon: '🛍️' },
    { id: 'equipment', label: 'Equipment', icon: '🏋️' },
    { id: 'clothing', label: 'Clothing', icon: '👕' },
    { id: 'supplements', label: 'Supplements', icon: '💊' },
    { id: 'accessories', label: 'Accessories', icon: '⚡' },
    { id: 'books', label: 'Books', icon: '📚' }
  ];

  const sortOptions = [
    { id: 'featured', label: 'Featured' },
    { id: 'price-low', label: 'Price: Low to High' },
    { id: 'price-high', label: 'Price: High to Low' },
    { id: 'rating', label: 'Highest Rated' },
    { id: 'newest', label: 'Newest' }
  ];

  return (
    <div className="mb-6 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search for wellness products..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:outline-none font-merriweather bg-white/80 backdrop-blur-sm"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Category Filters */}
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <Filter className="text-amber-600 mr-2" size={16} />
            <span className="font-cinzel font-bold text-amber-800">Categories</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onCategoryChange(category.id)}
                className="font-cinzel"
              >
                <span className="mr-2">{category.icon}</span>
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div className="md:w-64">
          <div className="flex items-center mb-2">
            <SortAsc className="text-amber-600 mr-2" size={16} />
            <span className="font-cinzel font-bold text-amber-800">Sort By</span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full p-2 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:outline-none font-merriweather bg-white/80 backdrop-blur-sm"
          >
            {sortOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceFilters;