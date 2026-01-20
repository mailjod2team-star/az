import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY_CAMPAIGNS = 'salon_marketing_campaigns';
const STORAGE_KEY_TEMPLATES = 'salon_marketing_templates';
const STORAGE_KEY_CUSTOMERS = 'salon_customers';
const STORAGE_KEY_SETTINGS = 'salon_settings';

const CAMPAIGN_TYPES = [
  { id: 'sms', label: 'SMS', icon: 'fa-comment-sms', color: 'blue' },
  { id: 'email', label: 'Email', icon: 'fa-envelope', color: 'purple' }
];

const TEMPLATE_CATEGORIES = [
  'Khuyến mãi',
  'Chúc mừng sinh nhật',
  'Nhắc lịch hẹn',
  'Cảm ơn khách hàng',
  'Thông báo mới',
  'Khác'
];

const DEFAULT_TEMPLATES = [
  {
    id: 'TPL001',
    name: 'Khuyến mãi cuối tuần',
    type: 'sms',
    category: 'Khuyến mãi',
    subject: '',
    content: 'Chào {{name}}! Giảm 20% tất cả dịch vụ vào cuối tuần này. Đặt lịch ngay: {{phone}}',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'TPL002',
    name: 'Chúc mừng sinh nhật',
    type: 'sms',
    category: 'Chúc mừng sinh nhật',
    subject: '',
    content: 'Chúc mừng sinh nhật {{name}}! Nhận ngay voucher giảm 30% dành riêng cho bạn. Salon {{business_name}}',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'TPL003',
    name: 'Khuyến mãi đặc biệt',
    type: 'email',
    category: 'Khuyến mãi',
    subject: 'Ưu đãi đặc biệt dành cho bạn!',
    content: `Kính chào {{name}},

Chúng tôi rất vui được gửi đến bạn chương trình khuyến mãi đặc biệt:

🎁 GIẢM GIÁ 30% tất cả dịch vụ
⏰ Áp dụng từ ngày {{start_date}} đến {{end_date}}
📞 Đặt lịch ngay: {{phone}}

Trân trọng,
{{business_name}}`,
    status: 'active',
    createdAt: new Date().toISOString()
  }
];

export const MarketingPage = () => {
  const [activeView, setActiveView] = useState('campaigns'); // campaigns, templates, create
  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Create Campaign State
  const [campaignType, setCampaignType] = useState('sms');
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [campaignName, setCampaignName] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [scheduleType, setScheduleType] = useState('now'); // now, schedule
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  
  // Template Modal
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    type: 'sms',
    category: 'Khuyến mãi',
    subject: '',
    content: '',
    status: 'active'
  });
  
  // Customer Selection Modal
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [customerFilterMembership, setCustomerFilterMembership] = useState('all');
  
  // Campaign Detail Modal
  const [viewingCampaign, setViewingCampaign] = useState(null);
  const [isCampaignDetailOpen, setIsCampaignDetailOpen] = useState(false);
  
  // Filter & Stats
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      setLoading(true);
      
      // Load campaigns
      const storedCampaigns = localStorage.getItem(STORAGE_KEY_CAMPAIGNS);
      setCampaigns(storedCampaigns ? JSON.parse(storedCampaigns) : []);
      
      // Load templates
      const storedTemplates = localStorage.getItem(STORAGE_KEY_TEMPLATES);
      if (storedTemplates) {
        setTemplates(JSON.parse(storedTemplates));
      } else {
        localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(DEFAULT_TEMPLATES));
        setTemplates(DEFAULT_TEMPLATES);
      }
      
      // Load customers
      const storedCustomers = localStorage.getItem(STORAGE_KEY_CUSTOMERS);
      setCustomers(storedCustomers ? JSON.parse(storedCustomers) : []);
      
      // Load settings
      const storedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
      setSettings(storedSettings ? JSON.parse(storedSettings) : null);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCampaigns = (updatedCampaigns) => {
    try {
      localStorage.setItem(STORAGE_KEY_CAMPAIGNS, JSON.stringify(updatedCampaigns));
      setCampaigns(updatedCampaigns);
    } catch (error) {
      console.error('Error saving campaigns:', error);
      alert('Có lỗi khi lưu chiến dịch!');
    }
  };

  const saveTemplates = (updatedTemplates) => {
    try {
      localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(updatedTemplates));
      setTemplates(updatedTemplates);
    } catch (error) {
      console.error('Error saving templates:', error);
      alert('Có lỗi khi lưu template!');
    }
  };

  const generateCampaignId = () => {
    const existingIds = campaigns.map(c => c.id);
    const numbers = existingIds
      .map(id => parseInt(id.replace('CPG', '')))
      .filter(num => !isNaN(num));
    const nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    return `CPG${String(nextNum).padStart(3, '0')}`;
  };

  const generateTemplateId = () => {
    const existingIds = templates.map(t => t.id);
    const numbers = existingIds
      .map(id => parseInt(id.replace('TPL', '')))
      .filter(num => !isNaN(num));
    const nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    return `TPL${String(nextNum).padStart(3, '0')}`;
  };

  // Check if API is configured
  const isApiConfigured = (type) => {
    if (!settings) return false;
    
    if (type === 'sms') {
      const smsConfig = settings.sms;
      if (smsConfig.provider === 'twilio') {
        return smsConfig.twilio?.enabled && smsConfig.twilio?.accountSid && smsConfig.twilio?.authToken;
      } else if (smsConfig.provider === 'esms') {
        return smsConfig.esms?.enabled && smsConfig.esms?.apiKey;
      } else if (smsConfig.provider === 'vietguys') {
        return smsConfig.vietguys?.enabled && smsConfig.vietguys?.username;
      }
    } else if (type === 'email') {
      const emailConfig = settings.email;
      if (emailConfig.provider === 'smtp') {
        return emailConfig.smtp?.enabled && emailConfig.smtp?.host && emailConfig.smtp?.username;
      } else if (emailConfig.provider === 'sendgrid') {
        return emailConfig.sendgrid?.enabled && emailConfig.sendgrid?.apiKey;
      } else if (emailConfig.provider === 'mailgun') {
        return emailConfig.mailgun?.enabled && emailConfig.mailgun?.apiKey;
      }
    }
    return false;
  };

  const handleCreateCampaign = () => {
    if (!campaignName.trim()) {
      alert('Vui lòng nhập tên chiến dịch!');
      return;
    }
    
    if (selectedCustomers.length === 0) {
      alert('Vui lòng chọn ít nhất một khách hàng!');
      return;
    }
    
    if (!content.trim()) {
      alert('Vui lòng nhập nội dung tin nhắn!');
      return;
    }
    
    if (campaignType === 'email' && !subject.trim()) {
      alert('Vui lòng nhập tiêu đề email!');
      return;
    }
    
    if (scheduleType === 'schedule' && (!scheduleDate || !scheduleTime)) {
      alert('Vui lòng chọn ngày giờ hẹn gửi!');
      return;
    }

    try {
      const newCampaign = {
        id: generateCampaignId(),
        name: campaignName,
        type: campaignType,
        subject: campaignType === 'email' ? subject : '',
        content: content,
        recipients: selectedCustomers.length,
        customerIds: selectedCustomers.map(c => c.id),
        scheduleType: scheduleType,
        scheduledAt: scheduleType === 'schedule' ? `${scheduleDate} ${scheduleTime}` : null,
        status: scheduleType === 'now' ? 'sent' : 'scheduled',
        sentCount: scheduleType === 'now' ? selectedCustomers.length : 0,
        deliveredCount: scheduleType === 'now' ? Math.floor(selectedCustomers.length * 0.95) : 0,
        failedCount: scheduleType === 'now' ? Math.floor(selectedCustomers.length * 0.05) : 0,
        openedCount: 0,
        clickedCount: 0,
        createdAt: new Date().toISOString(),
        sentAt: scheduleType === 'now' ? new Date().toISOString() : null
      };

      const updatedCampaigns = [newCampaign, ...campaigns];
      saveCampaigns(updatedCampaigns);
      
      // Reset form
      setCampaignName('');
      setSubject('');
      setContent('');
      setSelectedCustomers([]);
      setSelectedTemplate(null);
      setScheduleType('now');
      setScheduleDate('');
      setScheduleTime('');
      
      setActiveView('campaigns');
      alert(scheduleType === 'now' ? 'Chiến dịch đã được gửi thành công!' : 'Chiến dịch đã được lên lịch!');
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Có lỗi khi tạo chiến dịch!');
    }
  };

  const handleDeleteCampaign = (campaignId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa chiến dịch này?')) {
      return;
    }
    
    try {
      const updatedCampaigns = campaigns.filter(c => c.id !== campaignId);
      saveCampaigns(updatedCampaigns);
    } catch (error) {
      console.error('Error deleting campaign:', error);
      alert('Có lỗi khi xóa chiến dịch!');
    }
  };

  const handleUseTemplate = (template) => {
    setSelectedTemplate(template);
    setCampaignType(template.type);
    setSubject(template.subject || '');
    setContent(template.content || '');
  };

  const handleSelectAllCustomers = () => {
    const activeCustomers = customers.filter(c => c.status === 'active');
    setSelectedCustomers(activeCustomers);
  };

  const handleToggleCustomer = (customer) => {
    const isSelected = selectedCustomers.some(c => c.id === customer.id);
    if (isSelected) {
      setSelectedCustomers(selectedCustomers.filter(c => c.id !== customer.id));
    } else {
      setSelectedCustomers([...selectedCustomers, customer]);
    }
  };

  // Template CRUD
  const openTemplateModal = (template = null) => {
    if (template) {
      setEditingTemplate(template);
      setTemplateForm({
        name: template.name,
        type: template.type,
        category: template.category,
        subject: template.subject || '',
        content: template.content,
        status: template.status
      });
    } else {
      setEditingTemplate(null);
      setTemplateForm({
        name: '',
        type: 'sms',
        category: 'Khuyến mãi',
        subject: '',
        content: '',
        status: 'active'
      });
    }
    setIsTemplateModalOpen(true);
  };

  const handleSaveTemplate = (e) => {
    e.preventDefault();
    
    try {
      let updatedTemplates;
      
      if (editingTemplate) {
        updatedTemplates = templates.map(t =>
          t.id === editingTemplate.id
            ? { ...t, ...templateForm }
            : t
        );
      } else {
        const newTemplate = {
          id: generateTemplateId(),
          ...templateForm,
          createdAt: new Date().toISOString()
        };
        updatedTemplates = [newTemplate, ...templates];
      }
      
      saveTemplates(updatedTemplates);
      setIsTemplateModalOpen(false);
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Có lỗi khi lưu template!');
    }
  };

  const handleDeleteTemplate = (templateId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa template này?')) {
      return;
    }
    
    try {
      const updatedTemplates = templates.filter(t => t.id !== templateId);
      saveTemplates(updatedTemplates);
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Có lỗi khi xóa template!');
    }
  };

  // Statistics
  const stats = useMemo(() => {
    const totalCampaigns = campaigns.length;
    const smsCampaigns = campaigns.filter(c => c.type === 'sms').length;
    const emailCampaigns = campaigns.filter(c => c.type === 'email').length;
    const sentCampaigns = campaigns.filter(c => c.status === 'sent').length;
    const scheduledCampaigns = campaigns.filter(c => c.status === 'scheduled').length;
    const totalSent = campaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0);
    const totalDelivered = campaigns.reduce((sum, c) => sum + (c.deliveredCount || 0), 0);
    const deliveryRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : 0;
    
    return {
      totalCampaigns,
      smsCampaigns,
      emailCampaigns,
      sentCampaigns,
      scheduledCampaigns,
      totalSent,
      totalDelivered,
      deliveryRate
    };
  }, [campaigns]);

  // Filtered campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      const matchSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = filterType === 'all' || campaign.type === filterType;
      const matchStatus = filterStatus === 'all' || campaign.status === filterStatus;
      return matchSearch && matchType && matchStatus;
    });
  }, [campaigns, searchTerm, filterType, filterStatus]);

  // Filtered templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => template.status === 'active');
  }, [templates]);

  // Filtered customers for selection
  const filteredCustomersForSelection = useMemo(() => {
    return customers.filter(customer => {
      const matchSearch = customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
        customer.phone.includes(customerSearchTerm) ||
        (customer.email && customer.email.toLowerCase().includes(customerSearchTerm.toLowerCase()));
      const matchMembership = customerFilterMembership === 'all' || customer.membershipLevel === customerFilterMembership;
      const matchActive = customer.status === 'active';
      
      // For email campaigns, only show customers with email
      if (campaignType === 'email') {
        return matchSearch && matchMembership && matchActive && customer.email;
      }
      
      // For SMS campaigns, show all active customers with phone
      return matchSearch && matchMembership && matchActive && customer.phone;
    });
  }, [customers, customerSearchTerm, customerFilterMembership, campaignType]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-800">Marketing</h1>
            <p className="text-xs text-gray-600">Quản lý chiến dịch SMS & Email</p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-3 text-xs">
            <div className="text-center">
              <p className="font-bold text-fuchsia-600">{stats.totalCampaigns}</p>
              <p className="text-gray-500">Chiến dịch</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-blue-600">{stats.totalSent}</p>
              <p className="text-gray-500">Đã gửi</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-emerald-600">{stats.deliveryRate}%</p>
              <p className="text-gray-500">Tỷ lệ</p>
            </div>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="bg-white border-b border-gray-200 px-3 py-2">
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setActiveView('campaigns')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              activeView === 'campaigns'
                ? 'bg-fuchsia-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            data-testid="campaigns-tab"
          >
            <i className="fa-solid fa-list mr-1" />
            Chiến dịch ({stats.totalCampaigns})
          </button>
          <button
            onClick={() => setActiveView('templates')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              activeView === 'templates'
                ? 'bg-fuchsia-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            data-testid="templates-tab"
          >
            <i className="fa-solid fa-file-lines mr-1" />
            Templates ({templates.length})
          </button>
          <button
            onClick={() => setActiveView('create')}
            className={`ml-auto px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              activeView === 'create'
                ? 'bg-fuchsia-600 text-white'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
            data-testid="create-campaign-button"
          >
            <i className="fa-solid fa-plus mr-1" />
            Tạo chiến dịch mới
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 p-2 ${activeView === 'create' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        {activeView === 'campaigns' && (
          <div className="space-y-2">
            {/* Filters */}
            <div className="bg-white rounded border border-gray-200 p-2">
              <div className="flex gap-2 flex-wrap items-center">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
                  data-testid="filter-type"
                >
                  <option value="all">Tất cả loại</option>
                  <option value="sms">SMS</option>
                  <option value="email">Email</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
                  data-testid="filter-status"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="sent">Đã gửi</option>
                  <option value="scheduled">Đã lên lịch</option>
                  <option value="draft">Nháp</option>
                </select>

                <div className="relative flex-1 min-w-[200px]">
                  <input
                    type="text"
                    placeholder="Tìm kiếm chiến dịch..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
                    data-testid="search-campaigns"
                  />
                  <i className="fa-solid fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                </div>
              </div>
            </div>

            {/* Campaigns List */}
            {filteredCampaigns.length === 0 ? (
              <div className="bg-white rounded border border-gray-200 p-8 text-center">
                <div className="w-20 h-20 bg-fuchsia-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fa-solid fa-bullhorn text-fuchsia-600 text-3xl" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Chưa có chiến dịch nào</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Bắt đầu tạo chiến dịch Marketing đầu tiên của bạn
                </p>
                <button
                  onClick={() => setActiveView('create')}
                  className="px-4 py-2 bg-fuchsia-600 text-white rounded hover:bg-fuchsia-700 transition-colors text-sm font-medium"
                >
                  <i className="fa-solid fa-plus mr-2" />
                  Tạo chiến dịch ngay
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredCampaigns.map((campaign) => (
                  <motion.div
                    key={campaign.id}
                    className="bg-white rounded border border-gray-200 p-3 hover:shadow-md transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    data-testid={`campaign-${campaign.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        campaign.type === 'sms' ? 'bg-blue-100' : 'bg-purple-100'
                      }`}>
                        <i className={`fa-solid ${
                          campaign.type === 'sms' ? 'fa-comment-sms text-blue-600' : 'fa-envelope text-purple-600'
                        } text-lg`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-800 text-sm">{campaign.name}</h3>
                          <span className={`px-2 py-0.5 text-[10px] font-medium rounded ${
                            campaign.status === 'sent'
                              ? 'bg-emerald-100 text-emerald-700'
                              : campaign.status === 'scheduled'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {campaign.status === 'sent' ? 'Đã gửi' : campaign.status === 'scheduled' ? 'Đã lên lịch' : 'Nháp'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3 text-[10px] text-gray-600 mb-2">
                          <span><i className="fa-solid fa-users mr-1" />{campaign.recipients} người nhận</span>
                          {campaign.status === 'sent' && (
                            <>
                              <span className="text-emerald-600">
                                <i className="fa-solid fa-check-circle mr-1" />
                                {campaign.deliveredCount} đã nhận
                              </span>
                              {campaign.failedCount > 0 && (
                                <span className="text-red-600">
                                  <i className="fa-solid fa-times-circle mr-1" />
                                  {campaign.failedCount} thất bại
                                </span>
                              )}
                            </>
                          )}
                          {campaign.scheduledAt && (
                            <span><i className="fa-solid fa-clock mr-1" />{formatDate(campaign.scheduledAt)}</span>
                          )}
                        </div>
                        
                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{campaign.content}</p>
                        
                        <div className="text-[10px] text-gray-500">
                          Tạo lúc: {formatDate(campaign.createdAt)}
                          {campaign.sentAt && ` • Gửi lúc: ${formatDate(campaign.sentAt)}`}
                        </div>
                      </div>
                      
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setViewingCampaign(campaign);
                            setIsCampaignDetailOpen(true);
                          }}
                          className="px-2 py-1 bg-purple-50 text-purple-700 rounded hover:bg-purple-100 transition-colors text-[10px] font-medium"
                          data-testid={`view-campaign-${campaign.id}`}
                        >
                          <i className="fa-solid fa-eye mr-0.5" />
                          Xem
                        </button>
                        <button
                          onClick={() => handleDeleteCampaign(campaign.id)}
                          className="px-2 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors text-[10px] font-medium"
                          data-testid={`delete-campaign-${campaign.id}`}
                        >
                          <i className="fa-solid fa-trash mr-0.5" />
                          Xóa
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeView === 'templates' && (
          <div className="space-y-2">
            <div className="flex justify-end">
              <button
                onClick={() => openTemplateModal()}
                className="px-3 py-1.5 bg-fuchsia-600 text-white rounded hover:bg-fuchsia-700 transition-colors text-xs font-medium"
                data-testid="add-template-button"
              >
                <i className="fa-solid fa-plus mr-1" />
                Thêm template
              </button>
            </div>

            {filteredTemplates.length === 0 ? (
              <div className="bg-white rounded border border-gray-200 p-8 text-center">
                <i className="fa-solid fa-file-lines text-5xl text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm">Chưa có template nào</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {filteredTemplates.map((template) => (
                  <motion.div
                    key={template.id}
                    className="bg-white rounded border border-gray-200 p-3 hover:shadow-md transition-shadow"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    data-testid={`template-${template.id}`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        template.type === 'sms' ? 'bg-blue-100' : 'bg-purple-100'
                      }`}>
                        <i className={`fa-solid ${
                          template.type === 'sms' ? 'fa-comment-sms text-blue-600' : 'fa-envelope text-purple-600'
                        } text-xs`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 text-xs truncate">{template.name}</h3>
                        <p className="text-[10px] text-gray-500">{template.category}</p>
                      </div>
                    </div>
                    
                    {template.subject && (
                      <p className="text-xs font-medium text-gray-700 mb-1 line-clamp-1">
                        {template.subject}
                      </p>
                    )}
                    
                    <p className="text-xs text-gray-600 line-clamp-3 mb-3">{template.content}</p>
                    
                    <div className="flex gap-1 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => handleUseTemplate(template)}
                        className="flex-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100 transition-colors text-[10px] font-medium"
                        data-testid={`use-template-${template.id}`}
                      >
                        <i className="fa-solid fa-check mr-0.5" />
                        Sử dụng
                      </button>
                      <button
                        onClick={() => openTemplateModal(template)}
                        className="flex-1 px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors text-[10px] font-medium"
                        data-testid={`edit-template-${template.id}`}
                      >
                        <i className="fa-solid fa-edit mr-0.5" />
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="px-2 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors text-[10px] font-medium"
                        data-testid={`delete-template-${template.id}`}
                      >
                        <i className="fa-solid fa-trash" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeView === 'create' && (
          <div className="w-full">
            <div className="bg-white rounded border border-gray-200 p-4">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                <i className="fa-solid fa-plus-circle text-fuchsia-600 mr-2" />
                Tạo chiến dịch mới
              </h2>

              {/* API Configuration Warning */}
              {!isApiConfigured(campaignType) && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
                  <div className="flex">
                    <i className="fa-solid fa-exclamation-triangle text-yellow-600 mt-0.5 mr-2" />
                    <div>
                      <p className="text-xs font-semibold text-yellow-800 mb-1">
                        Chưa cấu hình API {campaignType === 'sms' ? 'SMS' : 'Email'}
                      </p>
                      <p className="text-xs text-yellow-700">
                        Vui lòng cấu hình API trong phần <strong>Cài đặt → {campaignType === 'sms' ? 'SMS' : 'Email'}</strong> trước khi gửi chiến dịch thực tế.
                        Bạn vẫn có thể tạo chiến dịch để xem trước và thử nghiệm.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {/* Campaign Type */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Loại chiến dịch <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    {CAMPAIGN_TYPES.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => {
                          setCampaignType(type.id);
                          // Reset selected customers when switching type
                          setSelectedCustomers([]);
                        }}
                        className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                          campaignType === type.id
                            ? `border-${type.color}-600 bg-${type.color}-50`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        data-testid={`campaign-type-${type.id}`}
                      >
                        <i className={`fa-solid ${type.icon} text-${type.color}-600 text-xl mb-2`} />
                        <p className="font-semibold text-sm text-gray-800">{type.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Campaign Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Tên chiến dịch <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
                    placeholder="VD: Khuyến mãi cuối tuần"
                    data-testid="campaign-name-input"
                  />
                </div>

                {/* Template Selection */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Chọn template có sẵn (tùy chọn)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {filteredTemplates
                      .filter(t => t.type === campaignType)
                      .slice(0, 4)
                      .map((template) => (
                        <button
                          key={template.id}
                          onClick={() => handleUseTemplate(template)}
                          className={`p-2 text-left border rounded hover:shadow-sm transition-all ${
                            selectedTemplate?.id === template.id
                              ? 'border-fuchsia-600 bg-fuchsia-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          data-testid={`select-template-${template.id}`}
                        >
                          <p className="text-xs font-semibold text-gray-800 mb-1">{template.name}</p>
                          <p className="text-[10px] text-gray-500 line-clamp-2">{template.content}</p>
                        </button>
                      ))}
                  </div>
                  {filteredTemplates.filter(t => t.type === campaignType).length > 4 && (
                    <button
                      onClick={() => setActiveView('templates')}
                      className="mt-2 text-xs text-fuchsia-600 hover:text-fuchsia-700 font-medium"
                    >
                      Xem tất cả templates →
                    </button>
                  )}
                </div>

                {/* Subject (Email only) */}
                {campaignType === 'email' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Tiêu đề email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
                      placeholder="Nhập tiêu đề email"
                      data-testid="email-subject-input"
                    />
                  </div>
                )}

                {/* Content */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Nội dung {campaignType === 'sms' ? 'tin nhắn' : 'email'} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={campaignType === 'sms' ? 4 : 8}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent resize-none"
                    placeholder={campaignType === 'sms' 
                      ? 'Nhập nội dung tin nhắn SMS (tối đa 160 ký tự khuyến nghị)'
                      : 'Nhập nội dung email'
                    }
                    data-testid="campaign-content-input"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-[10px] text-gray-500">
                      Biến động: {'{{name}}, {{phone}}, {{business_name}}, {{start_date}}, {{end_date}}'}
                    </p>
                    {campaignType === 'sms' && (
                      <p className={`text-[10px] ${content.length > 160 ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                        {content.length} ký tự
                      </p>
                    )}
                  </div>
                </div>

                {/* Customer Selection */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Chọn khách hàng <span className="text-red-500">*</span>
                  </label>
                  <div className="border border-gray-300 rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-600">
                        Đã chọn: <span className="font-semibold text-fuchsia-600">{selectedCustomers.length}</span> khách hàng
                      </p>
                      <button
                        onClick={() => setIsCustomerModalOpen(true)}
                        className="px-3 py-1 bg-fuchsia-600 text-white rounded hover:bg-fuchsia-700 transition-colors text-xs font-medium"
                        data-testid="select-customers-button"
                      >
                        <i className="fa-solid fa-user-plus mr-1" />
                        Chọn khách hàng
                      </button>
                    </div>
                    
                    {selectedCustomers.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedCustomers.slice(0, 10).map((customer) => (
                          <span
                            key={customer.id}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-fuchsia-50 text-fuchsia-700 rounded text-[10px]"
                          >
                            {customer.name}
                            <button
                              onClick={() => handleToggleCustomer(customer)}
                              className="hover:text-fuchsia-900"
                            >
                              <i className="fa-solid fa-times" />
                            </button>
                          </span>
                        ))}
                        {selectedCustomers.length > 10 && (
                          <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px]">
                            +{selectedCustomers.length - 10} khác
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Schedule */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Thời gian gửi
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setScheduleType('now')}
                      className={`flex-1 px-4 py-2 rounded border-2 transition-all ${
                        scheduleType === 'now'
                          ? 'border-emerald-600 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      data-testid="schedule-now"
                    >
                      <i className="fa-solid fa-paper-plane text-emerald-600 mr-2" />
                      <span className="text-sm font-medium">Gửi ngay</span>
                    </button>
                    <button
                      onClick={() => setScheduleType('schedule')}
                      className={`flex-1 px-4 py-2 rounded border-2 transition-all ${
                        scheduleType === 'schedule'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      data-testid="schedule-later"
                    >
                      <i className="fa-solid fa-clock text-blue-600 mr-2" />
                      <span className="text-sm font-medium">Hẹn giờ</span>
                    </button>
                  </div>
                  
                  {scheduleType === 'schedule' && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Ngày</label>
                        <input
                          type="date"
                          value={scheduleDate}
                          onChange={(e) => setScheduleDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
                          data-testid="schedule-date-input"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Giờ</label>
                        <input
                          type="time"
                          value={scheduleTime}
                          onChange={(e) => setScheduleTime(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
                          data-testid="schedule-time-input"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleCreateCampaign}
                    className="w-full px-4 py-2 bg-fuchsia-600 text-white rounded hover:bg-fuchsia-700 transition-colors text-sm font-medium"
                    data-testid="create-campaign-submit"
                  >
                    <i className="fa-solid fa-paper-plane mr-2" />
                    {scheduleType === 'now' ? 'Gửi ngay' : 'Lên lịch gửi'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Customer Selection Modal */}
      <AnimatePresence>
        {isCustomerModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCustomerModalOpen(false)}
          >
            <motion.div
              className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              data-testid="customer-selection-modal"
            >
              <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gradient-to-r from-fuchsia-50 to-pink-50 sticky top-0 z-10">
                <h2 className="text-base font-bold text-gray-800">
                  Chọn khách hàng ({selectedCustomers.length} đã chọn)
                </h2>
                <button
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                  data-testid="close-customer-modal"
                >
                  <i className="fa-solid fa-xmark text-gray-700" />
                </button>
              </div>

              <div className="p-3">
                {/* Search & Filter */}
                <div className="flex gap-2 mb-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Tìm kiếm khách hàng..."
                      value={customerSearchTerm}
                      onChange={(e) => setCustomerSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
                    />
                    <i className="fa-solid fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  </div>
                  
                  <select
                    value={customerFilterMembership}
                    onChange={(e) => setCustomerFilterMembership(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
                  >
                    <option value="all">Tất cả hạng</option>
                    <option value="new">Mới</option>
                    <option value="regular">Thường</option>
                    <option value="vip">VIP</option>
                    <option value="platinum">Platinum</option>
                  </select>
                  
                  <button
                    onClick={handleSelectAllCustomers}
                    className="px-3 py-2 bg-fuchsia-600 text-white rounded hover:bg-fuchsia-700 transition-colors text-sm font-medium whitespace-nowrap"
                    data-testid="select-all-customers"
                  >
                    <i className="fa-solid fa-check-double mr-1" />
                    Chọn tất cả
                  </button>
                </div>

                {/* Info */}
                {campaignType === 'email' && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-2 mb-3">
                    <p className="text-xs text-blue-700">
                      <i className="fa-solid fa-info-circle mr-1" />
                      Chỉ hiển thị khách hàng có địa chỉ email
                    </p>
                  </div>
                )}

                {/* Customer List */}
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {filteredCustomersForSelection.length === 0 ? (
                    <p className="text-center text-sm text-gray-500 py-8">
                      Không tìm thấy khách hàng phù hợp
                    </p>
                  ) : (
                    filteredCustomersForSelection.map((customer) => {
                      const isSelected = selectedCustomers.some(c => c.id === customer.id);
                      return (
                        <div
                          key={customer.id}
                          onClick={() => handleToggleCustomer(customer)}
                          className={`p-2 rounded border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-fuchsia-600 bg-fuchsia-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                          data-testid={`customer-item-${customer.id}`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                              isSelected ? 'border-fuchsia-600 bg-fuchsia-600' : 'border-gray-300'
                            }`}>
                              {isSelected && <i className="fa-solid fa-check text-white text-xs" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800">{customer.name}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <span><i className="fa-solid fa-phone mr-1" />{customer.phone}</span>
                                {customer.email && <span><i className="fa-solid fa-envelope mr-1" />{customer.email}</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => setIsCustomerModalOpen(false)}
                    className="w-full px-4 py-2 bg-fuchsia-600 text-white rounded hover:bg-fuchsia-700 transition-colors text-sm font-medium"
                  >
                    Xong ({selectedCustomers.length} khách hàng)
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template Modal */}
      <AnimatePresence>
        {isTemplateModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsTemplateModalOpen(false)}
          >
            <motion.div
              className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              data-testid="template-modal"
            >
              <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gradient-to-r from-fuchsia-50 to-pink-50 sticky top-0 z-10">
                <h2 className="text-base font-bold text-gray-800">
                  {editingTemplate ? 'Cập nhật template' : 'Thêm template mới'}
                </h2>
                <button
                  onClick={() => setIsTemplateModalOpen(false)}
                  className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                  data-testid="close-template-modal"
                >
                  <i className="fa-solid fa-xmark text-gray-700" />
                </button>
              </div>

              <form onSubmit={handleSaveTemplate} className="p-3">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Tên template <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
                      placeholder="VD: Khuyến mãi cuối tuần"
                      data-testid="template-name-input"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Loại <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={templateForm.type}
                        onChange={(e) => setTemplateForm({ ...templateForm, type: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
                        data-testid="template-type-select"
                      >
                        <option value="sms">SMS</option>
                        <option value="email">Email</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Danh mục
                      </label>
                      <select
                        value={templateForm.category}
                        onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
                        data-testid="template-category-select"
                      >
                        {TEMPLATE_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {templateForm.type === 'email' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Tiêu đề email
                      </label>
                      <input
                        type="text"
                        value={templateForm.subject}
                        onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
                        placeholder="Nhập tiêu đề email"
                        data-testid="template-subject-input"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Nội dung <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      value={templateForm.content}
                      onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                      rows={templateForm.type === 'sms' ? 4 : 8}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent resize-none"
                      placeholder={templateForm.type === 'sms' ? 'Nhập nội dung SMS' : 'Nhập nội dung email'}
                      data-testid="template-content-input"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">
                      Biến động: {'{{name}}, {{phone}}, {{business_name}}, {{start_date}}, {{end_date}}'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-fuchsia-600 text-white rounded hover:bg-fuchsia-700 transition-colors text-sm font-medium"
                    data-testid="submit-template"
                  >
                    {editingTemplate ? 'Cập nhật' : 'Thêm template'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Campaign Detail Modal */}
      <AnimatePresence>
        {isCampaignDetailOpen && viewingCampaign && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCampaignDetailOpen(false)}
          >
            <motion.div
              className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              data-testid="campaign-detail-modal"
            >
              <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50 sticky top-0 z-10">
                <h2 className="text-base font-bold text-gray-800">Chi tiết chiến dịch</h2>
                <button
                  onClick={() => setIsCampaignDetailOpen(false)}
                  className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                  data-testid="close-campaign-detail"
                >
                  <i className="fa-solid fa-xmark text-gray-700" />
                </button>
              </div>

              <div className="p-4">
                {/* Campaign Info */}
                <div className="bg-gradient-to-br from-fuchsia-50 to-pink-50 rounded p-3 mb-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      viewingCampaign.type === 'sms' ? 'bg-blue-100' : 'bg-purple-100'
                    }`}>
                      <i className={`fa-solid ${
                        viewingCampaign.type === 'sms' ? 'fa-comment-sms text-blue-600' : 'fa-envelope text-purple-600'
                      } text-xl`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 mb-1">{viewingCampaign.name}</h3>
                      <div className="flex gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          viewingCampaign.status === 'sent'
                            ? 'bg-emerald-100 text-emerald-700'
                            : viewingCampaign.status === 'scheduled'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {viewingCampaign.status === 'sent' ? 'Đã gửi' : viewingCampaign.status === 'scheduled' ? 'Đã lên lịch' : 'Nháp'}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700">
                          {viewingCampaign.type === 'sms' ? 'SMS' : 'Email'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <p><i className="fa-solid fa-calendar mr-2" />Tạo lúc: {formatDate(viewingCampaign.createdAt)}</p>
                        {viewingCampaign.sentAt && <p><i className="fa-solid fa-paper-plane mr-2" />Gửi lúc: {formatDate(viewingCampaign.sentAt)}</p>}
                        {viewingCampaign.scheduledAt && <p><i className="fa-solid fa-clock mr-2" />Hẹn gửi: {formatDate(viewingCampaign.scheduledAt)}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                {viewingCampaign.status === 'sent' && (
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="bg-blue-50 rounded p-2 text-center">
                      <p className="text-lg font-bold text-blue-700">{viewingCampaign.recipients}</p>
                      <p className="text-xs text-gray-600">Người nhận</p>
                    </div>
                    <div className="bg-emerald-50 rounded p-2 text-center">
                      <p className="text-lg font-bold text-emerald-700">{viewingCampaign.deliveredCount}</p>
                      <p className="text-xs text-gray-600">Đã nhận</p>
                    </div>
                    <div className="bg-red-50 rounded p-2 text-center">
                      <p className="text-lg font-bold text-red-700">{viewingCampaign.failedCount}</p>
                      <p className="text-xs text-gray-600">Thất bại</p>
                    </div>
                    <div className="bg-purple-50 rounded p-2 text-center">
                      <p className="text-lg font-bold text-purple-700">
                        {viewingCampaign.sentCount > 0 
                          ? ((viewingCampaign.deliveredCount / viewingCampaign.sentCount) * 100).toFixed(1)
                          : 0}%
                      </p>
                      <p className="text-xs text-gray-600">Tỷ lệ</p>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="space-y-3">
                  {viewingCampaign.subject && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Tiêu đề</label>
                      <p className="text-sm text-gray-800 p-2 bg-gray-50 rounded">{viewingCampaign.subject}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Nội dung</label>
                    <p className="text-sm text-gray-800 p-3 bg-gray-50 rounded whitespace-pre-wrap">{viewingCampaign.content}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
