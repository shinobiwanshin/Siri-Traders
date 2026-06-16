import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiBarChart2,
  FiEdit2,
  FiCreditCard,
  FiGift,
  FiLock,
  FiLogOut,
  FiPackage,
  FiPlus,
  FiSave,
  FiSearch,
  FiTag,
  FiShoppingBag,
  FiTrash2,
  FiTruck,
  FiUsers,
  FiX
} from 'react-icons/fi';
import { getAccounts, useAuth } from '../context/AuthContext';
import { getProducts as getAllProducts } from '../data/products';
import { categories } from '../data/categories';
import { formatPrice } from '../utils/format';
import { toWebpImage } from '../utils/images';
import { getAdminAccounts, getAdminSession, logoutAdmin, saveAdminAccounts, savePendingAdminAccount } from '../utils/adminAuth';
import { getUserStorageKey } from '../utils/userStorage';
import './Admin.css';

const ADMIN_PRODUCTS_RETAIL_KEY = 'siri-admin-products-retail';
const ADMIN_PRODUCTS_WHOLESALE_KEY = 'siri-admin-products-wholesale';
const ADMIN_OFFERS_KEY = 'siri-admin-offers';
const ADMIN_COUPONS_KEY = 'siri-admin-coupons';

const readStorage = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

const writeStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const blankProduct = {
  id: '',
  name: '',
  category: 'fruits-vegetables',
  brand: '',
  weight: '',
  unit: 'g',
  price: '',
  mrp: '',
  discount: '',
  image: '',
  description: '',
  inStock: true,
  stockNote: 'In stock',
  deliveryTime: '10 mins',
  isBestseller: false
};

const blankWholesaleProduct = {
  id: '',
  name: '',
  category: 'fruits-vegetables',
  brand: '',
  weight: '',
  unit: 'kg',
  price: '',
  mrp: '',
  discount: '',
  image: '',
  description: '',
  inStock: true,
  stockNote: 'In stock',
  deliveryTime: 'Same day',
  isBestseller: false,
  wholesalePrice: '',
  bulkPackLabel: '',
  bulkPackPrice: '',
  wholesaleCaseLabel: '',
  wholesaleCasePrice: ''
};

const blankOffer = {
  id: '',
  title: '',
  subtitle: '',
  badge: '',
  price: '',
  mrp: '',
  image: '',
  group: 'daily',
  type: 'Sale offer',
  link: '/categories',
  active: true
};

const blankCoupon = {
  id: '',
  code: '',
  discount: '',
  limit: '',
  active: true
};

const blankAdmin = {
  name: '',
  email: '',
  password: '',
  role: 'Manager'
};

const sampleCustomers = [
  {
    name: 'Ravi Kumar',
    email: 'ravi.kumar@example.com',
    phone: '+91 98765 43210',
    address: 'Hitech City, Hyderabad, 500081',
    orders: 6,
    interest: 'Fresh vegetables',
    bought: 'Fresh Tomatoes, Red Onions, Aashirvaad Atta',
    purchases: [
      { item: 'Fresh Tomatoes', quantity: '20 kg', cost: 2000 },
      { item: 'Red Onions', quantity: '10 kg', cost: 650 },
      { item: 'Aashirvaad Atta', quantity: '2 packs', cost: 190 }
    ],
    totalSpent: 2840
  },
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '+91 91234 56780',
    address: 'Kukatpally, Hyderabad, 500072',
    orders: 4,
    interest: 'Dairy and breakfast',
    bought: 'Amul Milk, Bread, Eggs, Butter',
    purchases: [
      { item: 'Amul Milk', quantity: '12 L', cost: 720 },
      { item: 'Bread', quantity: '6 packs', cost: 270 },
      { item: 'Eggs', quantity: '5 trays', cost: 625 },
      { item: 'Butter', quantity: '2 packs', cost: 150 }
    ],
    totalSpent: 1765
  },
  {
    name: 'Mohammed Imran',
    email: 'imran.m@example.com',
    phone: '+91 99887 76655',
    address: 'Madhapur, Hyderabad, 500081',
    orders: 8,
    interest: 'Rice and atta',
    bought: 'Basmati Rice, Sugar, Cooking Oil',
    purchases: [
      { item: 'Basmati Rice', quantity: '25 kg', cost: 2500 },
      { item: 'Sugar', quantity: '12 kg', cost: 600 },
      { item: 'Cooking Oil', quantity: '8 L', cost: 1020 }
    ],
    totalSpent: 4120
  }
];

const demoOrders = [
  {
    id: 'ORD-1024',
    customer: 'Mounindra Pullepu',
    item: 'Green Capsicum, Fresh Tomatoes',
    quantity: '8 kg total',
    cost: 344,
    status: 'Successfully delivered',
    timelineLabel: 'Delivered',
    timeline: '29 May 2026, 6:35 PM'
  },
  {
    id: 'ORD-1025',
    customer: 'Ravi Kumar',
    item: 'Fresh Tomatoes',
    quantity: '20 kg',
    cost: 2000,
    status: 'Successfully delivered',
    timelineLabel: 'Delivered',
    timeline: '29 May 2026, 4:10 PM'
  },
  {
    id: 'ORD-1026',
    customer: 'Priya Sharma',
    item: 'Amul Milk, Eggs',
    quantity: '12 L + 5 trays',
    cost: 1345,
    status: 'Successfully delivered',
    timelineLabel: 'Delivered',
    timeline: '28 May 2026, 8:20 PM'
  },
  {
    id: 'ORD-1027',
    customer: 'Mohammed Imran',
    item: 'Basmati Rice, Cooking Oil',
    quantity: '25 kg + 8 L',
    cost: 3520,
    status: 'Yet to be delivered',
    timelineLabel: 'Expected',
    timeline: '30 May 2026, 11:00 AM'
  },
  {
    id: 'ORD-1028',
    customer: 'Sai',
    item: 'Fresh Bananas, Red Onions',
    quantity: '6 kg + 5 kg',
    cost: 690,
    status: 'Yet to be delivered',
    timelineLabel: 'Expected',
    timeline: '30 May 2026, 2:30 PM'
  }
];

const demoPayments = [
  {
    billNo: 'BILL-7821',
    orderId: 'ORD-1024',
    customer: 'Mounindra Pullepu',
    method: 'UPI',
    transactionId: 'UPI-SIRI-829104',
    subtotal: 344,
    deliveryFee: 0,
    paid: 344,
    status: 'Paid'
  },
  {
    billNo: 'BILL-7822',
    orderId: 'ORD-1025',
    customer: 'Ravi Kumar',
    method: 'Card',
    transactionId: 'CARD-SIRI-492018',
    subtotal: 2000,
    deliveryFee: 0,
    paid: 2000,
    status: 'Paid'
  },
  {
    billNo: 'BILL-7823',
    orderId: 'ORD-1026',
    customer: 'Priya Sharma',
    method: 'Cash on delivery',
    transactionId: 'COD-SIRI-730245',
    subtotal: 1345,
    deliveryFee: 20,
    paid: 1365,
    status: 'Paid'
  }
];

const csvEscape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const downloadCsv = (filename, rows) => {
  const csv = rows.map(row => row.map(csvEscape).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const getStoredList = (key) => {
  try {
    const saved = key ? localStorage.getItem(key) : null;
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const Admin = () => {
  const navigate = useNavigate();
  const { user, isLoaded, getToken } = useAuth();
  const [adminSession, setAdminSession] = useState(() => getAdminSession());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [adminMode, setAdminMode] = useState('retail'); // 'retail' | 'wholesale'
  const [searchQuery, setSearchQuery] = useState('');
  const [productSaving, setProductSaving] = useState(false);
  const [productError, setProductError] = useState(null);

  // ── DB-backed product state ──
  const [retailProducts, setRetailProducts] = useState([]);
  const [wholesaleProducts, setWholesaleProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // ── DB-backed orders state ──
  const [liveOrders, setLiveOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [orderStatusUpdating, setOrderStatusUpdating] = useState(null); // orderId being updated

  // Helper: fetch all products from DB and split by category/type
  const loadDbProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const res = await fetch('/api/products?limit=100');
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      const withNote = (p) => ({ ...p, stockNote: p.inStock ? 'In stock' : 'Out of stock' });
      // Wholesale products have a wholesalePrice field; everything else is retail
      setRetailProducts(data.filter(p => !p.wholesalePrice).map(withNote));
      setWholesaleProducts(data.filter(p => p.wholesalePrice).map(withNote));
    } catch (err) {
      console.error('Failed to load products from DB:', err);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => { loadDbProducts(); }, [loadDbProducts]);

  // Helper: returns Authorization header with current Clerk JWT
  const authHeader = useCallback(async () => {
    if (!getToken) return {};
    try {
      const token = await getToken();
      return token ? { 'Authorization': `Bearer ${token}` } : {};
    } catch {
      return {};
    }
  }, [getToken]);

  // Helper: fetch all orders from admin endpoint
  const loadAdminOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const headers = await authHeader();
      const res = await fetch('/api/admin/orders', { headers });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      setLiveOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  }, [authHeader]);

  useEffect(() => { loadAdminOrders(); }, [loadAdminOrders]);

  // Update a single order's status via PATCH /api/admin/orders?id=<id>
  const updateOrderStatus = async (orderId, newStatus) => {
    setOrderStatusUpdating(orderId);
    // Optimistic update
    setLiveOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    try {
      const headers = { 'Content-Type': 'application/json', ...(await authHeader()) };
      const res = await fetch(`/api/admin/orders?id=${orderId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error(`PATCH failed: ${res.status}`);
    } catch (err) {
      console.error('updateOrderStatus error:', err);
      // Revert on failure
      await loadAdminOrders();
    } finally {
      setOrderStatusUpdating(null);
    }
  };

  const [offers, setOffers] = useState(() => readStorage(ADMIN_OFFERS_KEY, [
    { id: 'offer-1', title: 'Festive Grocery Sale', subtitle: 'Up to 25% off on essentials', badge: 'Live', price: 299, mrp: 399, group: 'festival', type: 'Festive offer', link: '/categories', active: true },
    { id: 'offer-2', title: 'Daily Breakfast Combo', subtitle: 'Milk + bread + eggs', badge: 'Today', price: 149, mrp: 188, group: 'daily', type: 'Daily offer', link: '/categories?cat=dairy-breakfast', active: true }
  ]));
  const [coupons, setCoupons] = useState(() => readStorage(ADMIN_COUPONS_KEY, [
    { id: 'coupon-1', code: 'SIRI20', discount: '20% off up to Rs100', limit: 'Orders above Rs399', active: true },
    { id: 'coupon-2', code: 'FESTIVE30', discount: '30% off up to Rs120', limit: 'Festival orders', active: true }
  ]));
  const [productDraft, setProductDraft] = useState(blankProduct);
  const [offerDraft, setOfferDraft] = useState(blankOffer);
  const [couponDraft, setCouponDraft] = useState(blankCoupon);
  const [adminAccounts, setAdminAccounts] = useState(() => getAdminAccounts());
  const [adminDraft, setAdminDraft] = useState(blankAdmin);
  const [contentSearch, setContentSearch] = useState('');

  // ── Offers/coupons persist functions (still localStorage) ──
  const persistOffers = (nextOffers) => {
    setOffers(nextOffers);
    writeStorage(ADMIN_OFFERS_KEY, nextOffers);
  };

  const persistCoupons = (nextCoupons) => {
    setCoupons(nextCoupons);
    writeStorage(ADMIN_COUPONS_KEY, nextCoupons);
  };

  // ── Switch mode and reset draft to appropriate blank ──
  const switchMode = (mode) => {
    setAdminMode(mode);
    setProductDraft(mode === 'wholesale' ? blankWholesaleProduct : blankProduct);
  };

  const customers = useMemo(() => {
    const realCustomers = getAccounts().map(account => {
      const orders = getStoredList(getUserStorageKey(account, 'orders'));
      const addresses = getStoredList(getUserStorageKey(account, 'addresses'));
      const boughtItems = orders.flatMap(order => order.items || []);
      const itemNames = [...new Set(boughtItems.map(item => item.name).filter(Boolean))];
      const purchases = boughtItems.map(item => {
        const quantity = Number(item.quantity || 1);
        const weight = item.weight && item.unit ? `${item.weight}${item.unit}` : 'item';
        return {
          item: item.name,
          quantity: `${quantity} x ${weight}`,
          cost: Number(item.price || 0) * quantity
        };
      });
      const interest = itemNames[0] || 'No purchase interest yet';
      return {
        ...account,
        address: addresses[0] ? `${addresses[0].address}, ${addresses[0].pincode}` : 'No address saved',
        orders: orders.length,
        interest,
        bought: itemNames.join(', ') || 'No orders yet',
        purchases,
        totalSpent: orders.reduce((sum, order) => sum + Number(order.total || 0), 0)
      };
    });
    const realEmails = new Set(realCustomers.map(customer => customer.email.toLowerCase()));
    return [
      ...realCustomers,
      ...sampleCustomers.filter(customer => !realEmails.has(customer.email.toLowerCase()))
    ];
  }, []);

  // ── Filtered products per tab ──
  const filteredRetailProducts = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return retailProducts.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.brand || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    );
  }, [retailProducts, searchQuery]);

  const filteredWholesaleProducts = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return wholesaleProducts.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.brand || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    );
  }, [wholesaleProducts, searchQuery]);

  // keep for legacy references
  const filteredProducts = activeTab === 'wholesale-products' ? filteredWholesaleProducts : filteredRetailProducts;

  const allProducts = [...retailProducts, ...wholesaleProducts];

  const stats = [
    { label: 'Retail products', value: retailProducts.length, icon: FiPackage },
    { label: 'Wholesale products', value: wholesaleProducts.length, icon: FiPackage },
    { label: 'Live offers', value: offers.filter(offer => offer.active).length, icon: FiGift },
    { label: 'Coupons', value: coupons.filter(coupon => coupon.active).length, icon: FiTag },
    { label: 'Customers', value: customers.length, icon: FiUsers },
    { label: 'Orders', value: liveOrders.length, icon: FiTruck },
  ];

  const exportItems = () => {
    const isWS = activeTab === 'wholesale-products' || activeTab === 'wholesale-content';
    const source = isWS ? wholesaleProducts : retailProducts;
    downloadCsv(`siri-traders-${isWS ? 'wholesale' : 'retail'}-items.csv`, [
      ['ID', 'Name', 'Brand', 'Category', 'Price', 'MRP', 'Discount', 'Stock', 'Description'],
      ...source.map(p => [p.id, p.name, p.brand, p.category, p.price, p.mrp, p.discount, p.stockNote, p.description])
    ]);
  };

  const exportCustomers = () => downloadCsv('siri-traders-customers.csv', [
    ['Name', 'Email', 'Phone', 'Address', 'Orders', 'Interest', 'Bought Items', 'Quantities', 'Costs', 'Total Spent'],
    ...customers.map(customer => [
      customer.name,
      customer.email,
      customer.phone,
      customer.address,
      customer.orders,
      customer.interest,
      customer.bought,
      (customer.purchases || []).map(item => `${item.item}: ${item.quantity}`).join(' | '),
      (customer.purchases || []).map(item => `${item.item}: ${item.cost}`).join(' | '),
      customer.totalSpent
    ])
  ]);

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProductDraft(prev => ({ ...prev, image: reader.result }));
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleOfferImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setOfferDraft(prev => ({ ...prev, image: reader.result }));
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    setProductSaving(true);
    setProductError(null);
    const isWholesale = activeTab === 'wholesale-products';

    const baseNext = {
      name: productDraft.name,
      category: productDraft.category,
      brand: productDraft.brand || null,
      weight: productDraft.weight || null,
      unit: productDraft.unit || 'g',
      price: Number(productDraft.price) || 0,
      mrp: Number(productDraft.mrp) || Number(productDraft.price) || 0,
      discount: Number(productDraft.discount) || 0,
      image: productDraft.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80',
      description: productDraft.description || null,
      inStock: productDraft.stockNote !== 'Out of stock',
      isBestseller: Boolean(productDraft.isBestseller),
      deliveryTime: productDraft.deliveryTime || '15 mins'
    };

    if (isWholesale) {
      const variants = [];
      if (baseNext.weight && baseNext.price) {
        variants.push({ label: `${baseNext.weight} ${baseNext.unit}`, price: baseNext.price });
      }
      if (productDraft.bulkPackLabel && productDraft.bulkPackPrice) {
        variants.push({ label: productDraft.bulkPackLabel, price: Number(productDraft.bulkPackPrice) || 0 });
      }
      if (productDraft.wholesaleCaseLabel && productDraft.wholesaleCasePrice) {
        variants.push({ label: productDraft.wholesaleCaseLabel, price: Number(productDraft.wholesaleCasePrice) || 0 });
      }
      Object.assign(baseNext, {
        wholesalePrice: Number(productDraft.wholesalePrice) || baseNext.price,
        variants: variants.length > 0 ? variants : null
      });
    }

    try {
      const headers = { 'Content-Type': 'application/json', ...(await authHeader()) };
      const isEdit = Boolean(productDraft.id);
      const url = isEdit ? `/api/products/${productDraft.id}` : '/api/products';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, { method, headers, body: JSON.stringify(baseNext) });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${res.status}`);
      }
      // Refresh product list from DB
      await loadDbProducts();
      setProductDraft(isWholesale ? blankWholesaleProduct : blankProduct);
    } catch (err) {
      console.error('saveProduct error:', err);
      setProductError(err.message);
    } finally {
      setProductSaving(false);
    }
  };

  // editProduct: sets active tab to products and switches adminMode based on wholesalePrice
  const editProduct = (product) => {
    const isWholesale = Boolean(product.wholesalePrice);
    setAdminMode(isWholesale ? 'wholesale' : 'retail');
    setProductDraft({
      ...product,
      price: String(product.price),
      mrp: String(product.mrp),
      discount: String(product.discount),
      wholesalePrice: product.wholesalePrice != null ? String(product.wholesalePrice) : '',
      bulkPackLabel: product.bulkPackLabel || '',
      bulkPackPrice: product.bulkPackPrice != null ? String(product.bulkPackPrice) : '',
      wholesaleCaseLabel: product.wholesaleCaseLabel || '',
      wholesaleCasePrice: product.wholesaleCasePrice != null ? String(product.wholesaleCasePrice) : ''
    });
    setActiveTab('products');
  };

  // updateProductStock: PATCHes inStock in DB then refreshes
  const updateProductStock = async (productId, stockNote) => {
    const inStock = stockNote !== 'Out of stock';
    // Optimistic UI update
    const updater = (p) => p.id === productId ? { ...p, stockNote, inStock } : p;
    setRetailProducts(prev => prev.map(updater));
    setWholesaleProducts(prev => prev.map(updater));
    try {
      const headers = { 'Content-Type': 'application/json', ...(await authHeader()) };
      await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ inStock })
      });
    } catch (err) {
      console.error('updateProductStock error:', err);
      // Revert on failure
      await loadDbProducts();
    }
  };

  // removeProduct: DELETEs from DB
  const removeProduct = async (productId) => {
    if (!window.confirm('Delete this product from the database?')) return;
    // Optimistic UI
    setRetailProducts(prev => prev.filter(p => p.id !== productId));
    setWholesaleProducts(prev => prev.filter(p => p.id !== productId));
    try {
      const headers = { ...(await authHeader()) };
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
    } catch (err) {
      console.error('removeProduct error:', err);
      await loadDbProducts();
    }
  };

  const saveOffer = (event) => {
    event.preventDefault();
    const nextOffer = {
      ...offerDraft,
      id: offerDraft.id || `offer-${Date.now()}`,
      price: Number(offerDraft.price) || 0,
      mrp: Number(offerDraft.mrp) || 0,
      image: offerDraft.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=700&q=80'
    };
    persistOffers([nextOffer, ...offers.filter(offer => offer.id !== nextOffer.id)]);
    setOfferDraft(blankOffer);
  };

  const saveCoupon = (event) => {
    event.preventDefault();
    const nextCoupon = { ...couponDraft, id: couponDraft.id || `coupon-${Date.now()}`, code: couponDraft.code.trim().toUpperCase() };
    persistCoupons([nextCoupon, ...coupons.filter(coupon => coupon.id !== nextCoupon.id)]);
    setCouponDraft(blankCoupon);
  };

  const saveAdmin = (event) => {
    event.preventDefault();
    const email = adminDraft.email.trim().toLowerCase();
    if (!adminDraft.name.trim() || !email || !adminDraft.password.trim()) return;
    const nextAdmin = {
      id: `admin-${Date.now()}`,
      name: adminDraft.name.trim(),
      email,
      password: adminDraft.password,
      role: adminDraft.role,
      createdAt: new Date().toLocaleDateString('en-IN')
    };
    const nextAccounts = [nextAdmin, ...adminAccounts.filter(account => account.email.toLowerCase() !== email)];
    setAdminAccounts(nextAccounts);
    saveAdminAccounts(nextAccounts);
    savePendingAdminAccount(nextAdmin);
    setAdminDraft(blankAdmin);
  };

  const updateProductField = async (productId, field, value) => {
    const coerced = ['price', 'mrp', 'discount'].includes(field) ? Number(value) || 0 : value;
    const inStock = field === 'stockNote' ? value !== 'Out of stock' : undefined;
    // Optimistic UI
    const updater = (p) => {
      if (p.id !== productId) return p;
      const next = { ...p, [field]: coerced };
      if (inStock !== undefined) next.inStock = inStock;
      return next;
    };
    setRetailProducts(prev => prev.map(updater));
    setWholesaleProducts(prev => prev.map(updater));
    // Persist to DB
    try {
      const payload = { [field]: coerced };
      if (inStock !== undefined) payload.inStock = inStock;
      const headers = { 'Content-Type': 'application/json', ...(await authHeader()) };
      await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error('updateProductField error:', err);
      await loadDbProducts();
    }
  };

  // filteredContentProducts uses the correct array based on active tab
  const filteredContentProducts = (activeTab === 'wholesale-content' ? wholesaleProducts : retailProducts).filter(product =>
    product.name.toLowerCase().includes(contentSearch.toLowerCase()) ||
    (product.brand || '').toLowerCase().includes(contentSearch.toLowerCase())
  );

  const handleAdminLogout = () => {
    logoutAdmin();
    setAdminSession(null);
    navigate('/admin-login');
  };

  // Access guard: require both local admin session AND Clerk admin role
  if (!isLoaded) {
    return <div className="admin-auth-required"><div className="admin-denied"><p>Loading…</p></div></div>;
  }

  if (!adminSession || !user?.isAdmin) {
    return (
      <div className="admin-auth-required">
        <div className="admin-denied">
          <FiLock className="admin-denied__icon" />
          <h2>Admin access required</h2>
          <p>
            {!adminSession
              ? 'You must log in via the admin login page.'
              : 'Your Clerk account does not have admin privileges. Set publicMetadata.role = "admin" in the Clerk dashboard.'}
          </p>
          <button className="admin-denied__btn" onClick={() => navigate('/admin-login')}>Go to Admin Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper admin-page-wrapper">
      <div className="admin">
        <div className="admin__shell">
          <header className="admin__hero">
            <div>
              <img src="/logo-mark.webp" alt="Siri Traders" className="admin__logo" />
              <span className="admin__eyebrow">Siri Traders Control Center</span>
              <h1>Admin Dashboard</h1>
              <p>Manage products, inventory messages, offers, coupons, customer insights, product content, and admin users.</p>
              <span className="admin__session">Signed in as {adminSession.name} / {adminSession.role}</span>
            </div>
            <div className="admin__hero-actions">
              <button className="admin__ghost" onClick={handleAdminLogout}><FiLogOut /> Logout</button>
            </div>
          </header>

          <section className="admin__stats">
            {stats.map(stat => (
              <div key={stat.label} className="admin__stat-card">
                <stat.icon />
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            ))}
          </section>

          <nav className="admin__tabs" aria-label="Admin sections">
            {[
              ['dashboard',          'Overview',          FiBarChart2],
              ['retail-products',    'Retail Items',      FiPackage],
              ['wholesale-products', 'Wholesale Items',   FiPackage],
              ['offers',             'Offers & coupons',  FiGift],
              ['customers',          'Customers',         FiUsers],
              ['orders',             'Orders',            FiShoppingBag],
              ['payments',           'Bills & payments',  FiCreditCard],
              ['retail-content',     'Retail Content',    FiEdit2],
              ['wholesale-content',  'Wholesale Content', FiEdit2],
              ['admins',             'Admins',            FiLock]
            ].map(([id, label, Icon]) => (
              <button
                key={id}
                className={activeTab === id ? 'admin__tab admin__tab--active' : 'admin__tab'}
                onClick={() => setActiveTab(id)}
              >
                <Icon /> {label}
              </button>
            ))}
          </nav>

          {/* Store links banner */}
          {(activeTab === 'retail-products' || activeTab === 'retail-content') && (
            <div className="admin__mode-bar">
              <span className="admin__mode-label">🛍️ Retail</span>
              <span className="admin__mode-desc">Products visible to retail customers at the home page in Retail mode</span>
              <a href="/home" target="_blank" rel="noopener noreferrer" className="admin__store-link">
                View Retail Store →
              </a>
            </div>
          )}
          {(activeTab === 'wholesale-products' || activeTab === 'wholesale-content') && (
            <div className="admin__mode-bar admin__mode-bar--wholesale">
              <span className="admin__mode-label">📦 Wholesale</span>
              <span className="admin__mode-desc">Products visible to wholesale customers at the home page in Wholesale mode</span>
              <a href="/home" target="_blank" rel="noopener noreferrer" className="admin__store-link">
                View Wholesale Store →
              </a>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <section className="admin-grid">
              <div className="admin-card">
                <h2>Inventory health</h2>
                <div className="admin-scroll-list">
                  {allProducts.map(product => (
                    <button key={product.id} className="admin-row" onClick={() => editProduct(product)}>
                      <img src={toWebpImage(product.image)} alt={product.name} />
                      <span>{product.name}</span>
                      <strong>{product.stockNote}</strong>
                    </button>
                  ))}
                </div>
              </div>
              <div className="admin-card">
                <h2>Active campaigns</h2>
                <div className="admin-campaign-grid">
                  {offers.filter(offer => offer.active).map(offer => (
                    <div key={offer.id} className="admin-campaign">
                      {offer.image ? <img src={toWebpImage(offer.image)} alt={offer.title} /> : <FiGift />}
                      <div>
                        <span>{offer.group === 'festival' ? 'Festive offer' : 'Daily offer'}</span>
                        <strong>{offer.title}</strong>
                        <small>{offer.subtitle || offer.badge}</small>
                      </div>
                    </div>
                  ))}
                  {coupons.filter(coupon => coupon.active).map(coupon => (
                    <div key={coupon.id} className="admin-campaign">
                      <FiTag />
                      <div>
                        <span>Coupon</span>
                        <strong>{coupon.code}</strong>
                        <small>{coupon.discount}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {(activeTab === 'retail-products' || activeTab === 'wholesale-products') && (
            <section className="admin-workspace">
              <form className="admin-form" onSubmit={saveProduct}>
                <h2>{productDraft.id ? 'Edit item' : `Add ${activeTab === 'wholesale-products' ? 'Wholesale' : 'Retail'} Item`}</h2>
                <div className="admin-form__grid">
                  <input value={productDraft.name} onChange={(e) => setProductDraft(prev => ({ ...prev, name: e.target.value }))} placeholder="Product name" required />
                  <input value={productDraft.brand} onChange={(e) => setProductDraft(prev => ({ ...prev, brand: e.target.value }))} placeholder="Brand" required />
                  <select value={productDraft.category} onChange={(e) => setProductDraft(prev => ({ ...prev, category: e.target.value }))}>
                    {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                  <select value={productDraft.stockNote} onChange={(e) => setProductDraft(prev => ({ ...prev, stockNote: e.target.value }))}>
                    <option>In stock</option>
                    <option>Only few left</option>
                    <option>Only 10 left</option>
                    <option>Out of stock</option>
                  </select>
                  <input value={productDraft.price} onChange={(e) => setProductDraft(prev => ({ ...prev, price: e.target.value }))} placeholder="Price" type="number" required />
                  <input value={productDraft.mrp} onChange={(e) => setProductDraft(prev => ({ ...prev, mrp: e.target.value }))} placeholder="MRP" type="number" />
                  <input value={productDraft.discount} onChange={(e) => setProductDraft(prev => ({ ...prev, discount: e.target.value }))} placeholder="Discount %" type="number" />
                  <input value={productDraft.weight} onChange={(e) => setProductDraft(prev => ({ ...prev, weight: e.target.value }))} placeholder="Weight" />
                  <input value={productDraft.unit} onChange={(e) => setProductDraft(prev => ({ ...prev, unit: e.target.value }))} placeholder="Unit" />
                  {/* Wholesale-only extra fields */}
                  {activeTab === 'wholesale-products' && (
                    <>
                      <input value={productDraft.wholesalePrice || ''} onChange={(e) => setProductDraft(prev => ({ ...prev, wholesalePrice: e.target.value }))} placeholder="Wholesale price" type="number" />
                      <input value={productDraft.bulkPackLabel || ''} onChange={(e) => setProductDraft(prev => ({ ...prev, bulkPackLabel: e.target.value }))} placeholder="Bulk pack label e.g. 10 kg bulk" />
                      <input value={productDraft.bulkPackPrice || ''} onChange={(e) => setProductDraft(prev => ({ ...prev, bulkPackPrice: e.target.value }))} placeholder="Bulk pack price" type="number" />
                      <input value={productDraft.wholesaleCaseLabel || ''} onChange={(e) => setProductDraft(prev => ({ ...prev, wholesaleCaseLabel: e.target.value }))} placeholder="Wholesale case label e.g. 25 kg case" />
                      <input value={productDraft.wholesaleCasePrice || ''} onChange={(e) => setProductDraft(prev => ({ ...prev, wholesaleCasePrice: e.target.value }))} placeholder="Wholesale case price" type="number" />
                      <select value={productDraft.deliveryTime || 'Same day'} onChange={(e) => setProductDraft(prev => ({ ...prev, deliveryTime: e.target.value }))}>
                        <option>Same day</option>
                        <option>Next day</option>
                        <option>10 mins</option>
                        <option>15 mins</option>
                      </select>
                    </>
                  )}
                  <input value={productDraft.image} onChange={(e) => setProductDraft(prev => ({ ...prev, image: e.target.value }))} placeholder="Image URL" />
                  <label className="admin-file-input">
                    <span>Or upload image from Downloads/device</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} />
                  </label>
                  <textarea value={productDraft.description} onChange={(e) => setProductDraft(prev => ({ ...prev, description: e.target.value }))} placeholder="Description" rows="3" />
                </div>
                <div className="admin-form__actions">
                  <button type="submit" className="admin__primary"><FiSave /> Save item</button>
                  {productDraft.id && (
                    <button type="button" className="admin__ghost" onClick={() => setProductDraft(adminMode === 'wholesale' ? blankWholesaleProduct : blankProduct)}>
                      <FiX /> Clear
                    </button>
                  )}
                </div>
              </form>

              <div className="admin-card admin-card--wide">
                <div className="admin-card__toolbar">
                  <h2>Items</h2>
                  <div className="admin-card__actions">
                    <button onClick={exportItems}>Download items</button>
                    <label><FiSearch /><input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search items" /></label>
                  </div>
                </div>
                <div className="admin-table">
                  {filteredProducts.map(product => (
                    <div key={product.id} className="admin-product">
                      <img src={toWebpImage(product.image)} alt={product.name} />
                      <div>
                        <strong>{product.name}</strong>
                        <span>{product.brand} / {product.weight}{product.unit} / {formatPrice(product.price)}</span>
                      </div>
                      <select value={product.stockNote} onChange={(e) => updateProductStock(product.id, e.target.value, adminMode === 'wholesale')}>
                        <option>In stock</option>
                        <option>Only few left</option>
                        <option>Only 10 left</option>
                        <option>Out of stock</option>
                      </select>
                      <button onClick={() => editProduct(product)}><FiEdit2 /></button>
                      <button className="admin-danger" onClick={() => removeProduct(product.id)}><FiTrash2 /></button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activeTab === 'offers' && (
            <section className="admin-grid">
              <form className="admin-form" onSubmit={saveOffer}>
                <h2>Add offer or sale</h2>
                <input value={offerDraft.title} onChange={(e) => setOfferDraft(prev => ({ ...prev, title: e.target.value }))} placeholder="Offer title" required />
                <input value={offerDraft.subtitle} onChange={(e) => setOfferDraft(prev => ({ ...prev, subtitle: e.target.value }))} placeholder="Subtitle" />
                <input value={offerDraft.badge} onChange={(e) => setOfferDraft(prev => ({ ...prev, badge: e.target.value }))} placeholder="Badge text" />
                <select value={offerDraft.group} onChange={(e) => setOfferDraft(prev => ({ ...prev, group: e.target.value }))}>
                  <option value="daily">Daily offers banner</option>
                  <option value="festival">Festive offers banner</option>
                </select>
                <div className="admin-form__grid admin-form__grid--two">
                  <input value={offerDraft.price} onChange={(e) => setOfferDraft(prev => ({ ...prev, price: e.target.value }))} placeholder="Deal price" type="number" />
                  <input value={offerDraft.mrp} onChange={(e) => setOfferDraft(prev => ({ ...prev, mrp: e.target.value }))} placeholder="MRP" type="number" />
                </div>
                <div className="admin-offer-image">
                  {offerDraft.image ? (
                    <img src={toWebpImage(offerDraft.image)} alt="Offer preview" />
                  ) : (
                    <div className="admin-offer-image__empty"><FiGift /></div>
                  )}
                  <div>
                    <input value={offerDraft.image} onChange={(e) => setOfferDraft(prev => ({ ...prev, image: e.target.value }))} placeholder="Add offer image URL" />
                    <label className="admin-file-input admin-file-input--compact">
                      <span>Or choose image from files</span>
                      <input type="file" accept="image/*" onChange={handleOfferImageUpload} />
                    </label>
                  </div>
                </div>
                <button className="admin__primary"><FiPlus /> Add offer</button>
              </form>
              <form className="admin-form" onSubmit={saveCoupon}>
                <h2>Add coupon</h2>
                <input value={couponDraft.code} onChange={(e) => setCouponDraft(prev => ({ ...prev, code: e.target.value }))} placeholder="Coupon code" required />
                <input value={couponDraft.discount} onChange={(e) => setCouponDraft(prev => ({ ...prev, discount: e.target.value }))} placeholder="Discount details" />
                <input value={couponDraft.limit} onChange={(e) => setCouponDraft(prev => ({ ...prev, limit: e.target.value }))} placeholder="Usage condition" />
                <button className="admin__primary"><FiPlus /> Add coupon</button>
              </form>
              <div className="admin-card">
                <h2>Offers</h2>
                {offers.map(offer => (
                  <div key={offer.id} className="admin-row admin-row--plain admin-row--offer">
                    {offer.image ? <img src={toWebpImage(offer.image)} alt={offer.title} /> : <FiGift />}
                    <span>{offer.title}<small>{(offer.group || 'daily') === 'festival' ? 'Festive offers' : 'Daily offers'}</small></span>
                    <button onClick={() => persistOffers(offers.map(item => item.id === offer.id ? { ...item, active: !item.active } : item))}>{offer.active ? 'Live' : 'Paused'}</button>
                    <button className="admin-danger" onClick={() => persistOffers(offers.filter(item => item.id !== offer.id))}><FiTrash2 /></button>
                  </div>
                ))}
              </div>
              <div className="admin-card">
                <h2>Coupons</h2>
                {coupons.map(coupon => (
                  <div key={coupon.id} className="admin-row admin-row--plain">
                    <FiTag />
                    <span>{coupon.code} - {coupon.discount}</span>
                    <button onClick={() => persistCoupons(coupons.map(item => item.id === coupon.id ? { ...item, active: !item.active } : item))}>{coupon.active ? 'Active' : 'Off'}</button>
                    <button className="admin-danger" onClick={() => persistCoupons(coupons.filter(item => item.id !== coupon.id))}><FiTrash2 /></button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'customers' && (
            <section className="admin-card admin-card--wide">
              <div className="admin-card__toolbar">
                <h2>Customers</h2>
                <button className="admin__ghost" onClick={exportCustomers}>Download customers</button>
              </div>
              {customers.length === 0 ? (
                <p className="admin-muted">No customers yet. New user signups will appear here automatically.</p>
              ) : customers.map(customer => (
                <div key={customer.email} className="admin-customer admin-customer--readonly">
                  <div><strong>{customer.name}</strong><span>{customer.phone} / {customer.email}</span></div>
                  <div><strong>Address</strong><span>{customer.address}</span></div>
                  <div><strong>Interest</strong><span>{customer.interest}</span></div>
                  <div><strong>Bought</strong><span>{customer.bought}</span></div>
                  <div><strong>Quantity</strong><span>{(customer.purchases || []).map(item => `${item.item}: ${item.quantity}`).join(', ') || 'No quantity yet'}</span></div>
                  <div><strong>Cost</strong><span>{(customer.purchases || []).map(item => `${item.item}: ${formatPrice(item.cost)}`).join(', ') || formatPrice(0)}</span></div>
                  <div><strong>Orders</strong><span>{customer.orders}</span></div>
                  <div><strong>Total spent</strong><span>{formatPrice(customer.totalSpent)}</span></div>
                </div>
              ))}
            </section>
          )}

          {activeTab === 'orders' && (
            <section className="admin-card admin-card--wide">
              <div className="admin-card__toolbar">
                <h2>Customer orders</h2>
                <button className="admin__ghost" onClick={loadAdminOrders} disabled={ordersLoading}>
                  {ordersLoading ? 'Loading…' : 'Refresh'}
                </button>
              </div>
              {ordersLoading ? (
                <p className="admin-muted" style={{ padding: '24px 0' }}>Loading orders…</p>
              ) : liveOrders.length === 0 ? (
                <p className="admin-muted" style={{ padding: '24px 0' }}>No orders yet. Orders placed by customers will appear here.</p>
              ) : (
                <div className="admin-order-list">
                  {liveOrders.map(order => (
                    <div key={order.id} className="admin-order-card">
                      <FiTruck />
                      <div>
                        <strong>Order #{order.id}</strong>
                        <span>{new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      </div>
                      <div><strong>Customer ID</strong><span style={{ fontSize: 11, wordBreak: 'break-all' }}>{order.userId}</span></div>
                      <div><strong>Items</strong><span>{(order.items || []).map(item => `${item.name} ×${item.quantity}`).join(', ') || '—'}</span></div>
                      <div><strong>Total</strong><span>{formatPrice(order.total)}</span></div>
                      <div><strong>Payment</strong><span>{order.paymentMethod || '—'}</span></div>
                      <div>
                        <strong>Status</strong>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          disabled={orderStatusUpdating === order.id}
                          className={`admin-status-select admin-status-select--${(order.status || '').toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          <option>Pending</option>
                          <option>Preparing</option>
                          <option>In Transit</option>
                          <option>Delivered</option>
                          <option>Paid</option>
                        </select>
                      </div>
                      {order.deliveryAddress && (
                        <div><strong>Address</strong><span>{order.deliveryAddress}</span></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'payments' && (
            <section className="admin-card admin-card--wide">
              <div className="admin-card__toolbar">
                <h2>Transaction bills & payment details</h2>
              </div>
              {ordersLoading ? (
                <p className="admin-muted" style={{ padding: '24px 0' }}>Loading payments…</p>
              ) : liveOrders.length === 0 ? (
                <p className="admin-muted" style={{ padding: '24px 0' }}>No transactions yet.</p>
              ) : (
                <div className="admin-payment-list">
                  {liveOrders.map(order => (
                    <div key={order.id} className="admin-payment-card">
                      <FiCreditCard />
                      <div>
                        <strong>Order #{order.id}</strong>
                        <span>{new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      </div>
                      <div><strong>Customer ID</strong><span style={{ fontSize: 11, wordBreak: 'break-all' }}>{order.userId}</span></div>
                      <div><strong>Payment</strong><span>{order.paymentMethod || '—'}</span></div>
                      <div><strong>Items</strong><span>{(order.items || []).map(item => `${item.name} ×${item.quantity} @ ${formatPrice(item.price)}`).join(' | ') || '—'}</span></div>
                      <div><strong>Total paid</strong><span>{formatPrice(order.total)}</span></div>
                      <div><strong>Status</strong><span className={`admin-status-pill ${
                        order.status === 'Pending' || order.status === 'Preparing' ? 'admin-status-pill--pending' : ''
                      }`}>{order.status}</span></div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {(activeTab === 'retail-content' || activeTab === 'wholesale-content') && (
            <section className="admin-card admin-card--wide">
              <div className="admin-card__toolbar">
                <h2>
                  {activeTab === 'retail-content' ? 'Retail' : 'Wholesale'} Product Content Editor
                  <small style={{fontSize:11,fontWeight:600,color:'#687466',marginLeft:10}}>
                    {activeTab === 'retail-content'
                      ? '→ Visible at Retail Store'
                      : '→ Visible at Wholesale Store'}
                  </small>
                </h2>
                <label><FiSearch /><input value={contentSearch} onChange={(e) => setContentSearch(e.target.value)} placeholder="Search content" /></label>
              </div>
              <div className="admin-content-list">
                <div className={`admin-content-header ${activeTab === 'wholesale-content' ? 'admin-content-header--ws' : ''}`}>
                  <span>Image</span>
                  <span>Item</span>
                  <span>Price</span>
                  <span>% Off</span>
                  <span>Availability</span>
                  {activeTab === 'wholesale-content' && <span>WS Price</span>}
                  {activeTab === 'wholesale-content' && <span>Bulk Pack</span>}
                  {activeTab === 'wholesale-content' && <span>WS Case</span>}
                  <span>Description</span>
                </div>
                {filteredContentProducts.map(product => (
                  <div key={product.id} className={`admin-content-editor ${activeTab === 'wholesale-content' ? 'admin-content-editor--ws' : ''}`}>
                    <img src={toWebpImage(product.image)} alt={product.name} />
                    <input value={product.name} onChange={(e) => updateProductField(product.id, 'name', e.target.value)} />
                    <input value={product.price} onChange={(e) => updateProductField(product.id, 'price', e.target.value)} type="number" />
                    <input value={product.discount} onChange={(e) => updateProductField(product.id, 'discount', e.target.value)} type="number" />
                    <select value={product.stockNote} onChange={(e) => updateProductField(product.id, 'stockNote', e.target.value)}>
                      <option>In stock</option>
                      <option>Only few left</option>
                      <option>Only 10 left</option>
                      <option>Out of stock</option>
                    </select>
                    {activeTab === 'wholesale-content' && (
                      <input value={product.wholesalePrice || ''} onChange={(e) => updateProductField(product.id, 'wholesalePrice', e.target.value)} type="number" placeholder="WS price" />
                    )}
                    {activeTab === 'wholesale-content' && (
                      <input value={product.bulkPackLabel || ''} onChange={(e) => updateProductField(product.id, 'bulkPackLabel', e.target.value)} placeholder="e.g. 10 kg bulk" />
                    )}
                    {activeTab === 'wholesale-content' && (
                      <input value={product.wholesaleCaseLabel || ''} onChange={(e) => updateProductField(product.id, 'wholesaleCaseLabel', e.target.value)} placeholder="e.g. 25 kg case" />
                    )}
                    <input value={product.description || ''} onChange={(e) => updateProductField(product.id, 'description', e.target.value)} />
                  </div>
                ))}
                {filteredContentProducts.length === 0 && (
                  <p className="admin-muted" style={{padding:'24px 0'}}>
                    No {activeTab === 'retail-content' ? 'retail' : 'wholesale'} products yet.
                    Add them in the {activeTab === 'retail-content' ? 'Retail Items' : 'Wholesale Items'} tab.
                  </p>
                )}
              </div>
            </section>
          )}

          {activeTab === 'admins' && (
            <section className="admin-grid">
              <form className="admin-form" onSubmit={saveAdmin}>
                <h2>Add admin user</h2>
                <input value={adminDraft.name} onChange={(e) => setAdminDraft(prev => ({ ...prev, name: e.target.value }))} placeholder="Full name" required />
                <input value={adminDraft.email} onChange={(e) => setAdminDraft(prev => ({ ...prev, email: e.target.value }))} placeholder="Email" type="email" required />
                <input value={adminDraft.password} onChange={(e) => setAdminDraft(prev => ({ ...prev, password: e.target.value }))} placeholder="Password" type="password" required />
                <select value={adminDraft.role} onChange={(e) => setAdminDraft(prev => ({ ...prev, role: e.target.value }))}>
                  <option>Manager</option>
                  <option>Editor</option>
                  <option>Super Admin</option>
                </select>
                <button type="submit" className="admin__primary"><FiPlus /> Add admin</button>
              </form>
              <div className="admin-card">
                <h2>Admin accounts</h2>
                {adminAccounts.map(account => (
                  <div key={account.id} className="admin-row admin-row--plain">
                    <FiLock />
                    <span>{account.name}<small>{account.email} / {account.role}</small></span>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
};

export default Admin;
