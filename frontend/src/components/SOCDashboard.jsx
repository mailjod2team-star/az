import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const SOCDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Mock data for charts
  const networkTrafficData = [
    { time: '00:00', inbound: 4000, outbound: 2400, threats: 2 },
    { time: '04:00', inbound: 3000, outbound: 1398, threats: 5 },
    { time: '08:00', inbound: 9800, outbound: 8800, threats: 12 },
    { time: '12:00', inbound: 12000, outbound: 9800, threats: 8 },
    { time: '16:00', inbound: 11000, outbound: 10800, threats: 15 },
    { time: '20:00', inbound: 7800, outbound: 6800, threats: 6 },
    { time: '23:59', inbound: 5500, outbound: 4300, threats: 3 },
  ];

  const threatDistribution = [
    { name: 'Malware', value: 35, color: '#ef4444' },
    { name: 'Phishing', value: 25, color: '#f59e0b' },
    { name: 'DDoS', value: 20, color: '#eab308' },
    { name: 'Brute Force', value: 15, color: '#3b82f6' },
    { name: 'Other', value: 5, color: '#6366f1' },
  ];

  const serverStatusData = [
    { name: 'Web Server 1', status: 'online', cpu: 45, memory: 62, uptime: '99.9%', ip: '192.168.1.10' },
    { name: 'Web Server 2', status: 'online', cpu: 38, memory: 58, uptime: '99.8%', ip: '192.168.1.11' },
    { name: 'Database Primary', status: 'online', cpu: 72, memory: 81, uptime: '99.99%', ip: '192.168.1.20' },
    { name: 'Database Replica', status: 'warning', cpu: 85, memory: 89, uptime: '98.5%', ip: '192.168.1.21' },
    { name: 'API Gateway', status: 'online', cpu: 41, memory: 55, uptime: '99.95%', ip: '192.168.1.30' },
    { name: 'Cache Server', status: 'online', cpu: 28, memory: 45, uptime: '99.7%', ip: '192.168.1.40' },
  ];

  const apiEndpoints = [
    { endpoint: '/api/auth/login', requests: 15420, avgTime: '45ms', status: 'healthy', errors: 2 },
    { endpoint: '/api/users', requests: 8934, avgTime: '120ms', status: 'healthy', errors: 0 },
    { endpoint: '/api/data/query', requests: 25678, avgTime: '380ms', status: 'warning', errors: 15 },
    { endpoint: '/api/files/upload', requests: 3421, avgTime: '2.1s', status: 'healthy', errors: 8 },
    { endpoint: '/api/reports', requests: 1892, avgTime: '560ms', status: 'healthy', errors: 1 },
  ];

  const activeDevices = [
    { id: 'DEV-001', name: 'Admin Workstation', ip: '192.168.1.100', location: 'HQ-Floor3', lastSeen: '2 phút trước', risk: 'low' },
    { id: 'DEV-002', name: 'Dev Server', ip: '192.168.1.101', location: 'DC-Rack2', lastSeen: '1 phút trước', risk: 'low' },
    { id: 'DEV-003', name: 'Guest Device', ip: '192.168.2.150', location: 'Guest-WiFi', lastSeen: '5 phút trước', risk: 'medium' },
    { id: 'DEV-004', name: 'IoT Sensor', ip: '192.168.3.45', location: 'Building-A', lastSeen: '30 giây trước', risk: 'low' },
  ];

  const securityAlerts = [
    { id: 1, severity: 'critical', type: 'Unauthorized Access Attempt', source: '45.123.45.67', time: '2 phút trước', status: 'active' },
    { id: 2, severity: 'high', type: 'Suspicious SQL Query', source: 'DB-Server-01', time: '15 phút trước', status: 'investigating' },
    { id: 3, severity: 'medium', type: 'Multiple Failed Logins', source: '192.168.1.105', time: '1 giờ trước', status: 'resolved' },
    { id: 4, severity: 'high', type: 'Port Scan Detected', source: '88.99.123.45', time: '2 giờ trước', status: 'blocked' },
    { id: 5, severity: 'low', type: 'Certificate Expiring Soon', source: 'api.company.com', time: '3 giờ trước', status: 'acknowledged' },
  ];

  const databaseMetrics = [
    { name: 'Connections', current: 245, max: 1000, status: 'healthy' },
    { name: 'Queries/sec', current: 1834, max: 5000, status: 'healthy' },
    { name: 'Replication Lag', current: 0.2, max: 1, status: 'healthy', unit: 's' },
    { name: 'Storage Used', current: 68, max: 100, status: 'warning', unit: '%' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'offline': case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'online': case 'healthy': return 'bg-green-500/10 border-green-500/30';
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/30';
      case 'offline': case 'critical': return 'bg-red-500/10 border-red-500/30';
      default: return 'bg-gray-500/10 border-gray-500/30';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-emerald-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background p-3" data-testid="soc-dashboard">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        {[
          { icon: 'fa-server', label: 'Máy chủ hoạt động', value: '6/6', status: 'online', detail: 'Tất cả hệ thống ổn định' },
          { icon: 'fa-shield-virus', label: 'Mối đe dọa phát hiện', value: '51', status: 'warning', detail: '24h qua' },
          { icon: 'fa-bell', label: 'Cảnh báo đang xử lý', value: '2', status: 'critical', detail: 'Cần xử lý ngay' },
          { icon: 'fa-chart-line', label: 'Uptime trung bình', value: '99.8%', status: 'online', detail: '30 ngày qua' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`p-3 rounded-lg border ${getStatusBg(stat.status)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <i className={`fa-solid ${stat.icon} text-xl ${getStatusColor(stat.status)}`} />
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${getStatusColor(stat.status)}`}>
                <i className="fa-solid fa-circle text-[5px] mr-1" />
                {stat.status === 'online' ? 'ONLINE' : stat.status === 'warning' ? 'WARNING' : 'ALERT'}
              </span>
            </div>
            <div className="text-2xl font-bold text-foreground mb-0.5">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-[10px] text-muted-foreground mt-1">{stat.detail}</div>
          </motion.div>
        ))}
      </div>

      {/* Network Traffic & Threat Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-card border border-border rounded-lg p-3"
        >
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <i className="fa-solid fa-chart-area text-primary text-xs" />
            Lưu lượng mạng theo thời gian
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={networkTrafficData}>
              <defs>
                <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorOutbound" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
              <Legend />
              <Area type="monotone" dataKey="inbound" stroke="#3b82f6" fillOpacity={1} fill="url(#colorInbound)" name="Inbound (MB/s)" />
              <Area type="monotone" dataKey="outbound" stroke="#10b981" fillOpacity={1} fill="url(#colorOutbound)" name="Outbound (MB/s)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card border border-border rounded-lg p-3"
        >
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <i className="fa-solid fa-chart-pie text-primary text-xs" />
            Phân loại mối đe dọa
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={threatDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {threatDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Server Status Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-lg p-3 mb-3"
      >
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <i className="fa-solid fa-server text-primary text-xs" />
          Trạng thái máy chủ
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {serverStatusData.map((server, index) => (
            <div key={index} className={`p-2.5 rounded-lg border ${getStatusBg(server.status)}`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-foreground text-xs">{server.name}</h4>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${getStatusColor(server.status)}`}>
                  {server.status.toUpperCase()}
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IP:</span>
                  <span className="text-foreground font-mono">{server.ip}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CPU:</span>
                  <span className="text-foreground">{server.cpu}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Memory:</span>
                  <span className="text-foreground">{server.memory}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Uptime:</span>
                  <span className="text-foreground font-semibold">{server.uptime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Database Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-lg p-3 mb-3"
      >
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <i className="fa-solid fa-database text-primary text-xs" />
          Giám sát cơ sở dữ liệu
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {databaseMetrics.map((metric, index) => (
            <div key={index} className={`p-2.5 rounded-lg border ${getStatusBg(metric.status)}`}>
              <div className="text-xs text-muted-foreground mb-1">{metric.name}</div>
              <div className="text-xl font-bold text-foreground mb-1">
                {metric.current}{metric.unit || ''}
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${metric.status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'}`}
                  style={{ width: `${(metric.current / metric.max) * 100}%` }}
                />
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Max: {metric.max}{metric.unit || ''}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* API Endpoints Network Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-lg p-3 mb-3"
      >
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <i className="fa-solid fa-map-location-dot text-primary text-xs" />
          API Endpoints Network Mapping
          <span className="text-[10px] text-muted-foreground ml-auto">Interactive Topology View</span>
        </h3>
        
        {/* Network Map Visualization */}
        <div className="relative bg-gradient-to-br from-emerald-950/30 via-green-950/20 to-slate-950/40 rounded-lg p-6 h-[500px] overflow-hidden border border-primary/20">
          {/* Grid Background */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }} />
          
          {/* Central Gateway Node */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
          >
            <div className="relative">
              {/* Pulse effect */}
              <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
              <div className="relative bg-gradient-to-br from-primary to-emerald-600 rounded-full w-24 h-24 flex items-center justify-center shadow-lg shadow-primary/50 border-4 border-primary/50">
                <div className="text-center">
                  <i className="fa-solid fa-network-wired text-2xl text-white mb-1" />
                  <div className="text-xs font-bold text-white">API</div>
                  <div className="text-xs font-bold text-white">Gateway</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* API Endpoint Nodes */}
          {apiEndpoints.map((api, index) => {
            const angle = (index * (360 / apiEndpoints.length)) * (Math.PI / 180);
            const radius = 220;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            const nodeColor = api.status === 'healthy' ? 'from-green-500 to-emerald-600' : 
                             api.status === 'warning' ? 'from-yellow-500 to-orange-600' : 
                             'from-red-500 to-rose-600';
            const borderColor = api.status === 'healthy' ? 'border-green-500/50' : 
                               api.status === 'warning' ? 'border-yellow-500/50' : 
                               'border-red-500/50';
            const shadowColor = api.status === 'healthy' ? 'shadow-green-500/30' : 
                               api.status === 'warning' ? 'shadow-yellow-500/30' : 
                               'shadow-red-500/30';

            return (
              <React.Fragment key={index}>
                {/* Connection Line */}
                <motion.svg
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.4 }}
                  transition={{ duration: 1, delay: index * 0.2 }}
                  className="absolute inset-0 pointer-events-none"
                  style={{ zIndex: 1 }}
                >
                  <line
                    x1="50%"
                    y1="50%"
                    x2={`calc(50% + ${x}px)`}
                    y2={`calc(50% + ${y}px)`}
                    stroke={api.status === 'healthy' ? '#10b981' : api.status === 'warning' ? '#f59e0b' : '#ef4444'}
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    className="animate-pulse"
                  />
                  {/* Data flow animation */}
                  <circle r="4" fill={api.status === 'healthy' ? '#10b981' : '#f59e0b'}>
                    <animateMotion
                      dur="3s"
                      repeatCount="indefinite"
                      path={`M ${window.innerWidth/2} ${window.innerHeight/2} L ${window.innerWidth/2 + x} ${window.innerHeight/2 + y}`}
                    />
                  </circle>
                </motion.svg>

                {/* API Node */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.15 }}
                  whileHover={{ scale: 1.1, zIndex: 50 }}
                  className="absolute z-10 cursor-pointer group"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
                  }}
                >
                  <div className={`relative bg-gradient-to-br ${nodeColor} rounded-xl w-20 h-20 flex items-center justify-center shadow-lg ${shadowColor} border-2 ${borderColor}`}>
                    <i className="fa-solid fa-plug text-xl text-white" />
                  </div>
                  
                  {/* Tooltip on hover */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg p-3 min-w-[250px] shadow-xl z-50">
                    <div className="text-xs font-mono text-green-400 mb-2">{api.endpoint}</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-slate-400">Requests:</div>
                        <div className="text-white font-semibold">{api.requests.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Avg Time:</div>
                        <div className="text-white font-semibold">{api.avgTime}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Errors:</div>
                        <div className={`font-semibold ${api.errors > 10 ? 'text-red-400' : 'text-green-400'}`}>{api.errors}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Status:</div>
                        <div className={`font-semibold ${api.status === 'healthy' ? 'text-green-400' : 'text-yellow-400'}`}>
                          {api.status.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    {/* Arrow pointing to node */}
                    <div className="absolute left-1/2 -translate-x-1/2 -top-2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-slate-900/95" />
                  </div>
                  
                  {/* Label below node */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 text-xs text-center whitespace-nowrap">
                    <div className="text-foreground font-semibold">{api.endpoint.split('/').pop()}</div>
                    <div className="text-muted-foreground text-[10px]">{api.requests.toLocaleString()} req/day</div>
                  </div>
                </motion.div>
              </React.Fragment>
            );
          })}

          {/* Map Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-30">
            <button className="bg-slate-800/80 backdrop-blur-sm border border-slate-600 rounded-lg p-2 hover:bg-slate-700 transition-colors">
              <i className="fa-solid fa-plus text-white text-sm" />
            </button>
            <button className="bg-slate-800/80 backdrop-blur-sm border border-slate-600 rounded-lg p-2 hover:bg-slate-700 transition-colors">
              <i className="fa-solid fa-minus text-white text-sm" />
            </button>
            <button className="bg-slate-800/80 backdrop-blur-sm border border-slate-600 rounded-lg p-2 hover:bg-slate-700 transition-colors">
              <i className="fa-solid fa-expand text-white text-sm" />
            </button>
          </div>

          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg p-3 z-30">
            <div className="text-xs font-semibold text-white mb-2">Trạng thái kết nối</div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-slate-300">Healthy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-slate-300">Warning</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-slate-300">Critical</span>
              </div>
            </div>
          </div>

          {/* Network Stats Overlay */}
          <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg p-3 z-30">
            <div className="text-xs font-semibold text-white mb-2">Network Stats</div>
            <div className="space-y-1 text-xs text-slate-300">
              <div className="flex justify-between gap-4">
                <span>Total Endpoints:</span>
                <span className="font-semibold text-white">{apiEndpoints.length}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Active:</span>
                <span className="font-semibold text-green-400">{apiEndpoints.filter(a => a.status === 'healthy').length}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Warnings:</span>
                <span className="font-semibold text-yellow-400">{apiEndpoints.filter(a => a.status === 'warning').length}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Total Requests:</span>
                <span className="font-semibold text-white">{apiEndpoints.reduce((sum, a) => sum + a.requests, 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Active Devices & Security Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card border border-border rounded-lg p-3"
        >
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <i className="fa-solid fa-laptop text-primary text-xs" />
            Thiết bị đang hoạt động
          </h3>
          <div className="space-y-2">
            {activeDevices.map((device, index) => (
              <div key={index} className="p-2 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-foreground text-xs">{device.name}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${device.risk === 'low' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                    {device.risk === 'low' ? 'LOW RISK' : 'MEDIUM RISK'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <div>
                    <span className="text-muted-foreground">ID:</span>
                    <span className="text-foreground ml-2 font-mono">{device.id}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">IP:</span>
                    <span className="text-foreground ml-2 font-mono">{device.ip}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Location:</span>
                    <span className="text-foreground ml-2">{device.location}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Seen:</span>
                    <span className="text-foreground ml-2">{device.lastSeen}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card border border-border rounded-lg p-3"
        >
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <i className="fa-solid fa-triangle-exclamation text-primary text-xs" />
            Cảnh báo bảo mật
          </h3>
          <div className="space-y-2">
            {securityAlerts.map((alert, index) => (
              <div key={index} className="p-2 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${getSeverityColor(alert.severity)}`}>
                    {alert.severity.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{alert.time}</span>
                </div>
                <div className="font-semibold text-foreground text-xs mb-0.5">{alert.type}</div>
                <div className="text-xs text-muted-foreground">
                  Source: <span className="font-mono text-foreground text-[10px]">{alert.source}</span>
                </div>
                <div className="mt-1.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    alert.status === 'active' ? 'bg-red-500/20 text-red-500' :
                    alert.status === 'investigating' ? 'bg-orange-500/20 text-orange-500' :
                    alert.status === 'resolved' ? 'bg-green-500/20 text-green-500' :
                    'bg-emerald-500/20 text-emerald-500'
                  }`}>
                    {alert.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* System Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-lg p-3"
      >
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <i className="fa-solid fa-clipboard-list text-primary text-xs" />
          Tổng quan hệ thống
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-2">Cơ sở hạ tầng</h4>
            <ul className="space-y-1 text-xs">
              <li className="flex justify-between">
                <span className="text-muted-foreground">Tổng số servers:</span>
                <span className="text-foreground font-semibold">6</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Database instances:</span>
                <span className="text-foreground font-semibold">2</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Load balancers:</span>
                <span className="text-foreground font-semibold">2</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">CDN nodes:</span>
                <span className="text-foreground font-semibold">5</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-2">Bảo mật</h4>
            <ul className="space-y-1 text-xs">
              <li className="flex justify-between">
                <span className="text-muted-foreground">Firewall rules:</span>
                <span className="text-foreground font-semibold">142</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">SSL certificates:</span>
                <span className="text-foreground font-semibold">8</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Active sessions:</span>
                <span className="text-foreground font-semibold">1,234</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Blocked IPs:</span>
                <span className="text-foreground font-semibold">89</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-2">Hiệu suất</h4>
            <ul className="space-y-1 text-xs">
              <li className="flex justify-between">
                <span className="text-muted-foreground">Avg response time:</span>
                <span className="text-foreground font-semibold">124ms</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Requests/min:</span>
                <span className="text-foreground font-semibold">8,456</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Cache hit rate:</span>
                <span className="text-foreground font-semibold">94.2%</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Error rate:</span>
                <span className="text-foreground font-semibold">0.08%</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
