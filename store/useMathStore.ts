import { create } from 'zustand';

// 定义支持的大类学科领域（去除了 Abstract 偏见，改为干净纯粹的 algebra）
export type MathSubdomain = 'basics' | 'analysis' | 'topology' | 'algebra' | 'discrete';

// 严格定义 React Flow 需要的有向图节点与边结构
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

// 核心主舞台可视化配置结构体
export interface VisualConfig {
  type: 'basics-plot' | 'analysis-space' | 'topology-3d' | 'algebra-sequence' | 'discrete-graph';
  subdomainLabel: string; // 显式声明精细化的二级学科，如 Real Analysis, Commutative Algebra
  data: any;
}

// 🛡️ 严格规范的 Store 状态接口定义
interface MathStore {
  activeDomain: MathSubdomain;
  currentQuery: string;
  isSolving: boolean;
  nodes: MathNode[];
  edges: MathEdge[];
  activeNodeId: string | null;
  visualConfig: VisualConfig | null;
  
  // 核心控制状态泵
  setActiveDomain: (domain: MathSubdomain) => void;
  setQuery: (query: string) => void;        // ✅ 确保该方法名字物理存在
  setCurrentQuery: (query: string) => void; // ✅ 双向绑定备用名，彻底防御组件端的解构红线
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
  visualConfig: null,

  setActiveDomain: (domain) => set({ activeDomain: domain }),
  
  // 同时实现两个命名，从根源上斩断 Topbar 的类型冲突
  setQuery: (query) => set({ currentQuery: query }),
  setCurrentQuery: (query) => set({ currentQuery: query }),
  
  setActiveNode: (id) => {
    if (!id) {
      set({ activeNodeId: null, visualConfig: null });
      return;
    }

    let config: VisualConfig | null = null;

    // 🧪 场景 A：分析学分支 -> 精确制导二级学科
    if (id.startsWith('an')) {
      const isUniform = id === 'an0';
      config = {
        type: 'analysis-space',
        subdomainLabel: 'REAL ANALYSIS (实分析)',
        data: isUniform ? {
          title: "Uniform Convergence (一致收敛)",
          definition: "A sequence of functions \\{f_n\\} converges uniformly to f on E if: \\forall \\varepsilon > 0, \\exists N \\in \\mathbb{N} \\text{ s.t. } n \\ge N \\implies |f_n(x) - f(x)| < \\varepsilon, \\forall x \\in E.",
          example: "Let f_n(x) = x^n on [0, 1 - \\delta] where 0 < \\delta < 1. It converges uniformly to 0.",
          interactiveType: 'epsilon-tube'
        } : {
          title: "Continuity Preservation Theorem",
          definition: "If f_n \\to f uniformly on E, and each f_n is continuous at x_0, then the limit function f is continuous at x_0.",
          proof: "Via 3-\\varepsilon bound: |f(x) - f(x_0)| \\le |f(x) - f_n(x)| + |f_n(x) - f_n(x_0)| + |f_n(x_0) - f(x_0)|.",
          interactiveType: 'three-epsilon-slider'
        }
      };
    } 
    // 🧪 场景 B：代数学分支 -> 精确制导二级学科
    else if (id.startsWith('al')) {
      config = {
        type: 'algebra-sequence',
        subdomainLabel: 'COMMUTATIVE ALGEBRA (交换代数 / 同调)',
        data: {
          title: "Short Exact Sequence (短正合序列)",
          definition: "A sequence of R-modules 0 \\xrightarrow{} A \\xrightarrow{f} B \\xrightarrow{g} C \\xrightarrow{} 0 is exact if f is injective, g is surjective, and \\operatorname{Im}(f) = \\operatorname{Ker}(g).",
          example: "The prototypical non-split sequence: 0 \\to \\mathbb{Z} \\xrightarrow{\\times 2} \\mathbb{Z} \\to \\mathbb{Z}/2\\mathbb{Z} \\to 0."
        }
      };
    }
    // 🧪 场景 C：拓扑学分支 -> 精确制导二级学科
    else if (id.startsWith('t')) {
      config = {
        type: 'topology-3d',
        subdomainLabel: 'POINT-SET TOPOLOGY (点集拓扑)',
        data: {
          title: "T2 Hausdorff Space Separation",
          definition: "\\forall x, y \\in X \\text{ with } x \\neq y, \\exists \\text{ open sets } U, V \\text{ s.t. } x \\in U, y \\in V \\text{ and } U \\cap V = \\emptyset."
        }
      };
    }

    set({ activeNodeId: id, visualConfig: config });
  },

  executeSolver: async () => {
    const query = get().currentQuery.trim().toLowerCase();
    if (!query) return;

    set({ isSolving: true, nodes: [], edges: [], activeNodeId: null, visualConfig: null });
    
    // 模拟严格推演引擎的计算阻尼感
    await new Promise((resolve) => setTimeout(resolve, 600));

    // 智能语义大类映射路由
    if (query.includes('separation') || query.includes('axiom') || query.includes('topology')) {
      set({ activeDomain: 'topology' });
    } else if (query.includes('convergence') || query.includes('uniform') || query.includes('continuity') || query.includes('analysis')) {
      set({ activeDomain: 'analysis' });
    } else if (query.includes('group') || query.includes('ring') || query.includes('exact') || query.includes('algebra')) {
      set({ activeDomain: 'algebra' });
    } else {
      set({ activeDomain: 'basics' });
    }

    const currentDomain = get().activeDomain;

    // 🚀 为右侧栏 Inspector 量身定制的垂直有向无环图（Topological DAG）
    if (currentDomain === 'analysis') {
      set({
        nodes: [
          { id: 'an0', type: 'premise', label: 'Def: Uniform Convergence' },
          { id: 'an1', type: 'theorem', label: 'Theorem: Cauchy Criterion' },
          { id: 'an2', type: 'theorem', label: 'Continuity Preservation' }
        ],
        edges: [
          { id: 'ae1', source: 'an0', target: 'an1', label: 'Equiv' },
          { id: 'ae2', source: 'an1', target: 'an2', label: 'Guarantees' }
        ],
        isSolving: false
      });
    } else if (currentDomain === 'algebra') {
      set({
        nodes: [
          { id: 'al0', type: 'premise', label: 'Def: Module Morphism' },
          { id: 'al1', type: 'theorem', label: 'Exactness Condition' }
        ],
        edges: [{ id: 'ale1', source: 'al0', target: 'al1' }],
        isSolving: false
      });
    } else {
      set({
        nodes: [
          { id: 't0', type: 'premise', label: 'T0 Kolmogorov Space' },
          { id: 't2', type: 'theorem', label: 'T2 Hausdorff Separation' }
        ],
        edges: [{ id: 'e1', source: 't0', target: 't2' }],
        isSolving: false
      });
    }

    // 自动高亮首节点，激活正中心主舞台的几何图景
    const firstNode = get().nodes[0];
    if (firstNode) get().setActiveNode(firstNode.id);
  }
}));