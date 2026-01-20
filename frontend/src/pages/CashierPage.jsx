import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SERVICES_KEY = 'salon_services';
const PRODUCTS_KEY = 'salon_products';
const CUSTOMERS_KEY = 'salon_customers';
const MEMBERSHIPS_KEY = 'salon_memberships';
const TRANSACTIONS_KEY = 'salon_transactions';

// Phương thức thanh toán
const PAYMENT_METHODS = [
  { id: 'cash', name: 'Tiền mặt', logo: '/payment-icons/tienmat.png' },
  { id: 'bank_transfer', name: 'Chuyển khoản ngân hàng', logo: '/payment-icons/bank.png' },
  { id: 'visa_mastercard', name: 'Visa / MasterCard', logo: '/payment-icons/visamastercard.png' },
  { id: 'vnpay', name: 'VNPay', logo: '/payment-icons/vnpay.webp' },
  { id: 'paypal', name: 'PayPal', logo: '/payment-icons/paypal.svg' },
];

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
  const [lastTransaction, setLastTransaction] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const invoiceRef = useRef(null);

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
    const tax = subtotal * 0.08; // 8% VAT
    const total = subtotal - discount + tax;

    return { subtotal, discount, tax, total, discountPercent: membership?.discount || 0 };
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
      const { subtotal, discount, total, tax } = calculateTotals();
      const membership = getCustomerMembership();
      const paymentMethodInfo = PAYMENT_METHODS.find(m => m.id === paymentMethod);

      const transaction = {
        id: `HD${Date.now()}`,
        invoiceNumber: `INV-${new Date().getFullYear()}${String(Date.now()).slice(-6)}`,
        customerId: selectedCustomer?.id || 'GUEST',
        customerName: selectedCustomer?.name || 'Khách vãng lai',
        customerPhone: selectedCustomer?.phone || '',
        items: cart,
        subtotal,
        discount,
        tax,
        total,
        paymentMethod: paymentMethodInfo.name,
        paymentMethodId: paymentMethod,
        membershipUsed: membership ? membership.cardNumber : null,
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('vi-VN'),
        cashier: 'Admin'
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

      // Save last transaction for invoice
      setLastTransaction(transaction);
      
      // Reset
      setCart([]);
      setSelectedCustomer(null);
      setShowPaymentModal(false);
      
      // Show invoice
      setShowInvoice(true);
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

  const printInvoice = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Hóa đơn</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      body { font-family: Arial, sans-serif; padding: 20px; }
      .invoice { max-width: 600px; margin: 0 auto; }
      .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
      .header h1 { margin: 0; font-size: 24px; }
      .header p { margin: 5px 0; font-size: 12px; }
      .info { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 12px; }
      .items { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      .items th { background: #f0f0f0; padding: 8px; text-align: left; border-bottom: 2px solid #000; font-size: 12px; }
      .items td { padding: 8px; border-bottom: 1px solid #ddd; font-size: 12px; }
      .totals { text-align: right; font-size: 12px; }
      .totals div { margin: 5px 0; }
      .total-row { font-size: 16px; font-weight: bold; border-top: 2px solid #000; padding-top: 10px; margin-top: 10px; }
      .footer { text-align: center; margin-top: 30px; font-size: 11px; border-top: 1px dashed #000; padding-top: 10px; }
      @media print {
        body { padding: 0; }
        .no-print { display: none; }
      }
    `);
    printWindow.document.write('</style></head><body>');
    printWindow.document.write(invoiceRef.current.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const downloadInvoice = () => {
    printInvoice();
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

  const { subtotal, discount, tax, total, discountPercent } = calculateTotals();

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header - Compact */}
      <div className="bg-white border-b border-gray-200 px-3 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-800">Thu ngân POS</h1>
            <p className="text-xs text-gray-600">Bán hàng nhanh</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCustomerModal(true)}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1.5"
              data-testid="select-customer-button"
            >
              <i className="fa-solid fa-user text-xs" />
              <span className="hidden sm:inline">{selectedCustomer ? selectedCustomer.name : 'Khách hàng'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Products/Services - Compact */}
        <div className="flex-1 flex flex-col p-2 overflow-hidden">
          {/* Tabs - Compact */}
          <div className="flex gap-1 mb-2">
            <button
              onClick={() => setActiveTab('services')}
              className={`flex-1 py-1.5 px-2 rounded text-xs font-medium transition-colors ${
                activeTab === 'services'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
              data-testid="services-tab"
            >
              <i className="fa-solid fa-cut mr-1" />
              Dịch vụ ({services.length})
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex-1 py-1.5 px-2 rounded text-xs font-medium transition-colors ${
                activeTab === 'products'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
              data-testid="products-tab"
            >
              <i className="fa-solid fa-box mr-1" />
              Sản phẩm ({products.length})
            </button>
          </div>

          {/* Search - Compact */}
          <div className="mb-2">
            <div className="relative">
              <input
                type="text"
                placeholder={`Tìm ${activeTab === 'services' ? 'dịch vụ' : 'sản phẩm'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                data-testid="search-items"
              />
              <i className="fa-solid fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            </div>
          </div>

          {/* Items Grid - Compact */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
              {filteredItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => addToCart(item, activeTab === 'services' ? 'service' : 'product')}
                  className="bg-white p-2 rounded border border-gray-200 hover:border-emerald-500 hover:shadow transition-all text-left"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  data-testid={`item-${item.id}`}
                >
                  <h3 className="font-semibold text-gray-800 text-xs mb-0.5 line-clamp-2">{item.name}</h3>
                  <p className="text-emerald-700 font-bold text-sm">{formatCurrency(item.price)}</p>
                  {activeTab === 'products' && (
                    <p className="text-[10px] text-gray-500 mt-0.5">Kho: {item.stock}</p>
                  )}
                  {activeTab === 'services' && (
                    <p className="text-[10px] text-gray-500 mt-0.5">{item.duration} phút</p>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Cart - Compact */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="px-3 py-2 border-b border-gray-200">
            <h2 className="text-sm font-bold text-gray-800">Giỏ hàng</h2>
            {selectedCustomer && (
              <div className="mt-1 p-1.5 bg-blue-50 rounded text-xs">
                <p className="text-gray-700">
                  <i className="fa-solid fa-user mr-1" />
                  {selectedCustomer.name}
                </p>
                {getCustomerMembership() && (
                  <p className="text-emerald-600 mt-0.5">
                    <i className="fa-solid fa-id-card mr-1" />
                    Giảm {discountPercent}%
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Cart Items - Compact */}
          <div className="flex-1 overflow-y-auto p-2">
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <i className="fa-solid fa-shopping-cart text-4xl text-gray-300 mb-2" />
                <p className="text-gray-500 text-xs">Giỏ hàng trống</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {cart.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="bg-gray-50 p-2 rounded"
                    data-testid={`cart-item-${item.id}`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 text-xs">{item.name}</h4>
                        <p className="text-[10px] text-gray-500">
                          {item.type === 'service' ? 'Dịch vụ' : 'Sản phẩm'}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id, item.type)}
                        className="text-red-600 hover:text-red-800 p-0.5"
                        data-testid={`remove-cart-item-${item.id}`}
                      >
                        <i className="fa-solid fa-trash text-xs" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateQuantity(item.id, item.type, -1)}
                          className="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                          data-testid={`decrease-${item.id}`}
                        >
                          <i className="fa-solid fa-minus text-[10px]" />
                        </button>
                        <span className="w-6 text-center font-semibold text-xs">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.type, 1)}
                          className="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                          data-testid={`increase-${item.id}`}
                        >
                          <i className="fa-solid fa-plus text-[10px]" />
                        </button>
                      </div>
                      <p className="font-bold text-emerald-700 text-xs">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total - Compact */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="space-y-1 mb-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Tạm tính:</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-xs text-emerald-600">
                  <span>Giảm giá ({discountPercent}%):</span>
                  <span className="font-semibold">-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-gray-600">
                <span>Thuế VAT (8%):</span>
                <span className="font-semibold">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-800 pt-1 border-t border-gray-300">
                <span>Tổng cộng:</span>
                <span className="text-emerald-700">{formatCurrency(total)}</span>
              </div>
            </div>
            
            <button
              onClick={handlePayment}
              disabled={cart.length === 0}
              className="w-full py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-bold text-sm"
              data-testid="payment-button"
            >
              <i className="fa-solid fa-credit-card mr-1.5" />
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

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Modal - Enhanced with All Payment Methods */}
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
              className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3 border-b border-gray-200 bg-emerald-50 sticky top-0 z-10">
                <h2 className="text-base font-bold text-gray-800">Xác nhận thanh toán</h2>
              </div>
              
              <div className="p-4">
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tổng tiền:</span>
                    <span className="text-xl font-bold text-emerald-700">{formatCurrency(total)}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn phương thức thanh toán
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {PAYMENT_METHODS.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-3 rounded border-2 transition-all ${
                          paymentMethod === method.id
                            ? 'border-emerald-600 bg-emerald-50 shadow-sm'
                            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                        }`}
                        data-testid={`payment-${method.id}`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <img 
                            src={method.logo} 
                            alt={method.name}
                            className="h-10 w-auto object-contain"
                          />
                          <p className="text-xs font-medium text-center text-gray-700">{method.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={completeTransaction}
                    className="w-full py-2.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors font-bold text-sm"
                    data-testid="confirm-payment"
                  >
                    Xác nhận thanh toán
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invoice Modal */}
      <AnimatePresence>
        {showInvoice && lastTransaction && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="p-3 border-b border-gray-200 bg-emerald-50 flex items-center justify-between sticky top-0 z-10">
                <h2 className="text-base font-bold text-gray-800">
                  Thanh toán thành công
                </h2>
                <button
                  onClick={() => setShowInvoice(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <i className="fa-solid fa-times text-lg" />
                </button>
              </div>
              
              <div className="p-4">
                {/* Hidden Invoice Content for Print */}
                <div ref={invoiceRef} className="hidden">
                  <div className="invoice">
                    <div className="header">
                      <h1>DearTech Salon</h1>
                      <p>Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM</p>
                      <p>Điện thoại: 0123 456 789 | Email: info@deartech.vn</p>
                    </div>
                    
                    <div className="info">
                      <div>
                        <p><strong>Hóa đơn:</strong> {lastTransaction.invoiceNumber}</p>
                        <p><strong>Ngày:</strong> {lastTransaction.date}</p>
                        <p><strong>Giờ:</strong> {lastTransaction.time}</p>
                      </div>
                      <div>
                        <p><strong>Khách hàng:</strong> {lastTransaction.customerName}</p>
                        {lastTransaction.customerPhone && (
                          <p><strong>SĐT:</strong> {lastTransaction.customerPhone}</p>
                        )}
                        <p><strong>Thu ngân:</strong> {lastTransaction.cashier}</p>
                      </div>
                    </div>
                    
                    <table className="items">
                      <thead>
                        <tr>
                          <th>Sản phẩm/Dịch vụ</th>
                          <th style={{textAlign: 'center'}}>SL</th>
                          <th style={{textAlign: 'right'}}>Đơn giá</th>
                          <th style={{textAlign: 'right'}}>Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lastTransaction.items.map((item, idx) => (
                          <tr key={idx}>
                            <td>
                              {item.name}
                              <br />
                              <small style={{color: '#666'}}>
                                ({item.type === 'service' ? 'Dịch vụ' : 'Sản phẩm'})
                              </small>
                            </td>
                            <td style={{textAlign: 'center'}}>{item.quantity}</td>
                            <td style={{textAlign: 'right'}}>{formatCurrency(item.price)}</td>
                            <td style={{textAlign: 'right'}}>{formatCurrency(item.price * item.quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    <div className="totals">
                      <div>Tạm tính: {formatCurrency(lastTransaction.subtotal)}</div>
                      {lastTransaction.discount > 0 && (
                        <div style={{color: '#10b981'}}>
                          Giảm giá: -{formatCurrency(lastTransaction.discount)}
                        </div>
                      )}
                      <div>Thuế VAT (8%): {formatCurrency(lastTransaction.tax)}</div>
                      <div className="total-row">
                        TỔNG CỘNG: {formatCurrency(lastTransaction.total)}
                      </div>
                      <div style={{marginTop: '10px'}}>
                        Phương thức: {lastTransaction.paymentMethod}
                      </div>
                    </div>
                    
                    <div className="footer">
                      <p>Cảm ơn quý khách! Hẹn gặp lại!</p>
                      <p>Hotline hỗ trợ: 0123 456 789</p>
                    </div>
                  </div>
                </div>

                {/* Visible Invoice Preview */}
                <div className="bg-white border border-gray-200 rounded p-4">
                  <div className="text-center border-b-2 border-gray-800 pb-3 mb-3">
                    <h1 className="text-xl font-bold">DearTech Salon</h1>
                    <p className="text-xs text-gray-600">123 Đường ABC, Quận XYZ, TP.HCM</p>
                    <p className="text-xs text-gray-600">Điện thoại: 0123 456 789</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
                    <div>
                      <p><strong>Hóa đơn:</strong> {lastTransaction.invoiceNumber}</p>
                      <p><strong>Ngày:</strong> {lastTransaction.date}</p>
                      <p><strong>Giờ:</strong> {lastTransaction.time}</p>
                    </div>
                    <div className="text-right">
                      <p><strong>Khách hàng:</strong> {lastTransaction.customerName}</p>
                      {lastTransaction.customerPhone && (
                        <p><strong>SĐT:</strong> {lastTransaction.customerPhone}</p>
                      )}
                      <p><strong>Thu ngân:</strong> {lastTransaction.cashier}</p>
                    </div>
                  </div>
                  
                  <table className="w-full mb-4 text-xs">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left p-2 border-b-2 border-gray-800">Sản phẩm/Dịch vụ</th>
                        <th className="text-center p-2 border-b-2 border-gray-800">SL</th>
                        <th className="text-right p-2 border-b-2 border-gray-800">Đơn giá</th>
                        <th className="text-right p-2 border-b-2 border-gray-800">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lastTransaction.items.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-200">
                          <td className="p-2">
                            {item.name}
                            <br />
                            <span className="text-[10px] text-gray-500">
                              ({item.type === 'service' ? 'Dịch vụ' : 'Sản phẩm'})
                            </span>
                          </td>
                          <td className="text-center p-2">{item.quantity}</td>
                          <td className="text-right p-2">{formatCurrency(item.price)}</td>
                          <td className="text-right p-2">{formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  <div className="text-right space-y-1 text-xs">
                    <div>Tạm tính: <span className="font-semibold">{formatCurrency(lastTransaction.subtotal)}</span></div>
                    {lastTransaction.discount > 0 && (
                      <div className="text-emerald-600">
                        Giảm giá: <span className="font-semibold">-{formatCurrency(lastTransaction.discount)}</span>
                      </div>
                    )}
                    <div>Thuế VAT (8%): <span className="font-semibold">{formatCurrency(lastTransaction.tax)}</span></div>
                    <div className="text-base font-bold text-emerald-700 border-t-2 border-gray-800 pt-2 mt-2">
                      TỔNG CỘNG: {formatCurrency(lastTransaction.total)}
                    </div>
                    <div className="text-gray-600 mt-2">
                      Phương thức: {lastTransaction.paymentMethod}
                    </div>
                  </div>
                  
                  <div className="text-center mt-4 pt-4 border-t border-dashed border-gray-400 text-xs">
                    <p className="font-medium">Cảm ơn quý khách! Hẹn gặp lại!</p>
                    <p className="text-gray-600">Hotline hỗ trợ: 0123 456 789</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setShowInvoice(false)}
                    className="flex-1 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm"
                  >
                    Đóng
                  </button>
                  <button
                    onClick={printInvoice}
                    className="flex-1 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors text-sm font-medium"
                    data-testid="print-invoice"
                  >
                    In hóa đơn
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
