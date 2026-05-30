import { useSearchParams } from 'react-router-dom';
import { categories } from '../data/categories';
import { getProducts, getProductsByCategory } from '../data/products';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import './Categories.css';

const Categories = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCat = searchParams.get('cat') || '';

  const filteredProducts = activeCat
    ? getProductsByCategory(activeCat)
    : getProducts();

  const activeCategory = categories.find(c => c.id === activeCat);

  return (
    <div className="page-wrapper">
      <div className="categories">
        {/* Sidebar */}
        <aside className="categories__sidebar hide-scrollbar">
          <button
            className={`categories__sidebar-item ${!activeCat ? 'categories__sidebar-item--active' : ''}`}
            onClick={() => setSearchParams({})}
          >
            <span className="categories__sidebar-emoji">🏪</span>
            <span className="categories__sidebar-name">All</span>
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`categories__sidebar-item ${activeCat === cat.id ? 'categories__sidebar-item--active' : ''}`}
              onClick={() => setSearchParams({ cat: cat.id })}
              id={`sidebar-${cat.id}`}
            >
              <span className="categories__sidebar-emoji">{cat.emoji}</span>
              <span className="categories__sidebar-name">{cat.name}</span>
            </button>
          ))}
        </aside>

        {/* Content */}
        <div className="categories__content">
          <h1 className="categories__heading">
            {activeCategory ? activeCategory.name : 'All Products'}
            <span className="categories__count">
              {filteredProducts.length} items
            </span>
          </h1>

          {!activeCat && (
            <div className="categories__cat-grid">
              {categories.map(cat => (
                <CategoryCard key={cat.id} category={cat} size="large" />
              ))}
            </div>
          )}

          <div className="categories__grid">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="categories__empty">
              <span className="categories__empty-emoji">📦</span>
              <p>No products found in this category</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;
