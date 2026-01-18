import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';

// Mock data
const generateMockProxies = () => {
  const countries = [
    { code: 'ZA', name: 'South Africa', flag: '🇿🇦', states: ['Gauteng', 'Western Cape'], cities: ['Johannesburg', 'Cape Town', 'Vredendal', 'Pretoria'] },
    { code: 'US', name: 'United States', flag: '🇺🇸', states: ['Ohio', 'Florida', 'Maryland', 'California', 'North Carolina', 'Tennessee'], cities: ['Dayton', 'Fort Lauderdale', 'Ellicott City', 'La Verne', 'Morrisville', 'Somerville', 'Compton'] },
    { code: 'GH', name: 'Ghana', flag: '🇬🇭', states: ['Greater Accra'], cities: ['Accra'] },
    { code: 'KE', name: 'Kenya', flag: '🇰🇪', states: ['Nairobi County'], cities: ['Nairobi'] },
    { code: 'AL', name: 'Albania', flag: '🇦🇱', states: ['Tirana'], cities: ['Tirana'] },
    { code: 'PH', name: 'Philippines', flag: '🇵🇭', states: ['Zamboanga Sibugay'], cities: ['Calatian'] },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', states: ['England'], cities: ['London'] },
    { code: 'NP', name: 'Nepal', flag: '🇳🇵', states: ['Bagmati Province'], cities: ['Kathmandu'] },
  ];

  const proxies = [
    { ip: '102.33.***.**', ping: 20, country: 'ZA', state: 'Gauteng', city: 'Johannesburg', zip: '2041', isp: 'AS327782 Metrofibre Networx' },
    { ip: '108.246.**.**', ping: 31, country: 'US', state: 'Ohio', city: 'Dayton', zip: '45402', isp: 'AS7018 AT&T Enterprises, LLC' },
    { ip: '143.105.**.**', ping: 29, country: 'GH', state: 'Greater Accra', city: 'Accra', zip: '-', isp: 'AS14593 Space Exploration Technologies Corporation' },
    { ip: '102.210.**.**', ping: 28, country: 'KE', state: 'Nairobi County', city: 'Nairobi', zip: '00800', isp: 'AS328014 Vfcom Networks Limited' },
    { ip: '102.86.***.**', ping: 28, country: 'ZA', state: 'Western Cape', city: 'Vredendal', zip: '8207', isp: 'AS328471 Hero Telecoms (Pty) Ltd' },
    { ip: '73.125.**.**', ping: 42, country: 'US', state: 'Florida', city: 'Fort Lauderdale', zip: '33311', isp: 'AS7922 Comcast Cable Communications, LLC' },
    { ip: '31.171.**.**', ping: 21, country: 'AL', state: 'Tirana', city: 'Tirana', zip: '1700', isp: 'AS197708 Keminet ShPK' },
    { ip: '105.209.**.**', ping: 42, country: 'ZA', state: 'Western Cape', city: 'Cape Town', zip: '7945', isp: 'AS16637 MTN SA' },
    { ip: '180.195.**.**', ping: 62, country: 'PH', state: 'Zamboanga Sibugay', city: 'Calatian', zip: '7018', isp: 'AS9299 Philippine Long Distance Telephone Company' },
    { ip: '71.121.**.**', ping: 53, country: 'US', state: 'Maryland', city: 'Ellicott City', zip: '21043', isp: 'AS701 Verizon Business' },
    { ip: '102.132.**.**', ping: 17, country: 'ZA', state: 'Western Cape', city: 'Cape Town', zip: '7945', isp: 'AS37960 Cool Ideas Service Provider (Pty) Ltd' },
    { ip: '165.162.**.**', ping: 58, country: 'GB', state: 'England', city: 'London', zip: 'EC4', isp: 'AS42831 UK Dedicated Servers Limited' },
    { ip: '27.34.***.**', ping: 80, country: 'NP', state: 'Bagmati Province', city: 'Kathmandu', zip: '-', isp: 'AS17501 WorldLink Communications Pvt Ltd' },
    { ip: '63.249.**.**', ping: 70, country: 'US', state: 'California', city: 'La Verne', zip: '91750', isp: 'AS14978 Consolidated Smart Systems LLC' },
    { ip: '136.61.***.**', ping: 50, country: 'US', state: 'North Carolina', city: 'Morrisville', zip: '27560', isp: 'AS16591 Google Fiber Inc.' },
    { ip: '76.33.***.**', ping: 61, country: 'US', state: 'California', city: 'Compton', zip: '90223', isp: 'AS20001 Charter Communications Inc' },
    { ip: '102.216.**.**', ping: 42, country: 'ZA', state: 'Western Cape', city: 'Cape Town', zip: '8001', isp: 'AS328062 Baremetal Computer Traders' },
    { ip: '75.45.***.**', ping: 71, country: 'US', state: 'Tennessee', city: 'Somerville', zip: '38068', isp: 'AS7018 AT&T Enterprises, LLC' },
  ];

  return proxies.map((proxy, idx) => {
    const countryData = countries.find(c => c.code === proxy.country);
    return {
      ...proxy,
      id: idx + 1,
      flag: countryData?.flag || '🏁',
      countryName: countryData?.name || 'Unknown',
      favorite: false,
    };
  });
};

export const ProxyTable = () => {
  const [proxies, setProxies] = useState(generateMockProxies());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterState, setFilterState] = useState('all');
  const [filterCity, setFilterCity] = useState('all');
  const [activeTab, setActiveTab] = useState('proxy-list');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const toggleFavorite = (id) => {
    setProxies(prev =>
      prev.map(p => (p.id === id ? { ...p, favorite: !p.favorite } : p))
    );
  };

  const countries = useMemo(() => {
    const unique = [...new Set(proxies.map(p => p.countryName))];
    return unique.sort();
  }, [proxies]);

  const states = useMemo(() => {
    if (filterCountry === 'all') return [];
    const unique = [...new Set(proxies.filter(p => p.countryName === filterCountry).map(p => p.state))];
    return unique.sort();
  }, [proxies, filterCountry]);

  const cities = useMemo(() => {
    if (filterState === 'all') return [];
    const unique = [...new Set(proxies.filter(p => p.state === filterState).map(p => p.city))];
    return unique.sort();
  }, [proxies, filterState]);

  const filteredProxies = useMemo(() => {
    let filtered = proxies;

    if (activeTab === 'favorites') {
      filtered = filtered.filter(p => p.favorite);
    } else if (activeTab === 'today') {
      filtered = filtered.slice(0, 5);
    }

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.ip.includes(searchTerm) ||
        p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.isp.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCountry !== 'all') {
      filtered = filtered.filter(p => p.countryName === filterCountry);
    }

    if (filterState !== 'all') {
      filtered = filtered.filter(p => p.state === filterState);
    }

    if (filterCity !== 'all') {
      filtered = filtered.filter(p => p.city === filterCity);
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
  }, [proxies, searchTerm, filterCountry, filterState, filterCity, activeTab, sortConfig]);

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

  return (
    <div className="flex-1 flex flex-col h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b border-border px-6 pt-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="proxy-list" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-foreground">
              Proxy List
            </TabsTrigger>
            <TabsTrigger value="today" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-foreground">
              Today List
            </TabsTrigger>
            <TabsTrigger value="favorites" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-foreground">
              Favorites
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={filterCountry} onValueChange={setFilterCountry}>
              <SelectTrigger className="w-[180px] bg-input border-border">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countries.map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterState} onValueChange={setFilterState} disabled={filterCountry === 'all'}>
              <SelectTrigger className="w-[180px] bg-input border-border">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {states.map(state => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterCity} onValueChange={setFilterCity} disabled={filterState === 'all'}>
              <SelectTrigger className="w-[180px] bg-input border-border">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex-1 min-w-[200px] relative">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by IP"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input border-border"
              />
            </div>

            <Button className="bg-primary hover:bg-primary-glow text-white">
              <i className="fa-solid fa-magnifying-glass mr-2" style={{ color: 'white' }} />
              <span className="font-medium">Search</span>
            </Button>
          </div>

          <TabsContent value={activeTab} className="m-0 flex-1">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => handleSort('ip')}
                          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Proxy IP
                          <i className={`fa-solid ${getSortIcon('ip')} text-xs`} />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => handleSort('ping')}
                          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Ping
                          <i className={`fa-solid ${getSortIcon('ping')} text-xs`} />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => handleSort('countryName')}
                          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Country
                          <i className={`fa-solid ${getSortIcon('countryName')} text-xs`} />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => handleSort('state')}
                          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                          State
                          <i className={`fa-solid ${getSortIcon('state')} text-xs`} />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => handleSort('city')}
                          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                          City
                          <i className={`fa-solid ${getSortIcon('city')} text-xs`} />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => handleSort('zip')}
                          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                          ZIP
                          <i className={`fa-solid ${getSortIcon('zip')} text-xs`} />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <span className="text-sm font-medium text-muted-foreground">ISP</span>
                      </th>
                      <th className="px-4 py-3 text-center">
                        <span className="text-sm font-medium text-muted-foreground">Forward</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                      {filteredProxies.map((proxy, idx) => (
                        <tr
                          key={proxy.id}
                          className="border-b border-border hover:bg-muted/30 transition-colors group"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <motion.button
                                onClick={() => toggleFavorite(proxy.id)}
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                className="transition-colors"
                              >
                                <i className={`fa-${proxy.favorite ? 'solid' : 'regular'} fa-star text-${proxy.favorite ? 'warning' : 'muted-foreground'}`} />
                              </motion.button>
                              <span className="font-mono text-sm font-medium text-foreground">{proxy.ip}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-sm font-medium ${
                              proxy.ping < 30 ? 'text-success' :
                              proxy.ping < 50 ? 'text-warning' :
                              'text-destructive'
                            }`}>
                              {proxy.ping} ms
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{proxy.flag}</span>
                              <span className="text-sm text-foreground">{proxy.country}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-muted-foreground">{proxy.state}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-foreground">{proxy.city}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-muted-foreground">{proxy.zip}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-muted-foreground">{proxy.isp}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                            >
                              <i className="fa-solid fa-chevron-right text-muted-foreground group-hover:text-primary" />
                            </motion.button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <i className="fa-solid fa-server text-primary" />
                  <span>Proxy: {filteredProxies.length} / {proxies.length} Port</span>
                </div>
                <Button
                  variant="outline"
                  className="border-primary/30 text-primary hover:bg-primary/10 hover:text-primary-glow"
                >
                  <i className="fa-solid fa-rotate-right mr-2" />
                  Refresh List After: 30 (min)
                </Button>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
