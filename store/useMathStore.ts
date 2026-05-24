import { create } from 'zustand';

// 1️⃣ 严格限定数理空间大类
export type MathSubdomain = 'basics' | 'analysis' | 'topology' | 'algebra' | 'discrete';

// 2️⃣ React Flow 统一节点规约
export interface MathNode {
  id: string;
  type: 'premise' | 'theorem' | 'contradiction';
  label: string;
  position?: { x: number; y: number }; // 兼容 React Flow 的物理坐标
}

// 3️⃣ React Flow 统一边线规约
export interface MathEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
}

// 4️⃣ 主舞台多维几何画布配置规约
export interface VisualConfig {
  type: 'basics-plot' | 'topology-3d' | 'algebra-sequence' | 'analysis-space' | 'discrete-graph';
  subdomainLabel: string;
  data: {
    title: string;
    definition: string;
    example?: string;
    interactiveType: string;
  };
}

// 5️⃣ 状态机全量接口声明
interface MathStore {
  activeDomain: MathSubdomain;
  currentQuery: string;
  isSolving: boolean;
  nodes: MathNode[];
  edges: MathEdge[];
  activeNodeId: string | null;
  visualConfig: VisualConfig | null;
  
  // 核心：拓扑内存网格。缓存当前查询下 AI 推演出的所有节点元数据，防止切换节点时反复请求
  cachedConfigs: Record<string, any>; 
  subdomainLabel: string;

  setActiveDomain: (domain: MathSubdomain) => void;
  setQuery: (query: string) => void;
  setCurrentQuery: (query: string) => void;
  setActiveNode: (id: string | null) => void;
  executeSolver: () => Promise<void>;
  
  // 提供给 React Flow 视窗的画布节点数据同步更新器
  setNodes: (nodes: MathNode[]) => void;
  setEdges: (edges: MathEdge[]) => void;
}

export const useMathStore = create<MathStore>((set, get) => ({
  // 🟢 初始状态
  activeDomain: 'basics',
  currentQuery: '',
  isSolving: false,
  nodes: [],
  edges: [],
  activeNodeId: null,
  visualConfig: null,
  cachedConfigs: {},
  subdomainLabel: 'Telemetry_Idle',

  // 🔵 基础状态原子写入
  setActiveDomain: (domain) => set({ activeDomain: domain }),
  setQuery: (query) => set({ currentQuery: query }),
  setCurrentQuery: (query) => set({ currentQuery: query }),
  
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  
  // 🪐 智能寻轨：点击 React Flow 拓扑图节点时触发
  setActiveNode: (id) => {
    if (!id) {
      set({ activeNodeId: null, visualConfig: null });
      return;
    }

    // 从 AI 吐出来的内存缓存包里直接抓取该节点对应的定义、反例与动效类型
    const cached = get().cachedConfigs[id];
    if (cached) {
      set({
        activeNodeId: id,
        visualConfig: {
          type: cached.type,
          subdomainLabel: get().subdomainLabel,
          data: {
            title: cached.title,
            definition: cached.definition,
            example: cached.example,
            interactiveType: cached.interactiveType
          }
        }
      });
    } else {
      // 降级防御
      set({ activeNodeId: id, visualConfig: null });
    }
  },

  // ⚡ 轰击内核：点击 EXECUTE 按钮时触发的高维数理推演管线
  executeSolver: async () => {
    const query = get().currentQuery?.trim();
    if (!query) return;

    // 唤醒 Loading 遮罩，全量格式化上一轮残存的数据图谱
    set({ 
      isSolving: true, 
      nodes: [], 
      edges: [], 
      activeNodeId: null, 
      visualConfig: null, 
      cachedConfigs: {} 
    });
    
    try {
      // 物理冲击 Next.js App Router 后端 API 路由
      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error('Structural reasoning engine pipeline collapsed.');
      }

      const blueprint = await response.json();

      // 自动为没有给坐标的节点挂载一个基础的层级拓扑位置（防止 React Flow 节点全部叠在 (0,0) 点）
      const layoutNodes = (blueprint.nodes || []).map((node: MathNode, index: number) => ({
        ...node,
        position: node.position || { x: 100 + index * 250, y: 150 + (index % 2) * 80 }
      }));

      // 给所有边线默认追加高级丝滑的虚线动画流
      const animatedEdges = (blueprint.edges || []).map((edge: MathEdge) => ({
        ...edge,
        animated: true,
        style: { stroke: '#3f3f46', strokeWidth: 1.5 }
      }));

      // 全量同步状态入库
      set({
        activeDomain: blueprint.activeDomain || 'basics',
        subdomainLabel: blueprint.subdomainLabel || 'GENERIC LAB',
        nodes: layoutNodes,
        edges: animatedEdges,
        cachedConfigs: blueprint.visualConfigs || {},
        isSolving: false
      });

      // 👑 极致体验：自动激活 AI 推演出的第一个祖先节点，免去用户手动点击节点图的繁琐步子
      if (layoutNodes.length > 0) {
        get().setActiveNode(layoutNodes[0].id);
      }

    } catch (error) {
      console.error('Reasoning Engine Telemetry Error:', error);
      set({ isSolving: false });
    }
  }
}));