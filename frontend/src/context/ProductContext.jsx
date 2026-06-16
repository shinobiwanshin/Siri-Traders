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
      const res = await fetch('/api/products');
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

  const getProductsForType = (customerType = 'retail') => {
    // Local admin-added products (from admin panel, before DB sync)
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
    <ProductContext.Provider value={{ products, loading, fetchError, refreshProducts: fetchProducts, addProduct, getProductsForType }}>
      {children}
    </ProductContext.Provider>
  );
};
