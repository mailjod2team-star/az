import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'salon_settings';

const TABS = [
  { id: 'business', label: 'Thông tin doanh nghiệp', icon: 'fa-building' },
  { id: 'payment', label: 'Thanh toán', icon: 'fa-credit-card' },
  { id: 'sms', label: 'SMS', icon: 'fa-comment-sms' },
  { id: 'email', label: 'Email', icon: 'fa-envelope' },
  { id: 'printer', label: 'Máy in', icon: 'fa-print' },
  { id: 'notifications', label: 'Thông báo', icon: 'fa-bell' },
  { id: 'system', label: 'Hệ thống', icon: 'fa-cog' },
  { id: 'backup', label: 'Sao lưu', icon: 'fa-database' }
];

const DEFAULT_SETTINGS = {
  business: {
    name: 'DEAR Salon',
    phone: '',
    email: '',
    address: '',
    taxCode: '',
    website: '',
    description: '',
    logo: '',
    openTime: '08:00',
    closeTime: '20:00',
    currency: 'VND',
    timezone: 'Asia/Ho_Chi_Minh'
  },
  payment: {
    vnpay: { enabled: false, tmnCode: '', hashSecret: '', apiUrl: '' },
    momo: { enabled: false, partnerCode: '', accessKey: '', secretKey: '', apiUrl: '' },
    zalopay: { enabled: false, appId: '', key1: '', key2: '', apiUrl: '' },
    stripe: { enabled: false, publicKey: '', secretKey: '' },
    paypal: { enabled: false, clientId: '', clientSecret: '', mode: 'sandbox' },
    cash: { enabled: true },
    card: { enabled: true },
    transfer: { enabled: true }
  },
  sms: {
    provider: 'twilio',
    twilio: { enabled: false, accountSid: '', authToken: '', phoneNumber: '' },
    esms: { enabled: false, apiKey: '', secretKey: '', brandName: '' },
    vietguys: { enabled: false, username: '', password: '', brandName: '' },
    autoSend: {
      bookingConfirm: true,
      bookingReminder: true,
      bookingCancelled: false,
      paymentReceived: false,
      birthday: true
    }
  },
  email: {
    provider: 'smtp',
    smtp: {
      enabled: false,
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      username: '',
      password: '',
      from: ''
    },
    sendgrid: { enabled: false, apiKey: '', from: '' },
    mailgun: { enabled: false, apiKey: '', domain: '', from: '' },
    autoSend: {
      bookingConfirm: true,
      bookingReminder: true,
      invoice: true,
      receipt: true,
      monthlyReport: false,
      promotion: true
    }
  },
  printer: {
    receipt: {
      enabled: true,
      printerName: '',
      paperSize: '80mm',
      autoPrint: false,
      copies: 1,
      showLogo: true,
      showFooter: true,
      footerText: 'Cảm ơn quý khách! Hẹn gặp lại!'
    },
    invoice: {
      enabled: true,
      printerName: '',
      paperSize: 'A5',
      autoPrint: false,
      showLogo: true,
      showSignature: true
    },
    barcode: {
      enabled: true,
      printerName: '',
      labelSize: '40x30mm',
      showPrice: true,
      showName: true
    }
  },
  notifications: {
    desktop: {
      enabled: true,
      newBooking: true,
      bookingReminder: true,
      lowStock: true,
      systemAlerts: true
    },
    sound: {
      enabled: true,
      volume: 70,
      newBooking: true,
      newCustomer: false,
      payment: true
    },
    email: {
      dailySummary: true,
      weeklySummary: true,
      monthlySummary: true,
      alerts: true
    }
  },
  system: {
    language: 'vi',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    theme: 'light',
    autoLogout: 30,
    sessionTimeout: 60,
    enableAutoBackup: true,
    backupFrequency: 'daily',
    enableAuditLog: true,
    dataRetention: 365,
    allowMultipleLogin: false,
    requireStrongPassword: true,
    twoFactorAuth: false
  },
  backup: {
    lastBackup: null,
    autoBackup: true,
    backupFrequency: 'daily',
    backupTime: '02:00',
    cloudProvider: 'local',
    googleDrive: { enabled: false, folderId: '' },
    dropbox: { enabled: false, accessToken: '' },
    maxBackups: 30
  }
};

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('business');
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = () => {
    try {
      setIsSaving(true);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Có lỗi khi lưu cài đặt!');
    } finally {
      setIsSaving(false);
    }
  };

  const resetSettings = () => {
    if (window.confirm('Bạn có chắc chắn muốn khôi phục cài đặt mặc định? Hành động này không thể hoàn tác!')) {
      setSettings(DEFAULT_SETTINGS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
      alert('Đã khôi phục cài đặt mặc định!');
    }
  };

  const exportSettings = () => {
    try {
      setIsExporting(true);
      const dataStr = JSON.stringify(settings, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `salon-settings-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      alert('Đã xuất cài đặt thành công!');
    } catch (error) {
      console.error('Error exporting settings:', error);
      alert('Có lỗi khi xuất cài đặt!');
    } finally {
      setIsExporting(false);
    }
  };

  const importSettings = (event) => {
    try {
      setIsImporting(true);
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          setSettings({ ...DEFAULT_SETTINGS, ...imported });
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...DEFAULT_SETTINGS, ...imported }));
          alert('Đã nhập cài đặt thành công!');
        } catch (error) {
          alert('File không hợp lệ!');
        } finally {
          setIsImporting(false);
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Error importing settings:', error);
      alert('Có lỗi khi nhập cài đặt!');
      setIsImporting(false);
    }
  };

  const backupData = () => {
    try {
      const allData = {
        settings,
        customers: JSON.parse(localStorage.getItem('salon_customers') || '[]'),
        services: JSON.parse(localStorage.getItem('salon_services') || '[]'),
        products: JSON.parse(localStorage.getItem('salon_products') || '[]'),
        bookings: JSON.parse(localStorage.getItem('salon_bookings') || '[]'),
        transactions: JSON.parse(localStorage.getItem('salon_transactions') || '[]'),
        vouchers: JSON.parse(localStorage.getItem('salon_vouchers') || '[]'),
        expenses: JSON.parse(localStorage.getItem('salon_expenses') || '[]'),
        inventory: JSON.parse(localStorage.getItem('salon_inventory') || '[]'),
        backupDate: new Date().toISOString()
      };

      const dataStr = JSON.stringify(allData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `salon-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      // Update last backup time
      const updatedSettings = {
        ...settings,
        backup: { ...settings.backup, lastBackup: new Date().toISOString() }
      };
      setSettings(updatedSettings);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSettings));

      alert('Đã sao lưu dữ liệu thành công!');
    } catch (error) {
      console.error('Error backing up data:', error);
      alert('Có lỗi khi sao lưu dữ liệu!');
    }
  };

  const restoreData = (event) => {
    if (!window.confirm('Bạn có chắc chắn muốn khôi phục dữ liệu? Dữ liệu hiện tại sẽ bị ghi đè!')) {
      return;
    }

    try {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const backup = JSON.parse(e.target.result);
          
          if (backup.settings) localStorage.setItem('salon_settings', JSON.stringify(backup.settings));
          if (backup.customers) localStorage.setItem('salon_customers', JSON.stringify(backup.customers));
          if (backup.services) localStorage.setItem('salon_services', JSON.stringify(backup.services));
          if (backup.products) localStorage.setItem('salon_products', JSON.stringify(backup.products));
          if (backup.bookings) localStorage.setItem('salon_bookings', JSON.stringify(backup.bookings));
          if (backup.transactions) localStorage.setItem('salon_transactions', JSON.stringify(backup.transactions));
          if (backup.vouchers) localStorage.setItem('salon_vouchers', JSON.stringify(backup.vouchers));
          if (backup.expenses) localStorage.setItem('salon_expenses', JSON.stringify(backup.expenses));
          if (backup.inventory) localStorage.setItem('salon_inventory', JSON.stringify(backup.inventory));

          alert('Đã khôi phục dữ liệu thành công! Vui lòng tải lại trang.');
          window.location.reload();
        } catch (error) {
          alert('File sao lưu không hợp lệ!');
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Error restoring data:', error);
      alert('Có lỗi khi khôi phục dữ liệu!');
    }
  };

  const updateSetting = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const updateNestedSetting = (section, subsection, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [key]: value
        }
      }
    }));
  };

  const renderBusinessSettings = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Tên doanh nghiệp *</label>
          <input
            type="text"
            value={settings.business.name}
            onChange={(e) => updateSetting('business', 'name', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
            placeholder="DEAR Salon & Spa"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Số điện thoại</label>
          <input
            type="tel"
            value={settings.business.phone}
            onChange={(e) => updateSetting('business', 'phone', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
            placeholder="0901234567"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={settings.business.email}
            onChange={(e) => updateSetting('business', 'email', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
            placeholder="contact@dearsalon.com"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Website</label>
          <input
            type="url"
            value={settings.business.website}
            onChange={(e) => updateSetting('business', 'website', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
            placeholder="https://dearsalon.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Địa chỉ</label>
        <input
          type="text"
          value={settings.business.address}
          onChange={(e) => updateSetting('business', 'address', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
          placeholder="123 Nguyễn Huệ, Quận 1, TP.HCM"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Mô tả</label>
        <textarea
          value={settings.business.description}
          onChange={(e) => updateSetting('business', 'description', e.target.value)}
          rows="3"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
          placeholder="Mô tả về doanh nghiệp..."
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Mã số thuế</label>
          <input
            type="text"
            value={settings.business.taxCode}
            onChange={(e) => updateSetting('business', 'taxCode', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
            placeholder="0123456789"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Giờ mở cửa</label>
          <input
            type="time"
            value={settings.business.openTime}
            onChange={(e) => updateSetting('business', 'openTime', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Giờ đóng cửa</label>
          <input
            type="time"
            value={settings.business.closeTime}
            onChange={(e) => updateSetting('business', 'closeTime', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-4">
      {/* VNPay */}
      <div className="p-3 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-wallet text-blue-600" />
            <h3 className="font-semibold text-sm">VNPay</h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.payment.vnpay.enabled}
              onChange={(e) => updateNestedSetting('payment', 'vnpay', 'enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-emerald-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>
        {settings.payment.vnpay.enabled && (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="TMN Code"
              value={settings.payment.vnpay.tmnCode}
              onChange={(e) => updateNestedSetting('payment', 'vnpay', 'tmnCode', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="password"
              placeholder="Hash Secret"
              value={settings.payment.vnpay.hashSecret}
              onChange={(e) => updateNestedSetting('payment', 'vnpay', 'hashSecret', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="url"
              placeholder="API URL"
              value={settings.payment.vnpay.apiUrl}
              onChange={(e) => updateNestedSetting('payment', 'vnpay', 'apiUrl', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        )}
      </div>

      {/* Momo */}
      <div className="p-3 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-mobile-alt text-pink-600" />
            <h3 className="font-semibold text-sm">Momo</h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.payment.momo.enabled}
              onChange={(e) => updateNestedSetting('payment', 'momo', 'enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-emerald-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>
        {settings.payment.momo.enabled && (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Partner Code"
              value={settings.payment.momo.partnerCode}
              onChange={(e) => updateNestedSetting('payment', 'momo', 'partnerCode', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="password"
              placeholder="Access Key"
              value={settings.payment.momo.accessKey}
              onChange={(e) => updateNestedSetting('payment', 'momo', 'accessKey', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="password"
              placeholder="Secret Key"
              value={settings.payment.momo.secretKey}
              onChange={(e) => updateNestedSetting('payment', 'momo', 'secretKey', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        )}
      </div>

      {/* ZaloPay */}
      <div className="p-3 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-qrcode text-blue-500" />
            <h3 className="font-semibold text-sm">ZaloPay</h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.payment.zalopay.enabled}
              onChange={(e) => updateNestedSetting('payment', 'zalopay', 'enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-emerald-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>
        {settings.payment.zalopay.enabled && (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="App ID"
              value={settings.payment.zalopay.appId}
              onChange={(e) => updateNestedSetting('payment', 'zalopay', 'appId', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="password"
              placeholder="Key 1"
              value={settings.payment.zalopay.key1}
              onChange={(e) => updateNestedSetting('payment', 'zalopay', 'key1', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="password"
              placeholder="Key 2"
              value={settings.payment.zalopay.key2}
              onChange={(e) => updateNestedSetting('payment', 'zalopay', 'key2', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderSMSSettings = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Nhà cung cấp SMS</label>
        <select
          value={settings.sms.provider}
          onChange={(e) => updateSetting('sms', 'provider', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
        >
          <option value="twilio">Twilio</option>
          <option value="esms">eSMS</option>
          <option value="vietguys">VietGuys</option>
        </select>
      </div>

      {/* Twilio */}
      {settings.sms.provider === 'twilio' && (
        <div className="p-3 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-sm mb-2">Cấu hình Twilio</h3>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Account SID"
              value={settings.sms.twilio.accountSid}
              onChange={(e) => updateNestedSetting('sms', 'twilio', 'accountSid', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="password"
              placeholder="Auth Token"
              value={settings.sms.twilio.authToken}
              onChange={(e) => updateNestedSetting('sms', 'twilio', 'authToken', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="tel"
              placeholder="Phone Number (+84...)"
              value={settings.sms.twilio.phoneNumber}
              onChange={(e) => updateNestedSetting('sms', 'twilio', 'phoneNumber', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      )}

      {/* eSMS */}
      {settings.sms.provider === 'esms' && (
        <div className="p-3 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-sm mb-2">Cấu hình eSMS</h3>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="API Key"
              value={settings.sms.esms.apiKey}
              onChange={(e) => updateNestedSetting('sms', 'esms', 'apiKey', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="password"
              placeholder="Secret Key"
              value={settings.sms.esms.secretKey}
              onChange={(e) => updateNestedSetting('sms', 'esms', 'secretKey', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="text"
              placeholder="Brand Name"
              value={settings.sms.esms.brandName}
              onChange={(e) => updateNestedSetting('sms', 'esms', 'brandName', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      )}

      <div className="p-3 border border-gray-200 rounded-lg">
        <h3 className="font-semibold text-sm mb-2">Tự động gửi SMS</h3>
        <div className="space-y-2">
          <label className="flex items-center justify-between text-sm">
            <span>Xác nhận đặt lịch</span>
            <input
              type="checkbox"
              checked={settings.sms.autoSend.bookingConfirm}
              onChange={(e) => updateNestedSetting('sms', 'autoSend', 'bookingConfirm', e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
          </label>
          <label className="flex items-center justify-between text-sm">
            <span>Nhắc nhở lịch hẹn</span>
            <input
              type="checkbox"
              checked={settings.sms.autoSend.bookingReminder}
              onChange={(e) => updateNestedSetting('sms', 'autoSend', 'bookingReminder', e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
          </label>
          <label className="flex items-center justify-between text-sm">
            <span>Sinh nhật khách hàng</span>
            <input
              type="checkbox"
              checked={settings.sms.autoSend.birthday}
              onChange={(e) => updateNestedSetting('sms', 'autoSend', 'birthday', e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
          </label>
        </div>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Nhà cung cấp Email</label>
        <select
          value={settings.email.provider}
          onChange={(e) => updateSetting('email', 'provider', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
        >
          <option value="smtp">SMTP (Gmail, Outlook, etc.)</option>
          <option value="sendgrid">SendGrid</option>
          <option value="mailgun">Mailgun</option>
        </select>
      </div>

      {/* SMTP */}
      {settings.email.provider === 'smtp' && (
        <div className="p-3 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-sm mb-2">Cấu hình SMTP</h3>
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="SMTP Host"
                value={settings.email.smtp.host}
                onChange={(e) => updateNestedSetting('email', 'smtp', 'host', e.target.value)}
                className="col-span-2 w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="number"
                placeholder="Port"
                value={settings.email.smtp.port}
                onChange={(e) => updateNestedSetting('email', 'smtp', 'port', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <input
              type="email"
              placeholder="Email/Username"
              value={settings.email.smtp.username}
              onChange={(e) => updateNestedSetting('email', 'smtp', 'username', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="password"
              placeholder="Password hoặc App Password"
              value={settings.email.smtp.password}
              onChange={(e) => updateNestedSetting('email', 'smtp', 'password', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="email"
              placeholder="Email người gửi"
              value={settings.email.smtp.from}
              onChange={(e) => updateNestedSetting('email', 'smtp', 'from', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings.email.smtp.secure}
                onChange={(e) => updateNestedSetting('email', 'smtp', 'secure', e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span>Sử dụng SSL/TLS</span>
            </label>
          </div>
        </div>
      )}

      <div className="p-3 border border-gray-200 rounded-lg">
        <h3 className="font-semibold text-sm mb-2">Tự động gửi Email</h3>
        <div className="space-y-2">
          <label className="flex items-center justify-between text-sm">
            <span>Xác nhận đặt lịch</span>
            <input
              type="checkbox"
              checked={settings.email.autoSend.bookingConfirm}
              onChange={(e) => updateNestedSetting('email', 'autoSend', 'bookingConfirm', e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
          </label>
          <label className="flex items-center justify-between text-sm">
            <span>Hoá đơn</span>
            <input
              type="checkbox"
              checked={settings.email.autoSend.invoice}
              onChange={(e) => updateNestedSetting('email', 'autoSend', 'invoice', e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
          </label>
          <label className="flex items-center justify-between text-sm">
            <span>Biên lai thanh toán</span>
            <input
              type="checkbox"
              checked={settings.email.autoSend.receipt}
              onChange={(e) => updateNestedSetting('email', 'autoSend', 'receipt', e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
          </label>
          <label className="flex items-center justify-between text-sm">
            <span>Khuyến mãi</span>
            <input
              type="checkbox"
              checked={settings.email.autoSend.promotion}
              onChange={(e) => updateNestedSetting('email', 'autoSend', 'promotion', e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
          </label>
        </div>
      </div>
    </div>
  );

  const renderPrinterSettings = () => (
    <div className="space-y-4">
      {/* Receipt Printer */}
      <div className="p-3 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm">Máy in hoá đơn</h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.printer.receipt.enabled}
              onChange={(e) => updateNestedSetting('printer', 'receipt', 'enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-emerald-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>
        {settings.printer.receipt.enabled && (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Tên máy in"
              value={settings.printer.receipt.printerName}
              onChange={(e) => updateNestedSetting('printer', 'receipt', 'printerName', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={settings.printer.receipt.paperSize}
                onChange={(e) => updateNestedSetting('printer', 'receipt', 'paperSize', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
              >
                <option value="58mm">58mm</option>
                <option value="80mm">80mm</option>
              </select>
              <input
                type="number"
                placeholder="Số bản in"
                value={settings.printer.receipt.copies}
                onChange={(e) => updateNestedSetting('printer', 'receipt', 'copies', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings.printer.receipt.autoPrint}
                onChange={(e) => updateNestedSetting('printer', 'receipt', 'autoPrint', e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span>Tự động in sau thanh toán</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings.printer.receipt.showLogo}
                onChange={(e) => updateNestedSetting('printer', 'receipt', 'showLogo', e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span>Hiển thị logo</span>
            </label>
            <textarea
              placeholder="Lời cảm ơn cuối hoá đơn"
              value={settings.printer.receipt.footerText}
              onChange={(e) => updateNestedSetting('printer', 'receipt', 'footerText', e.target.value)}
              rows="2"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        )}
      </div>

      {/* Barcode Printer */}
      <div className="p-3 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm">Máy in tem barcode</h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.printer.barcode.enabled}
              onChange={(e) => updateNestedSetting('printer', 'barcode', 'enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-emerald-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>
        {settings.printer.barcode.enabled && (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Tên máy in tem"
              value={settings.printer.barcode.printerName}
              onChange={(e) => updateNestedSetting('printer', 'barcode', 'printerName', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
            />
            <select
              value={settings.printer.barcode.labelSize}
              onChange={(e) => updateNestedSetting('printer', 'barcode', 'labelSize', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
            >
              <option value="40x30mm">40x30mm</option>
              <option value="50x30mm">50x30mm</option>
              <option value="60x40mm">60x40mm</option>
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings.printer.barcode.showPrice}
                onChange={(e) => updateNestedSetting('printer', 'barcode', 'showPrice', e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span>Hiển thị giá trên tem</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-4">
      <div className="p-3 border border-gray-200 rounded-lg">
        <h3 className="font-semibold text-sm mb-2">Thông báo trên Desktop</h3>
        <div className="space-y-2">
          <label className="flex items-center justify-between text-sm">
            <span>Đặt lịch mới</span>
            <input
              type="checkbox"
              checked={settings.notifications.desktop.newBooking}
              onChange={(e) => updateNestedSetting('notifications', 'desktop', 'newBooking', e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
          </label>
          <label className="flex items-center justify-between text-sm">
            <span>Nhắc nhở lịch hẹn</span>
            <input
              type="checkbox"
              checked={settings.notifications.desktop.bookingReminder}
              onChange={(e) => updateNestedSetting('notifications', 'desktop', 'bookingReminder', e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
          </label>
          <label className="flex items-center justify-between text-sm">
            <span>Cảnh báo tồn kho thấp</span>
            <input
              type="checkbox"
              checked={settings.notifications.desktop.lowStock}
              onChange={(e) => updateNestedSetting('notifications', 'desktop', 'lowStock', e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
          </label>
        </div>
      </div>

      <div className="p-3 border border-gray-200 rounded-lg">
        <h3 className="font-semibold text-sm mb-2">Âm thanh thông báo</h3>
        <div className="space-y-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Âm lượng: {settings.notifications.sound.volume}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.notifications.sound.volume}
              onChange={(e) => updateNestedSetting('notifications', 'sound', 'volume', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <label className="flex items-center justify-between text-sm">
            <span>Đặt lịch mới</span>
            <input
              type="checkbox"
              checked={settings.notifications.sound.newBooking}
              onChange={(e) => updateNestedSetting('notifications', 'sound', 'newBooking', e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
          </label>
          <label className="flex items-center justify-between text-sm">
            <span>Thanh toán thành công</span>
            <input
              type="checkbox"
              checked={settings.notifications.sound.payment}
              onChange={(e) => updateNestedSetting('notifications', 'sound', 'payment', e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
          </label>
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Ngôn ngữ</label>
          <select
            value={settings.system.language}
            onChange={(e) => updateSetting('system', 'language', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
          >
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Giao diện</label>
          <select
            value={settings.system.theme}
            onChange={(e) => updateSetting('system', 'theme', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
          >
            <option value="light">Sáng</option>
            <option value="dark">Tối</option>
            <option value="auto">Tự động</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Định dạng ngày</label>
          <select
            value={settings.system.dateFormat}
            onChange={(e) => updateSetting('system', 'dateFormat', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Định dạng giờ</label>
          <select
            value={settings.system.timeFormat}
            onChange={(e) => updateSetting('system', 'timeFormat', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
          >
            <option value="24h">24 giờ</option>
            <option value="12h">12 giờ</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Tự động đăng xuất (phút)</label>
          <input
            type="number"
            value={settings.system.autoLogout}
            onChange={(e) => updateSetting('system', 'autoLogout', parseInt(e.target.value))}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
            min="5"
            max="120"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Lưu dữ liệu (ngày)</label>
          <input
            type="number"
            value={settings.system.dataRetention}
            onChange={(e) => updateSetting('system', 'dataRetention', parseInt(e.target.value))}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
            min="30"
            max="3650"
          />
        </div>
      </div>

      <div className="p-3 border border-gray-200 rounded-lg">
        <h3 className="font-semibold text-sm mb-2">Bảo mật</h3>
        <div className="space-y-2">
          <label className="flex items-center justify-between text-sm">
            <span>Cho phép đăng nhập nhiều thiết bị</span>
            <input
              type="checkbox"
              checked={settings.system.allowMultipleLogin}
              onChange={(e) => updateSetting('system', 'allowMultipleLogin', e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
          </label>
          <label className="flex items-center justify-between text-sm">
            <span>Yêu cầu mật khẩu mạnh</span>
            <input
              type="checkbox"
              checked={settings.system.requireStrongPassword}
              onChange={(e) => updateSetting('system', 'requireStrongPassword', e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
          </label>
          <label className="flex items-center justify-between text-sm">
            <span>Xác thực 2 bước</span>
            <input
              type="checkbox"
              checked={settings.system.twoFactorAuth}
              onChange={(e) => updateSetting('system', 'twoFactorAuth', e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
          </label>
          <label className="flex items-center justify-between text-sm">
            <span>Lưu nhật ký hoạt động</span>
            <input
              type="checkbox"
              checked={settings.system.enableAuditLog}
              onChange={(e) => updateSetting('system', 'enableAuditLog', e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
          </label>
        </div>
      </div>
    </div>
  );

  const renderBackupSettings = () => (
    <div className="space-y-4">
      <div className="p-3 border border-gray-200 rounded-lg bg-blue-50">
        <div className="flex items-start gap-2">
          <i className="fa-solid fa-info-circle text-blue-600 mt-0.5" />
          <div className="text-xs text-gray-700">
            <p className="font-semibold mb-1">Lần sao lưu cuối:</p>
            <p>{settings.backup.lastBackup ? new Date(settings.backup.lastBackup).toLocaleString('vi-VN') : 'Chưa có'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={backupData}
          className="px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
        >
          <i className="fa-solid fa-download" />
          Sao lưu ngay
        </button>
        <label className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center justify-center gap-2 cursor-pointer">
          <i className="fa-solid fa-upload" />
          Khôi phục
          <input
            type="file"
            accept=".json"
            onChange={restoreData}
            className="hidden"
          />
        </label>
      </div>

      <div className="p-3 border border-gray-200 rounded-lg">
        <h3 className="font-semibold text-sm mb-2">Sao lưu tự động</h3>
        <div className="space-y-2">
          <label className="flex items-center justify-between text-sm">
            <span>Bật sao lưu tự động</span>
            <input
              type="checkbox"
              checked={settings.backup.autoBackup}
              onChange={(e) => updateSetting('backup', 'autoBackup', e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
          </label>
          {settings.backup.autoBackup && (
            <>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Tần suất</label>
                <select
                  value={settings.backup.backupFrequency}
                  onChange={(e) => updateSetting('backup', 'backupFrequency', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="daily">Hàng ngày</option>
                  <option value="weekly">Hàng tuần</option>
                  <option value="monthly">Hàng tháng</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Giờ sao lưu</label>
                <input
                  type="time"
                  value={settings.backup.backupTime}
                  onChange={(e) => updateSetting('backup', 'backupTime', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Số bản sao lưu tối đa</label>
                <input
                  type="number"
                  value={settings.backup.maxBackups}
                  onChange={(e) => updateSetting('backup', 'maxBackups', parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
                  min="1"
                  max="100"
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="p-3 border border-red-200 rounded-lg bg-red-50">
        <h3 className="font-semibold text-sm text-red-800 mb-2">Vùng nguy hiểm</h3>
        <div className="space-y-2">
          <button
            onClick={exportSettings}
            disabled={isExporting}
            className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <i className="fa-solid fa-file-export mr-2" />
            {isExporting ? 'Đang xuất...' : 'Xuất cài đặt'}
          </button>
          <label className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm font-medium cursor-pointer flex items-center justify-center">
            <i className="fa-solid fa-file-import mr-2" />
            {isImporting ? 'Đang nhập...' : 'Nhập cài đặt'}
            <input
              type="file"
              accept=".json"
              onChange={importSettings}
              className="hidden"
            />
          </label>
          <button
            onClick={resetSettings}
            className="w-full px-3 py-2 bg-red-100 border border-red-300 text-red-700 rounded hover:bg-red-200 transition-colors text-sm font-medium"
          >
            <i className="fa-solid fa-rotate-left mr-2" />
            Khôi phục mặc định
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-800">Cài đặt hệ thống</h1>
            <p className="text-xs text-gray-600">Cấu hình và quản lý hệ thống</p>
          </div>
          <div className="flex gap-2">
            {saveSuccess && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="px-3 py-1.5 bg-green-100 text-green-700 rounded text-xs font-medium flex items-center gap-1.5"
              >
                <i className="fa-solid fa-check" />
                Đã lưu!
              </motion.div>
            )}
            <motion.button
              onClick={saveSettings}
              disabled={isSaving}
              className="px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors font-medium text-xs flex items-center gap-1.5"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <i className={`fa-solid ${isSaving ? 'fa-spinner fa-spin' : 'fa-save'}`} />
              {isSaving ? 'Đang lưu...' : 'Lưu cài đặt'}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-2 py-2 text-xs font-medium transition-colors whitespace-nowrap border-b-2 ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <i className={`fa-solid ${tab.icon} mr-1`} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded border border-gray-200 p-3"
        >
          {activeTab === 'business' && renderBusinessSettings()}
          {activeTab === 'payment' && renderPaymentSettings()}
          {activeTab === 'sms' && renderSMSSettings()}
          {activeTab === 'email' && renderEmailSettings()}
          {activeTab === 'printer' && renderPrinterSettings()}
          {activeTab === 'notifications' && renderNotificationSettings()}
          {activeTab === 'system' && renderSystemSettings()}
          {activeTab === 'backup' && renderBackupSettings()}
        </motion.div>
      </div>
    </div>
  );
};
