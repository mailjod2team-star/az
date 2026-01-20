import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SERVICES_KEY = 'salon_services';
const PRODUCTS_KEY = 'salon_products';
const CUSTOMERS_KEY = 'salon_customers';
const MEMBERSHIPS_KEY = 'salon_memberships';
const TRANSACTIONS_KEY = 'salon_transactions';

export const CashierPage = () => {
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [memberships, setMemberships] = useState([]);
  
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('services'); // services or products
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const storedServices = localStorage.getItem(SERVICES_KEY);
      const storedProducts = localStorage.getItem(PRODUCTS_KEY);
      const storedCustomers = localStorage.getItem(CUSTOMERS_KEY);
      const storedMemberships = localStorage.getItem(MEMBERSHIPS_KEY);

      if (storedServices) setServices(JSON.parse(storedServices));
      if (storedProducts) setProducts(JSON.parse(storedProducts));
      if (storedCustomers) setCustomers(JSON.parse(storedCustomers));
      if (storedMemberships) setMemberships(JSON.parse(storedMemberships));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const addToCart = (item, type) => {
    const existingItem = cart.find(i => i.id === item.id && i.type === type);
    
    if (existingItem) {
      setCart(cart.map(i => 
        i.id === item.id && i.type === type 
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ));
    } else {
      setCart([...cart, { 
        ...item, 
        type, 
        quantity: 1,
        originalPrice: item.price 
      }]);
    }
  };

  const updateQuantity = (itemId, type, delta) => {
    setCart(cart.map(item => {
      if (item.id === itemId && item.type === type) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (itemId, type) => {
    setCart(cart.filter(item => !(item.id === itemId && item.type === type)));
  };

  const getCustomerMembership = () => {
    if (!selectedCustomer) return null;
    return memberships.find(m => 
      m.customerId === selectedCustomer.id && 
      m.status === 'active'
    );
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const membership = getCustomerMembership();
    const discount = membership ? (subtotal * membership.discount / 100) : 0;
    const total = subtotal - discount;

    return { subtotal, discount, total, discountPercent: membership?.discount || 0 };
  };

  const handlePayment = () => {
    if (cart.length === 0) {
      alert('Giỏ hàng trống!');
      return;
    }
    setShowPaymentModal(true);
  };

  const completeTransaction = () => {
    try {
      const { subtotal, discount, total } = calculateTotals();
      const membership = getCustomerMembership();

      const transaction = {
        id: `TXN${Date.now()}`,
        customerId: selectedCustomer?.id || 'GUEST',
        customerName: selectedCustomer?.name || 'Khách vãng lai',
        items: cart,
        subtotal,
        discount,
        total,
        paymentMethod,
        membershipUsed: membership ? membership.cardNumber : null,
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0]
      };

      // Save transaction
      const stored = localStorage.getItem(TRANSACTIONS_KEY);
      const transactions = stored ? JSON.parse(stored) : [];
      transactions.push(transaction);
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));

      // Update customer stats if customer selected
      if (selectedCustomer) {
        const updatedCustomers = customers.map(c => {
          if (c.id === selectedCustomer.id) {
            return {
              ...c,
              totalVisits: (c.totalVisits || 0) + 1,
              totalSpent: (c.totalSpent || 0) + total
            };
          }
          return c;
        });
        localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(updatedCustomers));
        setCustomers(updatedCustomers);

        // Update membership points
        if (membership) {
          const points = Math.floor(total / 10000);
          const updatedMemberships = memberships.map(m => {
            if (m.id === membership.id) {
              return { ...m, points: (m.points || 0) + points };
            }
            return m;
          });
          localStorage.setItem(MEMBERSHIPS_KEY, JSON.stringify(updatedMemberships));
          setMemberships(updatedMemberships);
        }
      }

      // Update product stock
      cart.forEach(item => {
        if (item.type === 'product') {
          const updatedProducts = products.map(p => {
            if (p.id === item.id) {
              return { ...p, stock: p.stock - item.quantity };
            }
            return p;
          });
          localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updatedProducts));
          setProducts(updatedProducts);
        }
      });

      // Reset
      setCart([]);
      setSelectedCustomer(null);
      setShowPaymentModal(false);
      alert(`✅ Thanh toán thành công!\nTổng: ${formatCurrency(total)}`);
    } catch (error) {
      console.error('Error completing transaction:', error);
      alert('Có lỗi xảy ra khi thanh toán!');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const filteredItems = activeTab === 'services' 
    ? services.filter(s => 
        s.status === 'active' && 
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products.filter(p => 
        p.status === 'active' && 
        p.stock > 0 &&
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

  const { subtotal, discount, total, discountPercent } = calculateTotals();

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Thu ngân</h1>
            <p className="text-sm text-gray-600">Màn hình bán hàng POS</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCustomerModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              data-testid="select-customer-button"
            >
              <i className="fa-solid fa-user" />
              {selectedCustomer ? selectedCustomer.name : 'Chọn khách hàng'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Products/Services */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('services')}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'services'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
              data-testid="services-tab"
            >
              <i className="fa-solid fa-cut mr-2" />
              Dịch vụ ({services.length})
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'products'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
              data-testid="products-tab"
            >
              <i className="fa-solid fa-box mr-2" />
              Sản phẩm ({products.length})
            </button>
          </div>

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder={`Tìm ${activeTab === 'services' ? 'dịch vụ' : 'sản phẩm'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                data-testid="search-items"
              />
              <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Items Grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => addToCart(item, activeTab === 'services' ? 'service' : 'product')}
                  className="bg-white p-3 rounded-lg border border-gray-200 hover:border-emerald-500 hover:shadow-md transition-all text-left"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  data-testid={`item-${item.id}`}
                >
                  <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">{item.name}</h3>
                  <p className="text-emerald-700 font-bold text-base">{formatCurrency(item.price)}</p>
                  {activeTab === 'products' && (
                    <p className="text-xs text-gray-500 mt-1">Kho: {item.stock}</p>
                  )}
                  {activeTab === 'services' && (
                    <p className="text-xs text-gray-500 mt-1">{item.duration} phút</p>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Cart */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800">Giỏ hàng</h2>
            {selectedCustomer && (
              <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <i className="fa-solid fa-user mr-1" />
                  {selectedCustomer.name}
                </p>
                {getCustomerMembership() && (
                  <p className="text-xs text-emerald-600 mt-1">
                    <i className="fa-solid fa-id-card mr-1" />
                    Giảm {discountPercent}%
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <i className="fa-solid fa-shopping-cart text-6xl text-gray-300 mb-3" />
                <p className="text-gray-500">Giỏ hàng trống</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="bg-gray-50 p-3 rounded-lg"
                    data-testid={`cart-item-${item.id}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 text-sm">{item.name}</h4>
                        <p className="text-xs text-gray-500">
                          {item.type === 'service' ? 'Dịch vụ' : 'Sản phẩm'}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id, item.type)}
                        className="text-red-600 hover:text-red-800 p-1"
                        data-testid={`remove-cart-item-${item.id}`}
                      >
                        <i className="fa-solid fa-trash text-sm" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.type, -1)}
                          className="w-7 h-7 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                          data-testid={`decrease-${item.id}`}
                        >
                          <i className="fa-solid fa-minus text-xs" />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.type, 1)}
                          className="w-7 h-7 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                          data-testid={`increase-${item.id}`}
                        >
                          <i className="fa-solid fa-plus text-xs" />
                        </button>
                      </div>
                      <p className="font-bold text-emerald-700">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tạm tính:</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Giảm giá ({discountPercent}%):</span>
                  <span className="font-semibold">-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t border-gray-300">
                <span>Tổng cộng:</span>
                <span className="text-emerald-700">{formatCurrency(total)}</span>
              </div>
            </div>
            
            <button
              onClick={handlePayment}
              disabled={cart.length === 0}
              className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-bold text-lg"
              data-testid="payment-button"
            >
              <i className="fa-solid fa-credit-card mr-2" />
              Thanh toán
            </button>
          </div>
        </div>
      </div>

      {/* Customer Selection Modal */}
      <AnimatePresence>
        {showCustomerModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCustomerModal(false)}
          >
            <motion.div
              className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200 bg-blue-50">
                <h2 className="text-lg font-bold text-gray-800">Chọn khách hàng</h2>
              </div>
              
              <div className="p-4 overflow-y-auto max-h-[60vh]">
                <div className="mb-4">
                  <button
                    onClick={() => {
                      setSelectedCustomer(null);
                      setShowCustomerModal(false);
                    }}
                    className="w-full p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-left transition-colors"
                    data-testid="guest-customer"
                  >
                    <i className="fa-solid fa-user-slash mr-2" />
                    Khách vãng lai
                  </button>
                </div>

                <div className="space-y-2">
                  {customers.map((customer) => {
                    const membership = memberships.find(m => 
                      m.customerId === customer.id && m.status === 'active'
                    );
                    
                    return (
                      <button
                        key={customer.id}
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowCustomerModal(false);
                        }}
                        className="w-full p-3 bg-white hover:bg-blue-50 border border-gray-200 rounded-lg text-left transition-colors"
                        data-testid={`select-customer-${customer.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-800">{customer.name}</p>
                            <p className="text-sm text-gray-600">{customer.phone}</p>
                          </div>
                          {membership && (
                            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded font-medium">
                              <i className="fa-solid fa-id-card mr-1" />
                              -{membership.discount}%
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={() => setShowCustomerModal(false)}
                  className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPaymentModal(false)}
          >
            <motion.div
              className="bg-white rounded-lg shadow-2xl w-full max-w-md"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200 bg-emerald-50">
                <h2 className="text-lg font-bold text-gray-800">Xác nhận thanh toán</h2>
              </div>
              
              <div className="p-4">
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Tổng tiền:</span>
                    <span className="text-2xl font-bold text-emerald-700">{formatCurrency(total)}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phương thức thanh toán
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        paymentMethod === 'cash'
                          ? 'border-emerald-600 bg-emerald-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      data-testid="payment-cash"
                    >
                      <i className="fa-solid fa-money-bill text-2xl mb-1" />
                      <p className="text-sm font-medium">Tiền mặt</p>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        paymentMethod === 'card'
                          ? 'border-emerald-600 bg-emerald-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      data-testid="payment-card"
                    >
                      <i className="fa-solid fa-credit-card text-2xl mb-1" />
                      <p className="text-sm font-medium">Thẻ</p>
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={completeTransaction}
                    className="flex-1 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-bold"
                    data-testid="confirm-payment"
                  >
                    Xác nhận
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
