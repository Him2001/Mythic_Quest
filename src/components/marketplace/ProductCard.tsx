import React from 'react';
import { MarketplaceItem } from '../../types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { Star, ShoppingCart, Coins, CreditCard, Tag, Sparkles } from 'lucide-react';

interface ProductCardProps {
  item: MarketplaceItem;
  userCoins: number;
  onBuyWithCoins: (item: MarketplaceItem) => void;
  onBuyWithCard: (item: MarketplaceItem) => void;
  onViewDetails: (item: MarketplaceItem) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  item,
  userCoins,
  onBuyWithCoins,
  onBuyWithCard,
  onViewDetails
}) => {
  const canAffordWithCoins = userCoins >= item.priceCoins;
  const discountedPriceUSD = item.discount ? item.priceUSD : item.priceUSD;
  const discountedPriceCoins = item.discount ? item.priceCoins : item.priceCoins;

  const getCategoryColor = (category: string): 'primary' | 'secondary' | 'accent' | 'success' | 'warning' => {
    const colorMap = {
      equipment: 'primary' as const,
      clothing: 'secondary' as const,
      supplements: 'accent' as const,
      accessories: 'success' as const,
      books: 'warning' as const
    };
    return colorMap[category as keyof typeof colorMap] || 'primary';
  };

  const getCategoryIcon = (category: string): string => {
    const iconMap = {
      equipment: '🏋️',
      clothing: '👕',
      supplements: '💊',
      accessories: '⚡',
      books: '📚'
    };
    return iconMap[category as keyof typeof iconMap] || '🛍️';
  };

  return (
    <Card 
      variant="hover" 
      className={`fantasy-card overflow-hidden ${item.featured ? 'border-4 border-amber-400 magical-glow' : ''}`}
    >
      {/* Product Image */}
      <div className="relative h-48 w-full -mx-5 -mt-5 mb-4 overflow-hidden">
        <img 
          src={item.imageUrl} 
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105 cursor-pointer"
          onClick={() => onViewDetails(item)}
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col space-y-1">
          {item.featured && (
            <Badge color="warning\" size="sm\" className="magical-glow animate-pulse">
              <Sparkles size={12} className="mr-1" />
              Featured
            </Badge>
          )}
          
          {item.discount && (
            <Badge color="error" size="sm" className="magical-glow">
              <Tag size={12} className="mr-1" />
              {item.discount.label}
            </Badge>
          )}
        </div>

        {/* Category Badge */}
        <div className="absolute top-2 right-2">
          <Badge color={getCategoryColor(item.category)} size="sm">
            <span className="mr-1">{getCategoryIcon(item.category)}</span>
            {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
          </Badge>
        </div>

        {/* Stock Status */}
        {!item.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge color="error" size="lg">
              Out of Stock
            </Badge>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-col h-full">
        <div className="mb-2">
          <h3 
            className="text-lg font-cinzel font-bold text-mystic-dark mb-1 cursor-pointer hover:text-amber-700 transition-colors"
            onClick={() => onViewDetails(item)}
          >
            {item.name}
          </h3>
          <p className="text-xs text-amber-600 font-cinzel font-medium">{item.brand}</p>
        </div>
        
        <p className="text-sm text-gray-700 mb-3 font-merriweather line-clamp-2 flex-grow">
          {item.description}
        </p>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={`${
                  i < Math.floor(item.rating) 
                    ? 'text-yellow-500 fill-current' 
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-600 font-merriweather">
            {item.rating} ({item.reviewCount})
          </span>
        </div>

        {/* Pricing */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <CreditCard size={16} className="text-green-600 mr-1" />
              <div className="flex items-center">
                {item.discount && (
                  <span className="text-sm text-gray-500 line-through mr-2 font-merriweather">
                    ${item.discount.originalPriceUSD}
                  </span>
                )}
                <span className="text-lg font-bold text-green-700 font-cinzel">
                  ${discountedPriceUSD}
                </span>
              </div>
            </div>
            
            {item.discount && (
              <Badge color="error" size="sm">
                -{item.discount.percentage}%
              </Badge>
            )}
          </div>

          <div className="flex items-center">
            <Coins size={16} className="text-amber-600 mr-1 magical-glow" />
            <div className="flex items-center">
              {item.discount && (
                <span className="text-sm text-gray-500 line-through mr-2 font-cinzel">
                  {item.discount.originalPriceCoins}
                </span>
              )}
              <span className={`text-lg font-bold font-cinzel ${canAffordWithCoins ? 'text-amber-700' : 'text-red-600'}`}>
                {discountedPriceCoins} Coins
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto space-y-2">
          {item.inStock ? (
            <>
              <Button
                variant="primary"
                fullWidth
                onClick={() => onBuyWithCoins(item)}
                disabled={!canAffordWithCoins}
                icon={<Coins size={16} />}
                className={`font-cinzel ${canAffordWithCoins ? 'magical-glow' : ''}`}
              >
                {canAffordWithCoins ? 'Buy with Coins' : 'Insufficient Coins'}
              </Button>
              
              <Button
                variant="outline"
                fullWidth
                onClick={() => onBuyWithCard(item)}
                icon={<CreditCard size={16} />}
                className="font-cinzel"
              >
                Buy with Card
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              fullWidth
              disabled
              className="font-cinzel"
            >
              Out of Stock
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;