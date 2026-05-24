import { create } from 'zustand';

export type MathSubdomain = 'basics' | 'analysis' | 'topology' | 'algebra' | 'discrete';

export interface MathNode {
  id: string;
  type: 'premise' | 'theorem' | 'contradiction';
  label: string;
}

export interface MathEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

// ⚙️ 抽象出 visualConfig 的类型结构
export interface VisualConfig {
  type: 'basics-plot' | 'topology-3d' | 'algebra-sequence' | 'analysis-space' | 'discrete-graph';
  data: any;
}

interface MathStore {
  activeDomain: MathSubdomain;
  currentQuery: string;
  isSolving: boolean;
  nodes: MathNode[];
  edges: MathEdge[];
  activeNodeId: string | null;
  // 【位置 1】在这里声明 visualConfig 类型，允许为 null
  visualConfig: VisualConfig | null; 
  
  setActiveDomain: (domain: MathSubdomain) => void;
  setQuery: (query: string) => void;
  setActiveNode: (id: string | null) => void;
  executeSolver: () => Promise<void>;
}

export const useMathStore = create<MathStore>((set, get) => ({
  activeDomain: 'basics',
  currentQuery: '',
  isSolving: false,
  nodes: [],
  edges: [],
  activeNodeId: null,
  // 【位置 2】在这里给定初始状态为 null，防止初始进入时报错
  visualConfig: null, 

  setActiveDomain: (domain) => set({ activeDomain: domain }),
  setQuery: (query) => set({ currentQuery: query }),
  
  // 🚀 升级此处的 setActiveNode，让它在切换节点时，同步更新右侧遥测配置
  setActiveNode: (id) => {
    if (!id) {
      set({ activeNodeId: null, visualConfig: null });
      return;
    }

    // 根据当前点击的节点 ID，定制化下发渲染配置
    let config: VisualConfig | null = null;

    if (id.startsWith('t')) {
      // 拓扑学节点 (separation axioms) -> 激活 3D 流形渲染
      config = {
        type: 'topology-3d',
        data: { nodeId: id, info: 'Geometric manifestation of separation property' }
      };
    } else {
      // 其他领域通用兜底处理
      config = {
        type: 'basics-plot',
        data: { nodeId: id, expression: 'f(x, y) = sin(x)cos(y)' }
      };
    }

    set({ activeNodeId: id, visualConfig: config });
  },

  executeSolver: async () => {
    const query = get().currentQuery.trim().toLowerCase();
    if (!query) return;

    // 开始求解时清空状态
    set({ isSolving: true, nodes: [], edges: [], activeNodeId: null, visualConfig: null });

    // 模拟一段极具学术质感的延迟阻尼，提升系统心跳感
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // 如果用户搜索了拓扑学的分离公理
    if (query.includes('separation') || query.includes('axiom')) {
      set({
        activeDomain: 'topology',
        nodes: [
          { id: 't0', type: 'premise', label: 'T0 (Kolmogorov): Points are topologically distinguishable.' },
          { id: 't1', type: 'premise', label: 'T1 (Fréchet): Every singleton subset is closed.' },
          { id: 't2', type: 'theorem', label: 'T2 (Hausdorff): Distinct points have disjoint neighborhoods.' },
          { id: 't3', type: 'theorem', label: 'T3 (Regular Hausdorff): Disjoint point and closed set separation.' },
          { id: 't4', type: 'contradiction', label: 'Zorn\'s Lemma Conflict: Non-Hausdorff Compactification failure.' }
        ],
        edges: [
          { id: 'e1', source: 't0', target: 't2', label: 'Strengthens' },
          { id: 'e2', source: 't1', target: 't2', label: 'Enforces' },
          { id: 'e3', source: 't2', target: 't3', label: 'Implies' },
          { id: 'e4', source: 't3', target: 't4', label: 'Boundary Test' }
        ],
        isSolving: false
      });
    } else {
      // 通用兜底学术有向图
      set({
        nodes: [
          { id: 'n1', type: 'premise', label: `Initial Structure: Given ${get().currentQuery}` },
          { id: 'n2', type: 'theorem', label: 'Morphism Matrix mapping into stable Hilbert Space.' },
          { id: 'n3', type: 'contradiction', label: 'Trivial Nullspace collapsed under boundary conditions.' }
        ],
        edges: [
          { id: 'e1', source: 'n1', target: 'n2', label: 'Map' },
          { id: 'e2', source: 'n2', target: 'n3', label: 'Fails if' }
        ],
        isSolving: false
      });
    }
  }
}));