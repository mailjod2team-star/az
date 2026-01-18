import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Background,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Platform options
const PLATFORMS = [
  { value: 'facebook', label: 'Facebook', icon: 'fa-brands fa-facebook' },
  { value: 'instagram', label: 'Instagram', icon: 'fa-brands fa-instagram' },
  { value: 'tiktok', label: 'TikTok', icon: 'fa-brands fa-tiktok' },
  { value: 'shopee', label: 'Shopee', icon: 'fa-solid fa-bag-shopping' },
  { value: 'youtube', label: 'YouTube', icon: 'fa-brands fa-youtube' },
  { value: 'twitter', label: 'Twitter/X', icon: 'fa-brands fa-twitter' },
  { value: 'telegram', label: 'Telegram', icon: 'fa-brands fa-telegram' },
];

// Node types for workflow
const NODE_TYPES = [
  { id: 'trigger', label: 'Trigger', icon: 'fa-solid fa-bolt', color: '#3b82f6', description: 'Bắt đầu workflow' },
  { id: 'action', label: 'Action', icon: 'fa-solid fa-gear', color: '#22c55e', description: 'Thực hiện hành động' },
  { id: 'condition', label: 'Condition', icon: 'fa-solid fa-question-circle', color: '#eab308', description: 'Kiểm tra điều kiện' },
  { id: 'filter', label: 'Filter', icon: 'fa-solid fa-filter', color: '#a855f7', description: 'Lọc dữ liệu' },
  { id: 'delay', label: 'Delay', icon: 'fa-solid fa-clock', color: '#f97316', description: 'Tạm dừng' },
  { id: 'webhook', label: 'Webhook', icon: 'fa-solid fa-link', color: '#ec4899', description: 'Gọi API' },
  { id: 'notification', label: 'Notification', icon: 'fa-solid fa-bell', color: '#ef4444', description: 'Gửi thông báo' },
  { id: 'database', label: 'Database', icon: 'fa-solid fa-database', color: '#6366f1', description: 'Lưu dữ liệu' },
];

let nodeId = 0;

const WorkflowBuilder = () => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState('facebook');
  const [selectedNodes, setSelectedNodes] = useState([]);

  const onConnect = useCallback(
    (params) => {
      // Find source node to get its color
      const sourceNode = nodes.find(n => n.id === params.source);
      const edgeColor = sourceNode?.data?.color || '#10b981';
      
      setEdges((eds) => addEdge({ 
        ...params, 
        animated: false, 
        style: { stroke: edgeColor, strokeWidth: 2 }
      }, eds));
    },
    [setEdges, nodes]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const nodeInfo = NODE_TYPES.find((n) => n.id === type);
      const newNode = {
        id: `${type}-${nodeId++}`,
        type: 'default',
        position,
        data: {
          label: (
            <div className="flex flex-row items-center justify-center gap-2">
              <i className={`${nodeInfo.icon} text-lg`} />
              <div className="text-[10px] font-semibold whitespace-nowrap">{nodeInfo.label}</div>
            </div>
          ),
          color: nodeInfo.color,
        },
        style: {
          background: nodeInfo.color,
          color: 'white',
          border: '2px solid rgba(255,255,255,0.3)',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '12px',
          fontWeight: 'bold',
          minWidth: '80px',
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleSave = () => {
    const workflow = {
      platform: selectedPlatform,
      nodes: nodes,
      edges: edges,
      timestamp: new Date().toISOString(),
    };
    console.log('Saving workflow:', workflow);
    // TODO: Implement save to backend
    alert('Workflow đã được lưu!');
  };

  const handleDelete = () => {
    if (selectedNodes.length === 0) return;
    
    setNodes((nds) => nds.filter((node) => !selectedNodes.includes(node.id)));
    setEdges((eds) => eds.filter((edge) => 
      !selectedNodes.includes(edge.source) && !selectedNodes.includes(edge.target)
    ));
    setSelectedNodes([]);
  };

  const handleDeleteAll = () => {
    if (nodes.length === 0) return;
    
    if (window.confirm('Bạn có chắc muốn xóa tất cả nodes?')) {
      setNodes([]);
      setEdges([]);
      setSelectedNodes([]);
    }
  };

  const onSelectionChange = useCallback((params) => {
    setSelectedNodes(params.nodes.map(n => n.id));
  }, []);

  return (
    <div className="flex h-full bg-gray-900/50 backdrop-blur-sm">
      {/* Main Canvas */}
      <div className="flex-1 relative" ref={reactFlowWrapper}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onSelectionChange={onSelectionChange}
            defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
            minZoom={0.1}
            maxZoom={2}
            fitView
            className="bg-gray-950/80"
            proOptions={{ hideAttribution: true }}
            nodesDraggable={true}
            elementsSelectable={true}
            selectNodesOnDrag={false}
            panOnDrag={true}
            connectionMode="loose"
          >
            <Background color="#10b981" gap={16} size={1} />
            <MiniMap
              className="bg-gray-800 border-gray-700"
              nodeColor={(node) => {
                return node.data?.color || '#10b981';
              }}
            />
          </ReactFlow>
        </ReactFlowProvider>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 bg-gray-800/95 backdrop-blur-md border-l border-gray-700 flex flex-col shadow-2xl">
        {/* Platform Selector */}
        <div className="p-4 border-b border-gray-700">
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            <i className="fa-solid fa-globe mr-2 text-primary" />
            Chọn nền tảng
          </label>
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="w-full bg-gray-900 text-white border border-gray-600 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            data-testid="platform-selector"
          >
            {PLATFORMS.map((platform) => (
              <option key={platform.value} value={platform.value}>
                {platform.label}
              </option>
            ))}
          </select>
        </div>

        {/* Nodes List */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <i className="fa-solid fa-cube text-primary" />
            Kéo thả Nodes
          </h3>
          <div className="space-y-2">
            {NODE_TYPES.map((nodeType) => (
              <div
                key={nodeType.id}
                draggable
                onDragStart={(event) => onDragStart(event, nodeType.id)}
                className="cursor-grab active:cursor-grabbing p-2 rounded-lg border-2 border-gray-700 hover:border-primary transition-all hover:scale-105 hover:shadow-lg"
                style={{ backgroundColor: nodeType.color }}
                data-testid={`node-${nodeType.id}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <div className="text-white font-semibold text-xs">{nodeType.label}</div>
                    <div className="text-[10px] text-gray-200 mt-0.5">{nodeType.description}</div>
                  </div>
                  <i className={`${nodeType.icon} text-base text-white`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-gray-700 bg-gray-900/50">
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 bg-primary hover:bg-primary/80 text-white px-2 py-1.5 rounded-md font-semibold text-[10px] flex items-center justify-center gap-1 transition-all"
              data-testid="save-workflow-button"
            >
              <i className="fa-solid fa-save text-xs" />
              Lưu
            </button>
            
            <button
              onClick={handleDelete}
              disabled={selectedNodes.length === 0}
              className={`flex-1 px-2 py-1.5 rounded-md font-semibold text-[10px] flex items-center justify-center gap-1 transition-all ${
                selectedNodes.length === 0
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
              data-testid="delete-node-button"
            >
              <i className="fa-solid fa-trash text-xs" />
              Xóa
            </button>
            
            <button
              onClick={handleDeleteAll}
              disabled={nodes.length === 0}
              className={`flex-1 px-2 py-1.5 rounded-md font-semibold text-[10px] flex items-center justify-center gap-1 transition-all ${
                nodes.length === 0
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
              data-testid="delete-all-button"
            >
              <i className="fa-solid fa-trash-can text-xs" />
              Tất cả
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowBuilder;
