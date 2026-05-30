// Categories data for Siri Traders
// Realistic remote images are used for category tiles.

export const categories = [
  {
    id: 'fruits-vegetables',
    name: 'Fruits & Vegetables',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&q=80',
    color: '#E8F5E9',
    itemCount: 8
  },
  {
    id: 'dairy-breakfast',
    name: 'Dairy & Breakfast',
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=300&q=80',
    color: '#FFF8E1',
    itemCount: 7
  },
  {
    id: 'snacks-munchies',
    name: 'Snacks & Munchies',
    image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=300&q=80',
    color: '#FFF3E0',
    itemCount: 5
  },
  {
    id: 'beverages',
    name: 'Beverages',
    image: 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?w=300&q=80',
    color: '#E3F2FD',
    itemCount: 5
  },
  {
    id: 'bakery-biscuits',
    name: 'Bakery & Biscuits',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&q=80',
    color: '#EFEBE9',
    itemCount: 5
  },
  {
    id: 'personal-care',
    name: 'Personal Care',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=300&q=80',
    color: '#F3E5F5',
    itemCount: 5
  },
  {
    id: 'cleaning-household',
    name: 'Cleaning & Household',
    image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=300&q=80',
    color: '#E0F7FA',
    itemCount: 5
  },
  {
    id: 'rice-atta',
    name: 'Rice & Atta',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&q=80',
    color: '#FFF9C4',
    itemCount: 4
  },
  {
    id: 'masala-oils',
    name: 'Masala & Oils',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&q=80',
    color: '#FFCCBC',
    itemCount: 5
  },
  {
    id: 'instant-frozen',
    name: 'Instant & Frozen',
    image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=300&q=80',
    color: '#E8EAF6',
    itemCount: 5
  }
];

export const getCategoryById = (id) => categories.find(c => c.id === id);
export const getCategoryByName = (name) => categories.find(c => c.name === name);
