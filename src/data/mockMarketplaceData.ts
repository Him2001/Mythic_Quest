import { MarketplaceItem } from '../types';

export const mockMarketplaceItems: MarketplaceItem[] = [
  // Equipment
  {
    id: 'eq-001',
    name: 'Mystic Yoga Mat',
    description: 'Premium eco-friendly yoga mat with mystical mandala design. Non-slip surface perfect for meditation and yoga practice.',
    imageUrl: 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'equipment',
    brand: 'ZenFlow',
    priceUSD: 89.99,
    priceCoins: 450,
    discount: {
      percentage: 20,
      originalPriceUSD: 112.49,
      originalPriceCoins: 562,
      label: 'Limited Time'
    },
    rating: 4.8,
    reviewCount: 234,
    inStock: true,
    featured: true,
    tags: ['yoga', 'meditation', 'eco-friendly'],
    specifications: {
      'Material': 'Natural Rubber',
      'Thickness': '6mm',
      'Size': '72" x 24"',
      'Weight': '2.5 lbs'
    }
  },
  {
    id: 'eq-002',
    name: 'Enchanted Resistance Bands Set',
    description: 'Complete resistance training set with 5 bands of varying resistance levels. Perfect for strength training anywhere.',
    imageUrl: 'https://images.pexels.com/photos/4162449/pexels-photo-4162449.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'equipment',
    brand: 'PowerMystic',
    priceUSD: 34.99,
    priceCoins: 175,
    rating: 4.6,
    reviewCount: 189,
    inStock: true,
    featured: false,
    tags: ['strength', 'portable', 'home-gym'],
    specifications: {
      'Bands Included': '5',
      'Resistance Levels': 'Light to Extra Heavy',
      'Material': 'Natural Latex',
      'Accessories': 'Door anchor, handles, ankle straps'
    }
  },
  {
    id: 'eq-003',
    name: 'Crystal Meditation Cushion',
    description: 'Handcrafted meditation cushion filled with organic buckwheat hulls. Promotes proper posture during meditation.',
    imageUrl: 'https://images.pexels.com/photos/3822864/pexels-photo-3822864.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'equipment',
    brand: 'Sacred Space',
    priceUSD: 67.50,
    priceCoins: 338,
    rating: 4.9,
    reviewCount: 156,
    inStock: true,
    featured: true,
    tags: ['meditation', 'organic', 'handcrafted'],
    specifications: {
      'Fill': 'Organic Buckwheat Hulls',
      'Cover': 'Organic Cotton',
      'Diameter': '16 inches',
      'Height': '6 inches'
    }
  },

  // Clothing
  {
    id: 'cl-001',
    name: 'Warrior\'s Athletic Leggings',
    description: 'High-performance leggings with moisture-wicking fabric and compression support. Perfect for any workout.',
    imageUrl: 'https://images.pexels.com/photos/8436735/pexels-photo-8436735.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'clothing',
    brand: 'MysticFit',
    priceUSD: 78.00,
    priceCoins: 390,
    discount: {
      percentage: 15,
      originalPriceUSD: 91.76,
      originalPriceCoins: 459,
      label: 'New Arrival'
    },
    rating: 4.7,
    reviewCount: 312,
    inStock: true,
    featured: true,
    tags: ['activewear', 'compression', 'moisture-wicking'],
    specifications: {
      'Material': '78% Polyester, 22% Spandex',
      'Features': 'High waist, side pockets',
      'Sizes': 'XS - XXL',
      'Care': 'Machine wash cold'
    }
  },
  {
    id: 'cl-002',
    name: 'Zen Master Hoodie',
    description: 'Ultra-soft organic cotton hoodie with inspirational mandala print. Perfect for post-workout comfort.',
    imageUrl: 'https://images.pexels.com/photos/8436736/pexels-photo-8436736.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'clothing',
    brand: 'Peaceful Threads',
    priceUSD: 95.00,
    priceCoins: 475,
    rating: 4.5,
    reviewCount: 198,
    inStock: true,
    featured: false,
    tags: ['organic', 'comfort', 'casual'],
    specifications: {
      'Material': '100% Organic Cotton',
      'Print': 'Water-based eco-friendly ink',
      'Fit': 'Relaxed',
      'Sizes': 'S - XXL'
    }
  },

  // Supplements
  {
    id: 'sp-001',
    name: 'Mystic Energy Blend',
    description: 'Natural energy supplement with adaptogenic herbs. Boosts energy and mental clarity without jitters.',
    imageUrl: 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'supplements',
    brand: 'HerbalMystic',
    priceUSD: 49.99,
    priceCoins: 250,
    rating: 4.4,
    reviewCount: 267,
    inStock: true,
    featured: true,
    tags: ['energy', 'adaptogenic', 'natural'],
    specifications: {
      'Serving Size': '2 capsules',
      'Servings Per Container': '30',
      'Key Ingredients': 'Rhodiola, Ashwagandha, Ginseng',
      'Certifications': 'Organic, Non-GMO'
    }
  },
  {
    id: 'sp-002',
    name: 'Serenity Sleep Formula',
    description: 'Natural sleep aid with melatonin and calming herbs. Promotes restful sleep and recovery.',
    imageUrl: 'https://images.pexels.com/photos/4041391/pexels-photo-4041391.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'supplements',
    brand: 'DreamWell',
    priceUSD: 32.50,
    priceCoins: 163,
    rating: 4.6,
    reviewCount: 445,
    inStock: true,
    featured: false,
    tags: ['sleep', 'recovery', 'melatonin'],
    specifications: {
      'Serving Size': '1 capsule',
      'Servings Per Container': '60',
      'Key Ingredients': 'Melatonin, Valerian Root, Chamomile',
      'Timing': 'Take 30 minutes before bed'
    }
  },

  // Accessories
  {
    id: 'ac-001',
    name: 'Crystal Water Bottle',
    description: 'Borosilicate glass water bottle with genuine crystal chamber. Infuse your water with positive energy.',
    imageUrl: 'https://images.pexels.com/photos/4041390/pexels-photo-4041390.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'accessories',
    brand: 'CrystalFlow',
    priceUSD: 56.00,
    priceCoins: 280,
    discount: {
      percentage: 25,
      originalPriceUSD: 74.67,
      originalPriceCoins: 373,
      label: 'Flash Sale'
    },
    rating: 4.8,
    reviewCount: 189,
    inStock: true,
    featured: true,
    tags: ['hydration', 'crystal', 'glass'],
    specifications: {
      'Capacity': '18 oz',
      'Material': 'Borosilicate Glass',
      'Crystal': 'Rose Quartz',
      'Features': 'Leak-proof, BPA-free'
    }
  },
  {
    id: 'ac-002',
    name: 'Mindfulness Journal',
    description: 'Beautiful leather-bound journal with guided prompts for daily reflection and gratitude practice.',
    imageUrl: 'https://images.pexels.com/photos/4041389/pexels-photo-4041389.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'accessories',
    brand: 'Mindful Pages',
    priceUSD: 28.99,
    priceCoins: 145,
    rating: 4.9,
    reviewCount: 523,
    inStock: true,
    featured: false,
    tags: ['journaling', 'mindfulness', 'leather'],
    specifications: {
      'Pages': '200',
      'Size': '5.5" x 8.5"',
      'Cover': 'Genuine Leather',
      'Features': 'Guided prompts, ribbon bookmark'
    }
  },

  // Books
  {
    id: 'bk-001',
    name: 'The Warrior\'s Path to Wellness',
    description: 'Comprehensive guide to holistic health combining ancient wisdom with modern science.',
    imageUrl: 'https://images.pexels.com/photos/4041388/pexels-photo-4041388.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'books',
    brand: 'Wisdom Press',
    priceUSD: 24.95,
    priceCoins: 125,
    rating: 4.7,
    reviewCount: 1247,
    inStock: true,
    featured: true,
    tags: ['wellness', 'guide', 'holistic'],
    specifications: {
      'Pages': '320',
      'Format': 'Paperback',
      'Author': 'Dr. Sarah Mystic',
      'Publisher': 'Wisdom Press'
    }
  },
  {
    id: 'bk-002',
    name: 'Meditation Mastery',
    description: 'Step-by-step guide to developing a consistent meditation practice with 50+ techniques.',
    imageUrl: 'https://images.pexels.com/photos/4041387/pexels-photo-4041387.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'books',
    brand: 'Inner Peace Publishing',
    priceUSD: 19.99,
    priceCoins: 100,
    rating: 4.8,
    reviewCount: 892,
    inStock: true,
    featured: false,
    tags: ['meditation', 'techniques', 'practice'],
    specifications: {
      'Pages': '256',
      'Format': 'Paperback',
      'Author': 'Master Chen',
      'Includes': 'Audio meditation guide'
    }
  }
];

export const featuredPromotions = [
  {
    id: 'promo-001',
    title: 'New Year Wellness Sale',
    description: 'Up to 25% off all equipment and accessories',
    imageUrl: 'https://images.pexels.com/photos/3822864/pexels-photo-3822864.jpeg?auto=compress&cs=tinysrgb&w=1200',
    discount: '25% OFF',
    validUntil: '2024-02-15',
    featured: true
  },
  {
    id: 'promo-002',
    title: 'Mindfulness Bundle',
    description: 'Complete meditation starter kit with exclusive savings',
    imageUrl: 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=1200',
    discount: 'Save $50',
    validUntil: '2024-02-28',
    featured: true
  }
];