import { createContext, useContext, useState, useEffect } from 'react';
import { toWholesaleProduct, mergeCatalog, ADMIN_PRODUCTS_KEY } from '../data/products';
import { useAuth } from './AuthContext';

const ProductContext = createContext();

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const { getToken } = useAuth();

  const fetchProducts = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/products?limit=500', { cache: 'no-store' });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      // Always use DB data — no static fallback
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Could not fetch products from database:", err);
      setFetchError(err.message);
      setProducts([]); // Empty — do NOT fall back to static data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Returns the full product catalog for a given customer type,
  // merging any locally-stored admin products (pre-DB-sync).
  const getProductsForType = (customerType = 'retail') => {
    let adminProducts = [];
    try {
      const saved = localStorage.getItem(ADMIN_PRODUCTS_KEY);
      adminProducts = saved ? JSON.parse(saved) : [];
    } catch {
      adminProducts = [];
    }

    if (customerType === 'wholesale') {
      const wholesaleCatalog = products.map(toWholesaleProduct);
      return mergeCatalog(wholesaleCatalog, adminProducts);
    }
    return mergeCatalog(products, adminProducts);
  };

  // Derived helpers — all sourced from live DB data via getProductsForType
  const getProductById = (id, customerType = 'retail') =>
    getProductsForType(customerType).find(p => String(p.id) === String(id)) || null;

  const getProductsByCategory = (categoryId, customerType = 'retail') =>
    getProductsForType(customerType).filter(p => p.category === categoryId);

  const getBestsellers = (customerType = 'retail') =>
    getProductsForType(customerType).filter(p => p.isBestseller);

  const getDeals = (customerType = 'retail') =>
    getProductsForType(customerType).filter(p => p.discount >= 10);

  const searchProducts = (query, customerType = 'retail') => {
    const q = query.toLowerCase();
    return getProductsForType(customerType).filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.brand || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q)
    );
  };

  const addProduct = async (productData) => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (getToken) {
        const token = await getToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }
      const res = await fetch('/api/products', {
        method: 'POST',
        headers,
        body: JSON.stringify(productData)
      });
      if (res.ok) {
        await fetchProducts(); // Refresh list
        return true;
      }
    } catch (err) {
      console.error("Failed to add product via database API:", err);
    }
    return false;
  };

  return (
    <ProductContext.Provider value={{
      products,
      loading,
      fetchError,
      refreshProducts: fetchProducts,
      addProduct,
      getProductsForType,
      getProductById,
      getProductsByCategory,
      getBestsellers,
      getDeals,
      searchProducts
    }}>
      {children}
    </ProductContext.Provider>
  );
};
