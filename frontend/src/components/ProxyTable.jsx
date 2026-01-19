import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { toast, Toaster } from 'sonner';

// Mock data - Profiles
const generateMockProfiles = () => {
  const osList = ['Windows 10', 'Windows 11', 'macOS Monterey', 'macOS Ventura', 'Ubuntu 22.04'];
  const chromeVersions = ['120.0.6099.109', '119.0.6045.105', '121.0.6167.85', '122.0.6261.94', '123.0.6312.58'];
  const profileNames = [
    'Profile Marketing A',
    'Profile Facebook Shop',
    'Profile TikTok Seller',
    'Profile Instagram Business',
    'Profile Shopee Store 1',
    'Profile Lazada VN',
    'Profile Google Ads',
    'Profile YouTube Channel',
    'Profile Twitter Marketing',
    'Profile LinkedIn Pro',
    'Profile Pinterest Shop',
    'Profile Etsy Store',
    'Profile Amazon Seller',
    'Profile eBay Business',
    'Profile Tokopedia',
  ];

  return profileNames.map((name, idx) => ({
    id: idx + 1,
    name: name,
    proxy: `${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}:${8000 + Math.floor(Math.random() * 1000)}`,
    os: osList[Math.floor(Math.random() * osList.length)],
    chromeVersion: chromeVersions[Math.floor(Math.random() * chromeVersions.length)],
  }));
};

export const ProxyTable = () => {
  const [profiles, setProfiles] = useState(generateMockProfiles());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOS, setFilterOS] = useState('all');
  const [filterChrome, setFilterChrome] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const osList = useMemo(() => {
    const unique = [...new Set(profiles.map(p => p.os))];
    return unique.sort();
  }, [profiles]);

  const chromeVersions = useMemo(() => {
    const unique = [...new Set(profiles.map(p => p.chromeVersion))];
    return unique.sort();
  }, [profiles]);

  const filteredProfiles = useMemo(() => {
    let filtered = profiles;

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.proxy.includes(searchTerm)
      );
    }

    if (filterOS !== 'all') {
      filtered = filtered.filter(p => p.os === filterOS);
    }

    if (filterChrome !== 'all') {
      filtered = filtered.filter(p => p.chromeVersion === filterChrome);
    }

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [profiles, searchTerm, filterOS, filterChrome, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return 'fa-sort';
    return sortConfig.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  };

  const handleEdit = (id) => {
    toast.success(`Đang chỉnh sửa profile #${id}`);
  };

  const handleDelete = (id) => {
    setProfiles(prev => prev.filter(p => p.id !== id));
    toast.success(`Đã xóa profile #${id}`);
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Toast Container */}
      <Toaster position="bottom-left" richColors closeButton duration={2000} />

      <div className="p-6 space-y-4 flex-1 flex flex-col">
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={filterOS} onValueChange={setFilterOS}>
            <SelectTrigger className="w-[200px] bg-input border-border">
              <SelectValue placeholder="Hệ điều hành" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả HĐH</SelectItem>
              {osList.map(os => (
                <SelectItem key={os} value={os}>{os}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterChrome} onValueChange={setFilterChrome}>
            <SelectTrigger className="w-[200px] bg-input border-border">
              <SelectValue placeholder="Phiên bản Chrome" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả phiên bản</SelectItem>
              {chromeVersions.map(version => (
                <SelectItem key={version} value={version}>{version}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex-1 min-w-[200px] relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên hoặc proxy"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-input border-border"
            />
          </div>

          <Button className="bg-primary hover:bg-primary-glow text-white">
            <i className="fa-solid fa-magnifying-glass mr-2" style={{ color: 'white' }} />
            <span className="font-medium">Tìm kiếm</span>
          </Button>

          <Button className="bg-success hover:bg-success/80 text-white">
            <i className="fa-solid fa-plus mr-2" style={{ color: 'white' }} />
            <span className="font-medium">Thêm Profile mới</span>
          </Button>
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden flex-1 flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left w-20">
                    <span className="text-sm font-medium text-muted-foreground">STT</span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Tên Profiles
                      <i className={`fa-solid ${getSortIcon('name')} text-xs`} />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('proxy')}
                      className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Proxy
                      <i className={`fa-solid ${getSortIcon('proxy')} text-xs`} />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('os')}
                      className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Hệ điều hành
                      <i className={`fa-solid ${getSortIcon('os')} text-xs`} />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('chromeVersion')}
                      className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Phiên bản Chrome
                      <i className={`fa-solid ${getSortIcon('chromeVersion')} text-xs`} />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center w-40">
                    <span className="text-sm font-medium text-muted-foreground">Thao tác</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProfiles.map((profile, idx) => (
                  <tr
                    key={profile.id}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground font-medium">{idx + 1}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-user-circle text-primary" />
                        <span className="text-sm font-medium text-foreground">{profile.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm text-muted-foreground">{profile.proxy}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <i className={`fa-brands ${
                          profile.os.includes('Windows') ? 'fa-windows' :
                          profile.os.includes('macOS') ? 'fa-apple' :
                          'fa-linux'
                        } text-muted-foreground`} />
                        <span className="text-sm text-foreground">{profile.os}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <i className="fa-brands fa-chrome text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{profile.chromeVersion}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEdit(profile.id)}
                          className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                          data-testid={`edit-profile-${profile.id}`}
                        >
                          <i className="fa-solid fa-pen-to-square text-primary" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(profile.id)}
                          className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                          title="Xóa"
                          data-testid={`delete-profile-${profile.id}`}
                        >
                          <i className="fa-solid fa-trash text-destructive" />
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <i className="fa-solid fa-users text-primary" />
              <span>Tổng số: {filteredProfiles.length} / {profiles.length} Profiles</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
