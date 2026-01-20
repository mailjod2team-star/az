import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedLogo } from './AnimatedLogo';
import { NotificationSidebar } from './NotificationSidebar';
import { SupportSidebar } from './SupportSidebar';

// Danh sách đầy đủ các quốc gia
const languages = [
  { code: 'vn', name: 'Tiếng Việt', fullName: 'Vietnam' },
  { code: 'us', name: 'English', fullName: 'United States' },
  { code: 'gb', name: 'English (UK)', fullName: 'United Kingdom' },
  { code: 'cn', name: '中文', fullName: 'China' },
  { code: 'jp', name: '日本語', fullName: 'Japan' },
  { code: 'kr', name: '한국어', fullName: 'South Korea' },
  { code: 'fr', name: 'Français', fullName: 'France' },
  { code: 'de', name: 'Deutsch', fullName: 'Germany' },
  { code: 'es', name: 'Español', fullName: 'Spain' },
  { code: 'it', name: 'Italiano', fullName: 'Italy' },
  { code: 'ru', name: 'Русский', fullName: 'Russia' },
  { code: 'br', name: 'Português', fullName: 'Brazil' },
  { code: 'pt', name: 'Português', fullName: 'Portugal' },
  { code: 'mx', name: 'Español', fullName: 'Mexico' },
  { code: 'ar', name: 'Español', fullName: 'Argentina' },
  { code: 'in', name: 'हिन्दी', fullName: 'India' },
  { code: 'id', name: 'Indonesia', fullName: 'Indonesia' },
  { code: 'th', name: 'ไทย', fullName: 'Thailand' },
  { code: 'my', name: 'Melayu', fullName: 'Malaysia' },
  { code: 'sg', name: 'English', fullName: 'Singapore' },
  { code: 'ph', name: 'Filipino', fullName: 'Philippines' },
  { code: 'au', name: 'English', fullName: 'Australia' },
  { code: 'ca', name: 'English', fullName: 'Canada' },
  { code: 'nl', name: 'Nederlands', fullName: 'Netherlands' },
  { code: 'be', name: 'Nederlands', fullName: 'Belgium' },
  { code: 'ch', name: 'Deutsch', fullName: 'Switzerland' },
  { code: 'at', name: 'Deutsch', fullName: 'Austria' },
  { code: 'se', name: 'Svenska', fullName: 'Sweden' },
  { code: 'no', name: 'Norsk', fullName: 'Norway' },
  { code: 'dk', name: 'Dansk', fullName: 'Denmark' },
  { code: 'fi', name: 'Suomi', fullName: 'Finland' },
  { code: 'pl', name: 'Polski', fullName: 'Poland' },
  { code: 'cz', name: 'Čeština', fullName: 'Czech Republic' },
  { code: 'gr', name: 'Ελληνικά', fullName: 'Greece' },
  { code: 'tr', name: 'Türkçe', fullName: 'Turkey' },
  { code: 'sa', name: 'العربية', fullName: 'Saudi Arabia' },
  { code: 'ae', name: 'العربية', fullName: 'United Arab Emirates' },
  { code: 'eg', name: 'العربية', fullName: 'Egypt' },
  { code: 'il', name: 'עברית', fullName: 'Israel' },
  { code: 'za', name: 'English', fullName: 'South Africa' },
  { code: 'ng', name: 'English', fullName: 'Nigeria' },
  { code: 'ke', name: 'English', fullName: 'Kenya' },
  { code: 'nz', name: 'English', fullName: 'New Zealand' },
  { code: 'ie', name: 'English', fullName: 'Ireland' },
  { code: 'pk', name: 'اردو', fullName: 'Pakistan' },
  { code: 'bd', name: 'বাংলা', fullName: 'Bangladesh' },
  { code: 'lk', name: 'සිංහල', fullName: 'Sri Lanka' },
  { code: 'np', name: 'नेपाली', fullName: 'Nepal' },
  { code: 'mm', name: 'မြန်မာ', fullName: 'Myanmar' },
  { code: 'kh', name: 'ខ្មែរ', fullName: 'Cambodia' },
  { code: 'la', name: 'ລາວ', fullName: 'Laos' },
  { code: 'hk', name: '中文', fullName: 'Hong Kong' },
  { code: 'tw', name: '中文', fullName: 'Taiwan' },
  { code: 'mo', name: '中文', fullName: 'Macau' },
  { code: 'kz', name: 'Қазақ', fullName: 'Kazakhstan' },
  { code: 'uz', name: 'Oʻzbek', fullName: 'Uzbekistan' },
  { code: 'ua', name: 'Українська', fullName: 'Ukraine' },
  { code: 'ro', name: 'Română', fullName: 'Romania' },
  { code: 'hu', name: 'Magyar', fullName: 'Hungary' },
  { code: 'bg', name: 'Български', fullName: 'Bulgaria' },
  { code: 'hr', name: 'Hrvatski', fullName: 'Croatia' },
  { code: 'rs', name: 'Српски', fullName: 'Serbia' },
  { code: 'sk', name: 'Slovenčina', fullName: 'Slovakia' },
  { code: 'si', name: 'Slovenščina', fullName: 'Slovenia' },
  { code: 'lt', name: 'Lietuvių', fullName: 'Lithuania' },
  { code: 'lv', name: 'Latviešu', fullName: 'Latvia' },
  { code: 'ee', name: 'Eesti', fullName: 'Estonia' },
  { code: 'is', name: 'Íslenska', fullName: 'Iceland' },
  { code: 'cl', name: 'Español', fullName: 'Chile' },
  { code: 'co', name: 'Español', fullName: 'Colombia' },
  { code: 've', name: 'Español', fullName: 'Venezuela' },
  { code: 'pe', name: 'Español', fullName: 'Peru' },
  { code: 'uy', name: 'Español', fullName: 'Uruguay' },
  { code: 'ec', name: 'Español', fullName: 'Ecuador' },
  { code: 'bo', name: 'Español', fullName: 'Bolivia' },
  { code: 'py', name: 'Español', fullName: 'Paraguay' },
  { code: 'cu', name: 'Español', fullName: 'Cuba' },
  { code: 'do', name: 'Español', fullName: 'Dominican Republic' },
  { code: 'gt', name: 'Español', fullName: 'Guatemala' },
  { code: 'hn', name: 'Español', fullName: 'Honduras' },
  { code: 'ni', name: 'Español', fullName: 'Nicaragua' },
  { code: 'sv', name: 'Español', fullName: 'El Salvador' },
  { code: 'cr', name: 'Español', fullName: 'Costa Rica' },
  { code: 'pa', name: 'Español', fullName: 'Panama' },
  { code: 'pr', name: 'Español', fullName: 'Puerto Rico' },
  { code: 'jm', name: 'English', fullName: 'Jamaica' },
  { code: 'tt', name: 'English', fullName: 'Trinidad and Tobago' },
  { code: 'bs', name: 'English', fullName: 'Bahamas' },
  { code: 'bb', name: 'English', fullName: 'Barbados' },
  { code: 'ma', name: 'العربية', fullName: 'Morocco' },
  { code: 'dz', name: 'العربية', fullName: 'Algeria' },
  { code: 'tn', name: 'العربية', fullName: 'Tunisia' },
  { code: 'ly', name: 'العربية', fullName: 'Libya' },
  { code: 'sd', name: 'العربية', fullName: 'Sudan' },
  { code: 'jo', name: 'العربية', fullName: 'Jordan' },
  { code: 'lb', name: 'العربية', fullName: 'Lebanon' },
  { code: 'sy', name: 'العربية', fullName: 'Syria' },
  { code: 'iq', name: 'العربية', fullName: 'Iraq' },
  { code: 'kw', name: 'العربية', fullName: 'Kuwait' },
  { code: 'qa', name: 'العربية', fullName: 'Qatar' },
  { code: 'bh', name: 'العربية', fullName: 'Bahrain' },
  { code: 'om', name: 'العربية', fullName: 'Oman' },
  { code: 'ye', name: 'العربية', fullName: 'Yemen' },
  { code: 'et', name: 'አማርኛ', fullName: 'Ethiopia' },
  { code: 'gh', name: 'English', fullName: 'Ghana' },
  { code: 'tz', name: 'Swahili', fullName: 'Tanzania' },
  { code: 'ug', name: 'English', fullName: 'Uganda' },
  { code: 'zw', name: 'English', fullName: 'Zimbabwe' },
  { code: 'sn', name: 'Français', fullName: 'Senegal' },
  { code: 'ci', name: 'Français', fullName: 'Ivory Coast' },
  { code: 'cm', name: 'Français', fullName: 'Cameroon' },
  { code: 'mg', name: 'Français', fullName: 'Madagascar' },
  { code: 'ao', name: 'Português', fullName: 'Angola' },
  { code: 'mz', name: 'Português', fullName: 'Mozambique' },
  { code: 'mn', name: 'Монгол', fullName: 'Mongolia' },
  { code: 'af', name: 'پښتو', fullName: 'Afghanistan' },
  { code: 'ir', name: 'فارسی', fullName: 'Iran' },
  { code: 'am', name: 'Հայերեն', fullName: 'Armenia' },
  { code: 'ge', name: 'ქართული', fullName: 'Georgia' },
  { code: 'az', name: 'Azərbaycan', fullName: 'Azerbaijan' },
  { code: 'by', name: 'Беларуская', fullName: 'Belarus' },
  { code: 'md', name: 'Română', fullName: 'Moldova' },
  { code: 'al', name: 'Shqip', fullName: 'Albania' },
  { code: 'mk', name: 'Македонски', fullName: 'North Macedonia' },
  { code: 'ba', name: 'Bosanski', fullName: 'Bosnia and Herzegovina' },
  { code: 'me', name: 'Crnogorski', fullName: 'Montenegro' },
  { code: 'xk', name: 'Shqip', fullName: 'Kosovo' },
  { code: 'cy', name: 'Ελληνικά', fullName: 'Cyprus' },
  { code: 'mt', name: 'Malti', fullName: 'Malta' },
  { code: 'lu', name: 'Français', fullName: 'Luxembourg' },
  { code: 'mc', name: 'Français', fullName: 'Monaco' },
  { code: 'li', name: 'Deutsch', fullName: 'Liechtenstein' },
  { code: 'ad', name: 'Català', fullName: 'Andorra' },
  { code: 'sm', name: 'Italiano', fullName: 'San Marino' },
  { code: 'va', name: 'Italiano', fullName: 'Vatican City' },
  { code: 'bn', name: 'Melayu', fullName: 'Brunei' },
  { code: 'mv', name: 'ދިވެހި', fullName: 'Maldives' },
  { code: 'bt', name: 'རྫོང་ཁ', fullName: 'Bhutan' },
  { code: 'tl', name: 'Português', fullName: 'Timor-Leste' },
  { code: 'fj', name: 'English', fullName: 'Fiji' },
  { code: 'pg', name: 'English', fullName: 'Papua New Guinea' },
  { code: 'ws', name: 'Samoan', fullName: 'Samoa' },
  { code: 'to', name: 'Tongan', fullName: 'Tonga' },
  { code: 'vu', name: 'Bislama', fullName: 'Vanuatu' },
  { code: 'sb', name: 'English', fullName: 'Solomon Islands' },
  { code: 'ki', name: 'English', fullName: 'Kiribati' },
  { code: 'mh', name: 'English', fullName: 'Marshall Islands' },
  { code: 'fm', name: 'English', fullName: 'Micronesia' },
  { code: 'pw', name: 'English', fullName: 'Palau' },
  { code: 'nr', name: 'English', fullName: 'Nauru' },
  { code: 'tv', name: 'English', fullName: 'Tuvalu' },
];

export const Header = () => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]); // Default: Vietnam

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    setIsLanguageModalOpen(false);
  };

  // Thông tin người dùng
  const userInfo = {
    fullName: 'Triệu Văn Quang',
    email: 'trieuvq@example.com',
    phone: '+84 123 456 789',
    otherContact: 'Zalo: 0123456789',
    activationDate: '01/01/2024',
    expirationDate: '31/12/2024'
  };

  return (
    <>
      <motion.header
        className="h-16 bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-b border-gray-200 flex items-center justify-between pl-3 pr-6 shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <AnimatedLogo />

        <div className="flex items-center gap-3">
          {/* Avatar và Tên */}
          <motion.button
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-2 hover:bg-gray-100 rounded-lg p-1.5 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            data-testid="profile-button"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white">
              <i className="fa-solid fa-user text-sm"></i>
            </div>
            <span className="text-sm font-medium text-gray-700">{userInfo.fullName}</span>
          </motion.button>

          {/* Thanh dọc - thấp hơn */}
          <div className="h-5 w-px bg-gray-300"></div>

          {/* Language Selector */}
          <motion.button
            onClick={() => setIsLanguageModalOpen(true)}
            className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            data-testid="language-selector-button"
          >
            <img 
              src={`https://flagcdn.com/w320/${selectedLanguage.code}.png`}
              alt={selectedLanguage.fullName} 
              className="h-7 w-10 object-cover rounded shadow-sm border border-gray-200"
            />
          </motion.button>

          {/* Thanh dọc - cao hơn */}
          <div className="h-8 w-px bg-gray-300"></div>

          {/* Icon giới thiệu */}
          <motion.button
            className="p-2.5 hover:bg-gray-200 rounded-lg transition-colors relative group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="fa-solid fa-circle-info text-xl text-gray-700" />
          </motion.button>

          <motion.button
            onClick={() => {
              setIsNotificationOpen(true);
              setIsSupportOpen(false);
            }}
            className="p-2.5 hover:bg-gray-200 rounded-lg transition-colors relative group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="fa-solid fa-bell text-xl text-gray-700" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </motion.button>

          <motion.button
            onClick={() => {
              setIsSupportOpen(true);
              setIsNotificationOpen(false);
            }}
            className="p-2.5 hover:bg-gray-200 rounded-lg transition-colors relative group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="fa-solid fa-headset text-xl text-gray-700" />
          </motion.button>

          <div className="flex items-center gap-2 ml-4 border-l border-gray-300 pl-4">
            <motion.button
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="fa-solid fa-minus text-gray-700" />
            </motion.button>
            <motion.button
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="fa-regular fa-square text-gray-700" />
            </motion.button>
            <motion.button
              className="p-2 hover:bg-red-500 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="fa-solid fa-xmark text-white" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Notification Sidebar */}
      <NotificationSidebar 
        isOpen={isNotificationOpen} 
        onClose={() => setIsNotificationOpen(false)} 
      />

      {/* Support Sidebar */}
      <SupportSidebar 
        isOpen={isSupportOpen} 
        onClose={() => setIsSupportOpen(false)} 
      />

      {/* Profile Information Modal */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/60 z-[9998] flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileModalOpen(false)}
              data-testid="profile-modal-backdrop"
            >
              {/* Modal */}
              <motion.div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-lg shadow-2xl w-[90%] max-w-2xl overflow-hidden relative z-[9999]"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                data-testid="profile-modal"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
                  <h2 className="text-base font-bold text-gray-800">Thông Tin Người Dùng</h2>
                  <motion.button
                    onClick={() => setIsProfileModalOpen(false)}
                    className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    data-testid="close-profile-modal"
                  >
                    <i className="fa-solid fa-xmark text-gray-700 text-lg"></i>
                  </motion.button>
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Avatar */}
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg">
                      <i className="fa-solid fa-user text-2xl"></i>
                    </div>
                  </div>

                  {/* User Information - 2 cards per row */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Họ tên */}
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-user text-gray-500 text-xs"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-0.5">Họ tên</p>
                        <p className="text-sm font-semibold text-gray-800 truncate">{userInfo.fullName}</p>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-envelope text-gray-500 text-xs"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-0.5">Email</p>
                        <p className="text-sm font-semibold text-gray-800 truncate">{userInfo.email}</p>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-phone text-gray-500 text-xs"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-0.5">Số điện thoại</p>
                        <p className="text-sm font-semibold text-gray-800 truncate">{userInfo.phone}</p>
                      </div>
                    </div>

                    {/* Liên hệ khác */}
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-comment text-gray-500 text-xs"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-0.5">Liên hệ khác</p>
                        <p className="text-sm font-semibold text-gray-800 truncate">{userInfo.otherContact}</p>
                      </div>
                    </div>

                    {/* Ngày kích hoạt */}
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-calendar-check text-gray-500 text-xs"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-0.5">Ngày kích hoạt</p>
                        <p className="text-sm font-semibold text-gray-800 truncate">{userInfo.activationDate}</p>
                      </div>
                    </div>

                    {/* Ngày hết hạn */}
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-calendar-xmark text-gray-500 text-xs"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-0.5">Ngày hết hạn</p>
                        <p className="text-sm font-semibold text-gray-800 truncate">{userInfo.expirationDate}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Language Selection Modal */}
      <AnimatePresence>
        {isLanguageModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/60 z-[9998] flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLanguageModalOpen(false)}
              data-testid="language-modal-backdrop"
            >
              {/* Modal - Click event stopped to prevent closing when clicking inside */}
              <motion.div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-lg shadow-2xl w-[90%] max-w-3xl max-h-[85vh] overflow-hidden relative z-[9999]"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                data-testid="language-modal"
              >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
                <div>
                  <h2 className="text-base font-bold text-gray-800">Chọn Ngôn Ngữ</h2>
                </div>
                <motion.button
                  onClick={() => setIsLanguageModalOpen(false)}
                  className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  data-testid="close-language-modal"
                >
                  <i className="fa-solid fa-xmark text-gray-700 text-lg"></i>
                </motion.button>
              </div>

              {/* Language List */}
              <div className="p-3 overflow-y-auto max-h-[calc(85vh-60px)]">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {languages.map((language, index) => (
                    <motion.button
                      key={language.code}
                      onClick={() => handleLanguageSelect(language)}
                      className={`flex items-center gap-2 p-2 rounded-md border transition-all ${
                        selectedLanguage.code === language.code
                          ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                          : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                      }`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.01 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      data-testid={`language-option-${language.code}`}
                    >
                      <img
                        src={`https://flagcdn.com/w320/${language.code}.png`}
                        alt={language.fullName}
                        className="w-8 h-6 object-cover rounded shadow-sm"
                      />
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">{language.fullName}</p>
                      </div>
                      {selectedLanguage.code === language.code && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0"
                        >
                          <i className="fa-solid fa-check text-white text-[8px]"></i>
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};