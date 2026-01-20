import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'salon_memberships';
const CUSTOMERS_KEY = 'salon_customers';
const TRANSACTIONS_KEY = 'salon_membership_transactions';

const INITIAL_MEMBERSHIPS = [
  {
    id: 'MB001',
    customerId: 'CUS001',
    customerName: 'Nguyễn Văn A',
    cardNumber: 'VIP001',
    type: 'gold',
    discount: 10,
    points: 350,
    startDate: '2024-01-15',
    expiryDate: '2025-01-15',
    status: 'active'
  }
];

const MEMBERSHIP_TYPES = [
  { value: 'silver', label: 'Bạc', discount: 5, bgClass: 'bg-gray-100', textClass: 'text-gray-700', borderClass: 'border-gray-300', icon: 'fa-medal', price: 500000 },
  { value: 'gold', label: 'Vàng', discount: 10, bgClass: 'bg-yellow-100', textClass: 'text-yellow-700', borderClass: 'border-yellow-300', icon: 'fa-crown', price: 1000000 },
  { value: 'platinum', label: 'Bạch kim', discount: 15, bgClass: 'bg-blue-100', textClass: 'text-blue-700', borderClass: 'border-blue-300', icon: 'fa-gem', price: 2000000 },
  { value: 'diamond', label: 'Kim cương', discount: 20, bgClass: 'bg-purple-100', textClass: 'text-purple-700', borderClass: 'border-purple-300', icon: 'fa-star', price: 5000000 }
];

const RENEW_PERIODS = [
  { value: 3, label: '3 tháng', multiplier: 0.25 },
  { value: 6, label: '6 tháng', multiplier: 0.5 },
  { value: 12, label: '1 năm', multiplier: 1 },
  { value: 24, label: '2 năm', multiplier: 1.9 },
  { value: 0, label: 'Tùy chỉnh', multiplier: 1 }
];

export const MembershipPage = () => {
  const [memberships, setMemberships] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [editingMembership, setEditingMembership] = useState(null);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [startDateInput, setStartDateInput] = useState('');
  const [expiryDateInput, setExpiryDateInput] = useState('');
  const [pointsAction, setPointsAction] = useState('add');
  const [pointsAmount, setPointsAmount] = useState('');
  const [pointsNote, setPointsNote] = useState('');
  const [renewPeriod, setRenewPeriod] = useState(12);
  const [customMonths, setCustomMonths] = useState('');
  const [renewUpgrade, setRenewUpgrade] = useState(false);
  const [renewNewType, setRenewNewType] = useState('');
  const [renewNote, setRenewNote] = useState('');
  const [upgradeNewType, setUpgradeNewType] = useState('');
  const [upgradeNote, setUpgradeNote] = useState('');
  const [transferCustomerId, setTransferCustomerId] = useState('');
  const [transferNote, setTransferNote] = useState('');
  const [formData, setFormData] = useState({
    customerId: '',
    cardNumber: '',
    type: 'silver',
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    status: 'active'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      setLoading(true);
      
      const storedCustomers = localStorage.getItem(CUSTOMERS_KEY);
      if (storedCustomers) {
        setCustomers(JSON.parse(storedCustomers));
      }

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setMemberships(JSON.parse(stored));
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MEMBERSHIPS));
        setMemberships(INITIAL_MEMBERSHIPS);
      }

      const storedTransactions = localStorage.getItem(TRANSACTIONS_KEY);
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setMemberships(INITIAL_MEMBERSHIPS);
    } finally {
      setLoading(false);
    }
  };

  const saveMemberships = (updatedMemberships) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMemberships));
      setMemberships(updatedMemberships);
    } catch (error) {
      console.error('Error saving memberships:', error);
      alert('Có lỗi khi lưu dữ liệu!');
    }
  };

  const saveTransactions = (updatedTransactions) => {
    try {
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updatedTransactions));
      setTransactions(updatedTransactions);
    } catch (error) {
      console.error('Error saving transactions:', error);
    }
  };

  const generateId = () => {
    const existingIds = memberships.map(m => m.id);
    const numbers = existingIds
      .map(id => parseInt(id.replace('MB', '')))
      .filter(num => !isNaN(num));
    const nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    return `MB${String(nextNum).padStart(3, '0')}`;
  };

  const generateCardNumber = (type) => {
    const prefix = type.toUpperCase().substring(0, 3);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}${random}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Auto-format date input: 13032004 -> 13/03/2004
  const handleDateInput = (value, field) => {
    const digits = value.replace(/\D/g, '');
    let formatted = digits;

    if (digits.length >= 2) {
      formatted = digits.slice(0, 2);
      if (digits.length >= 4) {
        formatted += '/' + digits.slice(2, 4);
        if (digits.length >= 8) {
          formatted += '/' + digits.slice(4, 8);
        } else if (digits.length > 4) {
          formatted += '/' + digits.slice(4);
        }
      } else if (digits.length > 2) {
        formatted += '/' + digits.slice(2);
      }
    }

    if (field === 'start') {
      setStartDateInput(formatted);
    } else {
      setExpiryDateInput(formatted);
    }

    // Convert to YYYY-MM-DD format
    if (digits.length === 8) {
      const day = digits.slice(0, 2);
      const month = digits.slice(2, 4);
      const year = digits.slice(4, 8);
      
      const date = new Date(year, month - 1, day);
      if (date.getFullYear() == year && 
          date.getMonth() == month - 1 && 
          date.getDate() == day) {
        if (field === 'start') {
          setFormData({ ...formData, startDate: `${year}-${month}-${day}` });
        } else {
          setFormData({ ...formData, expiryDate: `${year}-${month}-${day}` });
        }
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      const selectedCustomer = customers.find(c => c.id === formData.customerId);
      if (!selectedCustomer) {
        alert('Vui lòng chọn khách hàng!');
        return;
      }

      const selectedType = MEMBERSHIP_TYPES.find(t => t.value === formData.type);
      
      let updatedMemberships;
      
      if (editingMembership) {
        updatedMemberships = memberships.map(m => 
          m.id === editingMembership.id 
            ? { 
                ...m, 
                ...formData,
                customerName: selectedCustomer.name,
                discount: selectedType.discount
              }
            : m
        );
      } else {
        const newMembership = {
          id: generateId(),
          ...formData,
          customerName: selectedCustomer.name,
          cardNumber: formData.cardNumber || generateCardNumber(formData.type),
          discount: selectedType.discount,
          points: 0
        };
        updatedMemberships = [...memberships, newMembership];
      }
      
      saveMemberships(updatedMemberships);
      closeModal();
    } catch (error) {
      console.error('Error saving membership:', error);
      alert('Có lỗi xảy ra khi lưu thẻ thành viên!');
    }
  };

  const handleDelete = (membershipId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thẻ thành viên này?')) {
      return;
    }

    try {
      const updatedMemberships = memberships.filter(m => m.id !== membershipId);
      saveMemberships(updatedMemberships);
    } catch (error) {
      console.error('Error deleting membership:', error);
      alert('Có lỗi xảy ra khi xóa thẻ thành viên!');
    }
  };

  const handleRenewSubmit = (e) => {
    e.preventDefault();
    
    try {
      const months = renewPeriod === 0 ? parseInt(customMonths) : renewPeriod;
      if (isNaN(months) || months <= 0) {
        alert('Vui lòng nhập số tháng hợp lệ!');
        return;
      }

      const currentExpiry = new Date(selectedMembership.expiryDate);
      const today = new Date();
      const baseDate = currentExpiry > today ? currentExpiry : today;
      
      const newExpiryDate = new Date(baseDate);
      newExpiryDate.setMonth(newExpiryDate.getMonth() + months);

      const typeToUse = renewUpgrade ? renewNewType : selectedMembership.type;
      const typeInfo = MEMBERSHIP_TYPES.find(t => t.value === typeToUse);
      
      const updatedMemberships = memberships.map(m => 
        m.id === selectedMembership.id 
          ? { 
              ...m, 
              expiryDate: newExpiryDate.toISOString().split('T')[0],
              status: 'active',
              type: typeToUse,
              discount: typeInfo.discount
            }
          : m
      );
      
      saveMemberships(updatedMemberships);
      
      // Add transaction
      const period = RENEW_PERIODS.find(p => p.value === renewPeriod);
      const renewFee = typeInfo.price * (period?.multiplier || (months / 12));
      const newTransaction = {
        id: `TXN${Date.now()}`,
        membershipId: selectedMembership.id,
        type: renewUpgrade ? 'upgrade_renew' : 'renew',
        description: renewNote || `Gia hạn ${months} tháng${renewUpgrade ? ` + Nâng cấp lên ${typeInfo.label}` : ''}`,
        amount: renewFee,
        months: months,
        date: new Date().toISOString()
      };
      saveTransactions([...transactions, newTransaction]);
      
      closeRenewModal();
      alert('Gia hạn thẻ thành công!');
    } catch (error) {
      console.error('Error renewing membership:', error);
      alert('Có lỗi xảy ra!');
    }
  };

  const handleUpgradeSubmit = (e) => {
    e.preventDefault();
    
    try {
      const newTypeInfo = MEMBERSHIP_TYPES.find(t => t.value === upgradeNewType);
      const oldTypeInfo = MEMBERSHIP_TYPES.find(t => t.value === selectedMembership.type);
      
      if (MEMBERSHIP_TYPES.findIndex(t => t.value === upgradeNewType) <= 
          MEMBERSHIP_TYPES.findIndex(t => t.value === selectedMembership.type)) {
        if (!window.confirm('Bạn đang hạ cấp thẻ. Bạn có chắc chắn?')) {
          return;
        }
      }
      
      const updatedMemberships = memberships.map(m => 
        m.id === selectedMembership.id 
          ? { 
              ...m, 
              type: upgradeNewType,
              discount: newTypeInfo.discount
            }
          : m
      );
      
      saveMemberships(updatedMemberships);
      
      // Add transaction
      const priceDiff = newTypeInfo.price - oldTypeInfo.price;
      const newTransaction = {
        id: `TXN${Date.now()}`,
        membershipId: selectedMembership.id,
        type: priceDiff > 0 ? 'upgrade' : 'downgrade',
        description: upgradeNote || `${priceDiff > 0 ? 'Nâng cấp' : 'Hạ cấp'} từ ${oldTypeInfo.label} lên ${newTypeInfo.label}`,
        amount: Math.abs(priceDiff),
        date: new Date().toISOString()
      };
      saveTransactions([...transactions, newTransaction]);
      
      closeUpgradeModal();
      alert('Cập nhật loại thẻ thành công!');
    } catch (error) {
      console.error('Error upgrading membership:', error);
      alert('Có lỗi xảy ra!');
    }
  };

  const handleSuspend = (membership) => {
    if (!window.confirm('Bạn có muốn tạm khóa thẻ này?')) {
      return;
    }

    try {
      const updatedMemberships = memberships.map(m => 
        m.id === membership.id 
          ? { ...m, status: 'suspended' }
          : m
      );
      
      saveMemberships(updatedMemberships);
      
      const newTransaction = {
        id: `TXN${Date.now()}`,
        membershipId: membership.id,
        type: 'suspend',
        description: 'Tạm khóa thẻ thành viên',
        date: new Date().toISOString()
      };
      saveTransactions([...transactions, newTransaction]);
      
      alert('Đã tạm khóa thẻ!');
    } catch (error) {
      console.error('Error suspending membership:', error);
      alert('Có lỗi xảy ra!');
    }
  };

  const handleActivate = (membership) => {
    try {
      const updatedMemberships = memberships.map(m => 
        m.id === membership.id 
          ? { ...m, status: 'active' }
          : m
      );
      
      saveMemberships(updatedMemberships);
      
      const newTransaction = {
        id: `TXN${Date.now()}`,
        membershipId: membership.id,
        type: 'activate',
        description: 'Kích hoạt lại thẻ thành viên',
        date: new Date().toISOString()
      };
      saveTransactions([...transactions, newTransaction]);
      
      alert('Đã kích hoạt thẻ!');
    } catch (error) {
      console.error('Error activating membership:', error);
      alert('Có lỗi xảy ra!');
    }
  };

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    
    try {
      const newCustomer = customers.find(c => c.id === transferCustomerId);
      if (!newCustomer) {
        alert('Vui lòng chọn khách hàng mới!');
        return;
      }

      if (newCustomer.id === selectedMembership.customerId) {
        alert('Không thể chuyển cho cùng một khách hàng!');
        return;
      }

      const updatedMemberships = memberships.map(m => 
        m.id === selectedMembership.id 
          ? { 
              ...m, 
              customerId: newCustomer.id,
              customerName: newCustomer.name
            }
          : m
      );
      
      saveMemberships(updatedMemberships);
      
      const newTransaction = {
        id: `TXN${Date.now()}`,
        membershipId: selectedMembership.id,
        type: 'transfer',
        description: transferNote || `Chuyển nhượng thẻ từ ${selectedMembership.customerName} sang ${newCustomer.name}`,
        date: new Date().toISOString()
      };
      saveTransactions([...transactions, newTransaction]);
      
      closeTransferModal();
      alert('Chuyển nhượng thẻ thành công!');
    } catch (error) {
      console.error('Error transferring membership:', error);
      alert('Có lỗi xảy ra!');
    }
  };

  const handlePointsSubmit = (e) => {
    e.preventDefault();
    
    try {
      const amount = parseInt(pointsAmount);
      if (isNaN(amount) || amount <= 0) {
        alert('Vui lòng nhập số điểm hợp lệ!');
        return;
      }

      const updatedMemberships = memberships.map(m => {
        if (m.id === selectedMembership.id) {
          const newPoints = pointsAction === 'add' 
            ? (m.points || 0) + amount 
            : Math.max(0, (m.points || 0) - amount);
          return { ...m, points: newPoints };
        }
        return m;
      });
      
      saveMemberships(updatedMemberships);
      
      const newTransaction = {
        id: `TXN${Date.now()}`,
        membershipId: selectedMembership.id,
        type: pointsAction === 'add' ? 'points_add' : 'points_redeem',
        amount: amount,
        description: pointsNote || (pointsAction === 'add' ? 'Tích điểm' : 'Đổi điểm'),
        date: new Date().toISOString()
      };
      saveTransactions([...transactions, newTransaction]);
      
      closePointsModal();
    } catch (error) {
      console.error('Error updating points:', error);
      alert('Có lỗi xảy ra!');
    }
  };

  const handleExport = (membership) => {
    const typeInfo = getMembershipTypeInfo(membership.type);
    const membershipTransactions = transactions.filter(t => t.membershipId === membership.id);
    
    const exportData = `
=== THÔNG TIN THẺ THÀNH VIÊN ===

Mã thẻ: ${membership.id}
Số thẻ: ${membership.cardNumber}
Khách hàng: ${membership.customerName}
Loại thẻ: ${typeInfo.label}
Giảm giá: ${membership.discount}%
Điểm tích lũy: ${membership.points || 0}
Ngày bắt đầu: ${new Date(membership.startDate).toLocaleDateString('vi-VN')}
Ngày hết hạn: ${new Date(membership.expiryDate).toLocaleDateString('vi-VN')}
Trạng thái: ${membership.status === 'active' ? 'Hoạt động' : membership.status === 'suspended' ? 'Tạm khóa' : 'Hết hạn'}

=== LỊCH SỬ GIAO DỊCH ===
${membershipTransactions.length === 0 ? 'Chưa có giao dịch' : membershipTransactions.map(t => `
- ${new Date(t.date).toLocaleString('vi-VN')}: ${t.description}${t.amount ? ` (${t.amount})` : ''}`).join('\n')}

Xuất ngày: ${new Date().toLocaleString('vi-VN')}
    `.trim();

    const blob = new Blob([exportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `membership_${membership.cardNumber}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const openModal = (membership = null) => {
    if (membership) {
      setEditingMembership(membership);
      
      const startParts = membership.startDate.split('-');
      const startDisplay = `${startParts[2]}/${startParts[1]}/${startParts[0]}`;
      setStartDateInput(startDisplay);
      
      const expiryParts = membership.expiryDate.split('-');
      const expiryDisplay = `${expiryParts[2]}/${expiryParts[1]}/${expiryParts[0]}`;
      setExpiryDateInput(expiryDisplay);
      
      setFormData({
        customerId: membership.customerId,
        cardNumber: membership.cardNumber,
        type: membership.type,
        startDate: membership.startDate,
        expiryDate: membership.expiryDate,
        status: membership.status
      });
    } else {
      setEditingMembership(null);
      
      const today = new Date();
      const startDisplay = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
      setStartDateInput(startDisplay);
      
      const oneYearLater = new Date();
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
      const expiryDisplay = `${String(oneYearLater.getDate()).padStart(2, '0')}/${String(oneYearLater.getMonth() + 1).padStart(2, '0')}/${oneYearLater.getFullYear()}`;
      setExpiryDateInput(expiryDisplay);
      
      setFormData({
        customerId: '',
        cardNumber: '',
        type: 'silver',
        startDate: new Date().toISOString().split('T')[0],
        expiryDate: oneYearLater.toISOString().split('T')[0],
        status: 'active'
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMembership(null);
  };

  const openPointsModal = (membership) => {
    setSelectedMembership(membership);
    setPointsAction('add');
    setPointsAmount('');
    setPointsNote('');
    setIsPointsModalOpen(true);
  };

  const closePointsModal = () => {
    setIsPointsModalOpen(false);
    setSelectedMembership(null);
  };

  const openHistoryModal = (membership) => {
    setSelectedMembership(membership);
    setIsHistoryModalOpen(true);
  };

  const closeHistoryModal = () => {
    setIsHistoryModalOpen(false);
    setSelectedMembership(null);
  };

  const openRenewModal = (membership) => {
    setSelectedMembership(membership);
    setRenewPeriod(12);
    setCustomMonths('');
    setRenewUpgrade(false);
    setRenewNewType(membership.type);
    setRenewNote('');
    setIsRenewModalOpen(true);
  };

  const closeRenewModal = () => {
    setIsRenewModalOpen(false);
    setSelectedMembership(null);
  };

  const openUpgradeModal = (membership) => {
    setSelectedMembership(membership);
    const currentIndex = MEMBERSHIP_TYPES.findIndex(t => t.value === membership.type);
    setUpgradeNewType(MEMBERSHIP_TYPES[Math.min(currentIndex + 1, MEMBERSHIP_TYPES.length - 1)].value);
    setUpgradeNote('');
    setIsUpgradeModalOpen(true);
  };

  const closeUpgradeModal = () => {
    setIsUpgradeModalOpen(false);
    setSelectedMembership(null);
  };

  const openViewModal = (membership) => {
    setSelectedMembership(membership);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedMembership(null);
  };

  const openTransferModal = (membership) => {
    setSelectedMembership(membership);
    setTransferCustomerId('');
    setTransferNote('');
    setIsTransferModalOpen(true);
  };

  const closeTransferModal = () => {
    setIsTransferModalOpen(false);
    setSelectedMembership(null);
  };

  const getMembershipTypeInfo = (type) => {
    return MEMBERSHIP_TYPES.find(t => t.value === type) || MEMBERSHIP_TYPES[0];
  };

  const isExpiringSoon = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  };

  const isExpired = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    return expiry < today;
  };

  const calculateRenewFee = () => {
    if (!selectedMembership) return 0;
    const typeToUse = renewUpgrade ? renewNewType : selectedMembership.type;
    const typeInfo = MEMBERSHIP_TYPES.find(t => t.value === typeToUse);
    const period = RENEW_PERIODS.find(p => p.value === renewPeriod);
    
    if (renewPeriod === 0) {
      const months = parseInt(customMonths) || 0;
      return typeInfo.price * (months / 12);
    }
    
    return typeInfo.price * (period?.multiplier || 1);
  };

  const calculateNewExpiryDate = () => {
    if (!selectedMembership) return '';
    const months = renewPeriod === 0 ? parseInt(customMonths) || 0 : renewPeriod;
    const currentExpiry = new Date(selectedMembership.expiryDate);
    const today = new Date();
    const baseDate = currentExpiry > today ? currentExpiry : today;
    
    const newDate = new Date(baseDate);
    newDate.setMonth(newDate.getMonth() + months);
    return newDate.toLocaleDateString('vi-VN');
  };

  // Statistics
  const stats = useMemo(() => {
    return {
      total: memberships.length,
      active: memberships.filter(m => m.status === 'active').length,
      expired: memberships.filter(m => m.status === 'expired').length,
      suspended: memberships.filter(m => m.status === 'suspended').length,
      expiringSoon: memberships.filter(m => isExpiringSoon(m.expiryDate) && m.status === 'active').length,
      totalPoints: memberships.reduce((sum, m) => sum + (m.points || 0), 0),
    };
  }, [memberships]);

  // Filtered memberships
  const filteredMemberships = useMemo(() => {
    let filtered = memberships;

    if (filterType !== 'all') {
      filtered = filtered.filter(m => m.type === filterType);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(m => m.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(m => 
        m.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.cardNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [memberships, filterType, filterStatus, searchTerm]);

  const membershipTransactions = useMemo(() => {
    if (!selectedMembership) return [];
    return transactions.filter(t => t.membershipId === selectedMembership.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, selectedMembership]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header - Compact */}
      <div className="bg-white border-b border-gray-200 px-3 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-800">Quản lý thẻ thành viên</h1>
            <p className="text-xs text-gray-600">Quản lý thẻ membership và ưu đãi</p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-3 text-xs">
            <div className="text-center">
              <p className="font-bold text-blue-600">{stats.active}</p>
              <p className="text-gray-500">Hoạt động</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-orange-600">{stats.expiringSoon}</p>
              <p className="text-gray-500">Sắp hết hạn</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-purple-600">{stats.totalPoints}</p>
              <p className="text-gray-500">Tổng điểm</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions & Filters - Compact */}
      <div className="bg-white border-b border-gray-200 px-3 py-2">
        <div className="flex gap-2 flex-wrap items-center">
          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            data-testid="type-filter"
          >
            <option value="all">Tất cả loại thẻ</option>
            {MEMBERSHIP_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            data-testid="status-filter"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="suspended">Tạm khóa</option>
            <option value="expired">Hết hạn</option>
          </select>

          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Tìm khách hàng, số thẻ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              data-testid="search-memberships"
            />
            <i className="fa-solid fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          </div>
          
          {/* Add Button */}
          <motion.button
            onClick={() => openModal()}
            className="ml-auto px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors font-medium text-xs flex items-center gap-1.5"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            data-testid="add-membership-button"
          >
            <i className="fa-solid fa-plus" />
            Thêm thẻ
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : filteredMemberships.length === 0 ? (
          <div className="text-center py-20">
            <i className="fa-solid fa-id-card text-5xl text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">Không tìm thấy thẻ thành viên nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {filteredMemberships.map((membership) => {
              const typeInfo = getMembershipTypeInfo(membership.type);
              const expiringSoon = isExpiringSoon(membership.expiryDate);
              const expired = isExpired(membership.expiryDate);
              
              return (
                <motion.div
                  key={membership.id}
                  className="bg-white rounded border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  data-testid={`membership-card-${membership.id}`}
                >
                  <div className={`p-2 ${typeInfo.bgClass} border-b border-gray-200`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <i className={`fa-solid ${typeInfo.icon} ${typeInfo.textClass} text-sm`} />
                          <h3 className="font-semibold text-gray-800 text-xs truncate">{membership.customerName}</h3>
                        </div>
                        <p className="text-[10px] text-gray-600 truncate">{membership.cardNumber}</p>
                      </div>
                      <div className="flex flex-col gap-0.5 items-end">
                        <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${
                          membership.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : membership.status === 'suspended'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {membership.status === 'active' ? 'Hoạt động' : membership.status === 'suspended' ? 'Tạm khóa' : 'Hết hạn'}
                        </span>
                        {expiringSoon && membership.status === 'active' && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-red-100 text-red-700 rounded">
                            Sắp hết hạn
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <div className="space-y-1 mb-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Loại thẻ:</span>
                        <span className={`font-semibold ${typeInfo.textClass}`}>{typeInfo.label}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Giảm giá:</span>
                        <span className="font-semibold text-emerald-700">{membership.discount}%</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Điểm:</span>
                        <span className="font-semibold text-purple-700">{membership.points || 0}</span>
                      </div>
                    </div>

                    <div className="space-y-0.5 mb-2 pb-2 border-b border-gray-100">
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <i className="fa-solid fa-calendar text-blue-600 w-3" />
                        <span className="text-gray-600">Từ:</span>
                        <span className="font-medium text-gray-800">{new Date(membership.startDate).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <i className={`fa-solid fa-calendar-xmark w-3 ${expired ? 'text-red-600' : expiringSoon ? 'text-orange-600' : 'text-gray-600'}`} />
                        <span className="text-gray-600">Đến:</span>
                        <span className={`font-medium ${expired ? 'text-red-600' : expiringSoon ? 'text-orange-600' : 'text-gray-800'}`}>
                          {new Date(membership.expiryDate).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1 mb-1">
                      <button
                        onClick={() => openViewModal(membership)}
                        className="px-2 py-1 bg-gray-50 text-gray-700 rounded hover:bg-gray-100 transition-colors text-[10px] font-medium"
                        title="Xem chi tiết"
                        data-testid={`view-${membership.id}`}
                      >
                        <i className="fa-solid fa-eye" />
                      </button>
                      <button
                        onClick={() => openPointsModal(membership)}
                        className="px-2 py-1 bg-purple-50 text-purple-700 rounded hover:bg-purple-100 transition-colors text-[10px] font-medium"
                        title="Quản lý điểm"
                        data-testid={`points-${membership.id}`}
                      >
                        <i className="fa-solid fa-coins" />
                      </button>
                      <button
                        onClick={() => openRenewModal(membership)}
                        className="px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors text-[10px] font-medium"
                        title="Gia hạn"
                        data-testid={`renew-${membership.id}`}
                      >
                        <i className="fa-solid fa-rotate" />
                      </button>
                      <button
                        onClick={() => openUpgradeModal(membership)}
                        className="px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors text-[10px] font-medium"
                        title="Nâng/hạ cấp"
                        data-testid={`upgrade-${membership.id}`}
                      >
                        <i className="fa-solid fa-arrow-up" />
                      </button>
                      <button
                        onClick={() => openTransferModal(membership)}
                        className="px-2 py-1 bg-amber-50 text-amber-700 rounded hover:bg-amber-100 transition-colors text-[10px] font-medium"
                        title="Chuyển nhượng"
                        data-testid={`transfer-${membership.id}`}
                      >
                        <i className="fa-solid fa-exchange-alt" />
                      </button>
                      <button
                        onClick={() => openHistoryModal(membership)}
                        className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 transition-colors text-[10px] font-medium"
                        title="Lịch sử"
                        data-testid={`history-${membership.id}`}
                      >
                        <i className="fa-solid fa-history" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-1">
                      {membership.status === 'active' ? (
                        <button
                          onClick={() => handleSuspend(membership)}
                          className="px-2 py-1 bg-orange-50 text-orange-700 rounded hover:bg-orange-100 transition-colors text-[10px] font-medium"
                          data-testid={`suspend-${membership.id}`}
                        >
                          <i className="fa-solid fa-lock mr-0.5" />
                          Khóa
                        </button>
                      ) : membership.status === 'suspended' ? (
                        <button
                          onClick={() => handleActivate(membership)}
                          className="px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors text-[10px] font-medium"
                          data-testid={`activate-${membership.id}`}
                        >
                          <i className="fa-solid fa-unlock mr-0.5" />
                          Mở khóa
                        </button>
                      ) : (
                        <button
                          onClick={() => openRenewModal(membership)}
                          className="px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors text-[10px] font-medium"
                          data-testid={`renew-expired-${membership.id}`}
                        >
                          <i className="fa-solid fa-rotate mr-0.5" />
                          Gia hạn
                        </button>
                      )}
                      <button
                        onClick={() => handleExport(membership)}
                        className="px-2 py-1 bg-teal-50 text-teal-700 rounded hover:bg-teal-100 transition-colors text-[10px] font-medium"
                        data-testid={`export-${membership.id}`}
                      >
                        <i className="fa-solid fa-download mr-0.5" />
                        Xuất
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Membership Modal - Compact */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              data-testid="membership-modal"
            >
              <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-amber-50 sticky top-0 z-10">
                <h2 className="text-base font-bold text-gray-800">
                  {editingMembership ? 'Cập nhật thẻ' : 'Thêm thẻ mới'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                  data-testid="close-modal"
                >
                  <i className="fa-solid fa-xmark text-gray-700" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-3">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Khách hàng <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.customerId}
                      onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      data-testid="membership-customer-select"
                      disabled={editingMembership}
                    >
                      <option value="">Chọn khách hàng</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} - {customer.phone}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Loại thẻ <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      data-testid="membership-type-select"
                    >
                      {MEMBERSHIP_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label} - Giảm {type.discount}% ({formatCurrency(type.price)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Số thẻ (tự động nếu để trống)
                    </label>
                    <input
                      type="text"
                      value={formData.cardNumber}
                      onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="VIP001"
                      data-testid="membership-cardnumber-input"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Ngày bắt đầu <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={startDateInput}
                        onChange={(e) => handleDateInput(e.target.value, 'start')}
                        placeholder="13/03/2024"
                        maxLength="10"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        data-testid="membership-startdate-input"
                      />
                      <p className="text-[10px] text-gray-500 mt-0.5">VD: 13032024</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Ngày hết hạn <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={expiryDateInput}
                        onChange={(e) => handleDateInput(e.target.value, 'expiry')}
                        placeholder="13/03/2025"
                        maxLength="10"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        data-testid="membership-expirydate-input"
                      />
                      <p className="text-[10px] text-gray-500 mt-0.5">VD: 13032025</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Trạng thái
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      data-testid="membership-status-select"
                    >
                      <option value="active">Hoạt động</option>
                      <option value="suspended">Tạm khóa</option>
                      <option value="expired">Hết hạn</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                  <button
                    type="submit"
                    className="w-full px-3 py-2 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors font-medium"
                    data-testid="submit-membership"
                  >
                    {editingMembership ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Renew Modal - Full Featured */}
      <AnimatePresence>
        {isRenewModalOpen && selectedMembership && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeRenewModal}
          >
            <motion.div
              className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              data-testid="renew-modal"
            >
              <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-green-50 sticky top-0 z-10">
                <h2 className="text-base font-bold text-gray-800">Gia hạn thẻ thành viên</h2>
                <button
                  onClick={closeRenewModal}
                  className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                >
                  <i className="fa-solid fa-xmark text-gray-700" />
                </button>
              </div>

              <form onSubmit={handleRenewSubmit} className="p-3">
                <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-200">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-gray-800">{selectedMembership.customerName}</p>
                    <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${getMembershipTypeInfo(selectedMembership.type).bgClass} ${getMembershipTypeInfo(selectedMembership.type).textClass}`}>
                      {getMembershipTypeInfo(selectedMembership.type).label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{selectedMembership.cardNumber}</p>
                  <div className="mt-2 pt-2 border-t border-blue-200">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Hết hạn hiện tại:</span>
                      <span className={`font-semibold ${isExpired(selectedMembership.expiryDate) ? 'text-red-600' : 'text-gray-800'}`}>
                        {new Date(selectedMembership.expiryDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    {calculateNewExpiryDate() && (
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-gray-600">Hết hạn mới:</span>
                        <span className="font-semibold text-green-600">{calculateNewExpiryDate()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Thời gian gia hạn <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {RENEW_PERIODS.map(period => (
                        <button
                          key={period.value}
                          type="button"
                          onClick={() => setRenewPeriod(period.value)}
                          className={`px-3 py-2 text-xs rounded transition-colors ${
                            renewPeriod === period.value
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {period.label}
                        </button>
                      ))}
                    </div>
                    {renewPeriod === 0 && (
                      <input
                        type="number"
                        min="1"
                        required
                        value={customMonths}
                        onChange={(e) => setCustomMonths(e.target.value)}
                        placeholder="Nhập số tháng"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent mt-2"
                      />
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-2">
                      <input
                        type="checkbox"
                        checked={renewUpgrade}
                        onChange={(e) => {
                          setRenewUpgrade(e.target.checked);
                          if (e.target.checked && !renewNewType) {
                            setRenewNewType(selectedMembership.type);
                          }
                        }}
                        className="rounded"
                      />
                      Nâng cấp loại thẻ khi gia hạn
                    </label>
                    {renewUpgrade && (
                      <select
                        value={renewNewType}
                        onChange={(e) => setRenewNewType(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        {MEMBERSHIP_TYPES.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label} - Giảm {type.discount}% ({formatCurrency(type.price)})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="p-2 bg-amber-50 rounded border border-amber-200">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">Phí gia hạn:</span>
                      <span className="font-bold text-green-600">{formatCurrency(calculateRenewFee())}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Ghi chú
                    </label>
                    <textarea
                      value={renewNote}
                      onChange={(e) => setRenewNote(e.target.value)}
                      rows="2"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Ghi chú về gia hạn..."
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                  <button
                    type="submit"
                    className="w-full px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium"
                    data-testid="submit-renew"
                  >
                    Xác nhận gia hạn
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upgrade Modal */}
      <AnimatePresence>
        {isUpgradeModalOpen && selectedMembership && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeUpgradeModal}
          >
            <motion.div
              className="bg-white rounded-lg shadow-2xl w-full max-w-md"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              data-testid="upgrade-modal"
            >
              <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-blue-50">
                <h2 className="text-base font-bold text-gray-800">Nâng/Hạ cấp thẻ</h2>
                <button
                  onClick={closeUpgradeModal}
                  className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                >
                  <i className="fa-solid fa-xmark text-gray-700" />
                </button>
              </div>

              <form onSubmit={handleUpgradeSubmit} className="p-3">
                <div className="mb-3 p-2 bg-gray-50 rounded">
                  <p className="text-xs font-semibold text-gray-800">{selectedMembership.customerName}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-600">Loại thẻ hiện tại:</span>
                    <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${getMembershipTypeInfo(selectedMembership.type).bgClass} ${getMembershipTypeInfo(selectedMembership.type).textClass}`}>
                      {getMembershipTypeInfo(selectedMembership.type).label}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Loại thẻ mới <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={upgradeNewType}
                      onChange={(e) => setUpgradeNewType(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {MEMBERSHIP_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label} - Giảm {type.discount}% ({formatCurrency(type.price)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Ghi chú
                    </label>
                    <textarea
                      value={upgradeNote}
                      onChange={(e) => setUpgradeNote(e.target.value)}
                      rows="2"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ghi chú về thay đổi..."
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                  <button
                    type="submit"
                    className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
                    data-testid="submit-upgrade"
                  >
                    Xác nhận thay đổi
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transfer Modal */}
      <AnimatePresence>
        {isTransferModalOpen && selectedMembership && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeTransferModal}
          >
            <motion.div
              className="bg-white rounded-lg shadow-2xl w-full max-w-md"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              data-testid="transfer-modal"
            >
              <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-amber-50">
                <h2 className="text-base font-bold text-gray-800">Chuyển nhượng thẻ</h2>
                <button
                  onClick={closeTransferModal}
                  className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                >
                  <i className="fa-solid fa-xmark text-gray-700" />
                </button>
              </div>

              <form onSubmit={handleTransferSubmit} className="p-3">
                <div className="mb-3 p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-600">Chủ thẻ hiện tại:</p>
                  <p className="text-sm font-semibold text-gray-800">{selectedMembership.customerName}</p>
                  <p className="text-xs text-gray-600 mt-1">{selectedMembership.cardNumber}</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Khách hàng mới <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={transferCustomerId}
                      onChange={(e) => setTransferCustomerId(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option value="">Chọn khách hàng mới</option>
                      {customers.filter(c => c.id !== selectedMembership.customerId).map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} - {customer.phone}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Lý do chuyển nhượng
                    </label>
                    <textarea
                      value={transferNote}
                      onChange={(e) => setTransferNote(e.target.value)}
                      rows="2"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Ghi chú về chuyển nhượng..."
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                  <button
                    type="submit"
                    className="w-full px-3 py-2 text-sm bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors font-medium"
                    data-testid="submit-transfer"
                  >
                    Xác nhận chuyển nhượng
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Details Modal */}
      <AnimatePresence>
        {isViewModalOpen && selectedMembership && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeViewModal}
          >
            <motion.div
              className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              data-testid="view-modal"
            >
              <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
                <h2 className="text-base font-bold text-gray-800">Chi tiết thẻ thành viên</h2>
                <button
                  onClick={closeViewModal}
                  className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                >
                  <i className="fa-solid fa-xmark text-gray-700" />
                </button>
              </div>

              <div className="p-3">
                {(() => {
                  const typeInfo = getMembershipTypeInfo(selectedMembership.type);
                  const expiringSoon = isExpiringSoon(selectedMembership.expiryDate);
                  const expired = isExpired(selectedMembership.expiryDate);
                  const daysUntilExpiry = Math.ceil((new Date(selectedMembership.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <>
                      <div className={`p-3 ${typeInfo.bgClass} rounded border ${typeInfo.borderClass} mb-3`}>
                        <div className="flex items-center gap-2 mb-2">
                          <i className={`fa-solid ${typeInfo.icon} ${typeInfo.textClass} text-2xl`} />
                          <div>
                            <h3 className="font-bold text-gray-800 text-base">{selectedMembership.customerName}</h3>
                            <p className="text-sm text-gray-600">{selectedMembership.cardNumber}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            selectedMembership.status === 'active' 
                              ? 'bg-green-100 text-green-700' 
                              : selectedMembership.status === 'suspended'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {selectedMembership.status === 'active' ? 'Hoạt động' : selectedMembership.status === 'suspended' ? 'Tạm khóa' : 'Hết hạn'}
                          </span>
                          <span className={`text-sm font-bold ${typeInfo.textClass}`}>
                            {typeInfo.label}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="p-2 bg-gray-50 rounded">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Giảm giá:</span>
                            <span className="font-semibold text-emerald-700">{selectedMembership.discount}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Điểm tích lũy:</span>
                            <span className="font-semibold text-purple-700">{selectedMembership.points || 0} điểm</span>
                          </div>
                        </div>

                        <div className="p-2 bg-blue-50 rounded">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Ngày bắt đầu:</span>
                            <span className="font-medium text-gray-800">{new Date(selectedMembership.startDate).toLocaleDateString('vi-VN')}</span>
                          </div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Ngày hết hạn:</span>
                            <span className={`font-medium ${expired ? 'text-red-600' : expiringSoon ? 'text-orange-600' : 'text-gray-800'}`}>
                              {new Date(selectedMembership.expiryDate).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          {!expired && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Còn lại:</span>
                              <span className={`font-medium ${expiringSoon ? 'text-orange-600' : 'text-gray-800'}`}>
                                {daysUntilExpiry} ngày
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="p-2 bg-amber-50 rounded">
                          <p className="text-xs text-gray-600 mb-1">Giá trị thẻ:</p>
                          <p className="text-sm font-bold text-amber-700">{formatCurrency(typeInfo.price)}</p>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs font-medium text-gray-700 mb-2">Thống kê giao dịch</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 bg-green-50 rounded text-center">
                            <p className="text-xs text-gray-600">Tích điểm</p>
                            <p className="text-sm font-bold text-green-700">
                              {transactions.filter(t => t.membershipId === selectedMembership.id && t.type === 'points_add').length}
                            </p>
                          </div>
                          <div className="p-2 bg-orange-50 rounded text-center">
                            <p className="text-xs text-gray-600">Đổi điểm</p>
                            <p className="text-sm font-bold text-orange-700">
                              {transactions.filter(t => t.membershipId === selectedMembership.id && t.type === 'points_redeem').length}
                            </p>
                          </div>
                          <div className="p-2 bg-blue-50 rounded text-center">
                            <p className="text-xs text-gray-600">Gia hạn</p>
                            <p className="text-sm font-bold text-blue-700">
                              {transactions.filter(t => t.membershipId === selectedMembership.id && (t.type === 'renew' || t.type === 'upgrade_renew')).length}
                            </p>
                          </div>
                          <div className="p-2 bg-purple-50 rounded text-center">
                            <p className="text-xs text-gray-600">Nâng cấp</p>
                            <p className="text-sm font-bold text-purple-700">
                              {transactions.filter(t => t.membershipId === selectedMembership.id && (t.type === 'upgrade' || t.type === 'downgrade')).length}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Points Modal */}
      <AnimatePresence>
        {isPointsModalOpen && selectedMembership && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePointsModal}
          >
            <motion.div
              className="bg-white rounded-lg shadow-2xl w-full max-w-md"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              data-testid="points-modal"
            >
              <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-purple-50">
                <h2 className="text-base font-bold text-gray-800">Quản lý điểm</h2>
                <button
                  onClick={closePointsModal}
                  className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                >
                  <i className="fa-solid fa-xmark text-gray-700" />
                </button>
              </div>

              <form onSubmit={handlePointsSubmit} className="p-3">
                <div className="mb-3 p-2 bg-purple-50 rounded">
                  <p className="text-xs text-gray-700">
                    <span className="font-semibold">{selectedMembership.customerName}</span>
                  </p>
                  <p className="text-sm font-bold text-purple-700">
                    Điểm hiện tại: {selectedMembership.points || 0}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Thao tác
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPointsAction('add')}
                        className={`flex-1 px-3 py-2 text-sm rounded transition-colors ${
                          pointsAction === 'add'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <i className="fa-solid fa-plus mr-1" />
                        Thêm điểm
                      </button>
                      <button
                        type="button"
                        onClick={() => setPointsAction('redeem')}
                        className={`flex-1 px-3 py-2 text-sm rounded transition-colors ${
                          pointsAction === 'redeem'
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <i className="fa-solid fa-minus mr-1" />
                        Đổi điểm
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Số điểm <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={pointsAmount}
                      onChange={(e) => setPointsAmount(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Nhập số điểm"
                      data-testid="points-amount-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Ghi chú
                    </label>
                    <textarea
                      value={pointsNote}
                      onChange={(e) => setPointsNote(e.target.value)}
                      rows="2"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Ghi chú về giao dịch..."
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                  <button
                    type="submit"
                    className="w-full px-3 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors font-medium"
                    data-testid="submit-points"
                  >
                    Xác nhận
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {isHistoryModalOpen && selectedMembership && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeHistoryModal}
          >
            <motion.div
              className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              data-testid="history-modal"
            >
              <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-indigo-50 sticky top-0 z-10">
                <h2 className="text-base font-bold text-gray-800">Lịch sử giao dịch</h2>
                <button
                  onClick={closeHistoryModal}
                  className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                >
                  <i className="fa-solid fa-xmark text-gray-700" />
                </button>
              </div>

              <div className="p-3">
                <div className="mb-3 p-2 bg-indigo-50 rounded">
                  <p className="text-xs text-gray-700">
                    <span className="font-semibold">{selectedMembership.customerName}</span>
                  </p>
                  <p className="text-xs text-gray-600">{selectedMembership.cardNumber}</p>
                </div>

                {membershipTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="fa-solid fa-history text-4xl text-gray-300 mb-2" />
                    <p className="text-gray-500 text-sm">Chưa có giao dịch nào</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {membershipTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="p-2 bg-gray-50 rounded border border-gray-200"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <i className={`fa-solid ${
                              transaction.type === 'points_add' ? 'fa-plus text-green-600' :
                              transaction.type === 'points_redeem' ? 'fa-minus text-orange-600' :
                              transaction.type === 'renew' ? 'fa-rotate text-green-600' :
                              transaction.type === 'upgrade_renew' ? 'fa-arrow-up text-blue-600' :
                              transaction.type === 'upgrade' ? 'fa-arrow-up text-blue-600' :
                              transaction.type === 'downgrade' ? 'fa-arrow-down text-orange-600' :
                              transaction.type === 'suspend' ? 'fa-lock text-orange-600' :
                              transaction.type === 'activate' ? 'fa-unlock text-green-600' :
                              transaction.type === 'transfer' ? 'fa-exchange-alt text-amber-600' :
                              'fa-circle text-gray-600'
                            } text-xs`} />
                            <span className="text-xs font-medium text-gray-800">
                              {transaction.type === 'points_add' ? 'Tích điểm' :
                               transaction.type === 'points_redeem' ? 'Đổi điểm' :
                               transaction.type === 'renew' ? 'Gia hạn' :
                               transaction.type === 'upgrade_renew' ? 'Gia hạn + Nâng cấp' :
                               transaction.type === 'upgrade' ? 'Nâng cấp' :
                               transaction.type === 'downgrade' ? 'Hạ cấp' :
                               transaction.type === 'suspend' ? 'Tạm khóa' :
                               transaction.type === 'activate' ? 'Kích hoạt' :
                               transaction.type === 'transfer' ? 'Chuyển nhượng' :
                               'Khác'}
                            </span>
                          </div>
                          {transaction.amount && (
                            <span className={`text-xs font-bold ${
                              transaction.type === 'points_add' ? 'text-green-600' : 
                              transaction.type === 'points_redeem' ? 'text-orange-600' :
                              'text-blue-600'
                            }`}>
                              {transaction.type === 'points_add' ? '+' : 
                               transaction.type === 'points_redeem' ? '-' : ''}
                              {transaction.type.includes('points') ? transaction.amount : formatCurrency(transaction.amount)}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-600">{transaction.description}</p>
                        {transaction.months && (
                          <p className="text-[10px] text-blue-600 mt-0.5">Thời hạn: {transaction.months} tháng</p>
                        )}
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {new Date(transaction.date).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
