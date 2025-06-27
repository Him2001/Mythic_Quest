import React from 'react';
import { MarketplaceItem } from '../../types';
import ProductCard from './ProductCard';
import { Package, Search } from 'lucide-react';

interface ProductGridProps {
  items: MarketplaceItem[];
  userCoins: number;
  onBuyWithCoins: (item: MarketplaceItem) => void;
  onBuyWithCard: (item: MarketplaceItem) => void;
  onViewDetails: (item: MarketplaceItem) => void;
  isLoading?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  items,
  userCoins,
  onBuyWithCoins,
  onBuyWithCard,
  onViewDetails,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="fantasy-card animate-pulse">
            <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <Search className="mx-auto mb-4 text-gray-400" size={48} />
        <h3 className="text-xl font-cinzel font-bold text-gray-600 mb-2">
          No Products Found
        </h3>
        <p className="text-gray-500 font-merriweather">
          Try adjusting your filters or search terms to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Package className="text-amber-600 mr-2" size={20} />
          <span className="font-cinzel font-bold text-amber-800">
            {items.length} Products Found
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <ProductCard
            key={item.id}
            item={item}
            userCoins={userCoins}
            onBuyWithCoins={onBuyWithCoins}
            onBuyWithCard={onBuyWithCard}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;