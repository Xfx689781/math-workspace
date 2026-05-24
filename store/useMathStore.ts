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

    let config: any = null;

    // 🧪 场景 A：一致收敛 (Uniform Convergence) 节点的详细几何化与形式化配置
    if (id === 'an0') {
      config = {
        type: 'analysis-space',
        data: {
          title: "Uniform Convergence (一致收敛)",
          definition: "A sequence of functions \\{f_n\\} converges uniformly to f on E if: \\forall \\varepsilon > 0, \\exists N \\in \\mathbb{N} \\text{ s.t. } n \\ge N \\implies |f_n(x) - f(x)| < \\varepsilon, \\forall x \\in E.",
          example: "Let f_n(x) = x^n on [0, 1 - \\delta] where 0 < \\delta < 1. It converges uniformly to 0. However, on [0, 1], the convergence is strictly pointwise but NOT uniform.",
          // 💡 传递给可视化引擎的交互参数：在右侧动态绘制 \\varepsilon-tube 挤压带！
          interactiveType: 'epsilon-tube',
          initialEpsilon: 0.25,
          functionType: 'x_power_n'
        }
      };
    } 
    // 🧪 场景 B：连续性保持定理的严格证明
    else if (id === 'an2') {
      config = {
        type: 'analysis-space',
        data: {
          title: "Continuity Preservation Theorem",
          definition: "If f_n \\to f uniformly on E, and each f_n is continuous at x_0, then the limit function f is continuous at x_0.",
          proof: "By 3-\\varepsilon argument: |f(x) - f(x_0)| \\le |f(x) - f_n(x)| + |f_n(x) - f_n(x_0)| + |f_n(x_0) - f(x_0)|. Choose N such that the 1st and 3rd terms < \\varepsilon/3 via uniform convergence, then choose \\delta via continuity of f_N.",
          interactiveType: 'three-epsilon-slider'
        }
      };
    }
    // 🧪 场景 C：分离公理 (T2 Hausdorff)
    else if (id.startsWith('t')) {
      config = {
        type: 'topology-3d',
        data: {
          title: "T2 Hausdorff Space Separation",
          definition: "\\forall x, y \\in X \\text{ with } x \\neq y, \\exists \\text{ open sets } U, V \\text{ s.t. } x \\in U, y \\in V \\text{ and } U \\cap V = \\emptyset.",
          interactiveType: 'manifold-split'
        }
      };
    }

    set({ activeNodeId: id, visualConfig: config });
  },

  executeSolver: async () => {
    const query = get().currentQuery.trim().toLowerCase();
    if (!query) return;

    set({ isSolving: true, nodes: [], edges: [], activeNodeId: null, visualConfig: null });
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 🚀 语义路由器：根据输入的学术范畴，强行重定向到正确的 Subdomain
    if (query.includes('separation') || query.includes('axiom') || query.includes('topology') || query.includes('manifold')) {
      set({ activeDomain: 'topology' });
    } else if (query.includes('convergence') || query.includes('uniform') || query.includes('continuity') || query.includes('space')) {
      set({ activeDomain: 'analysis' }); // 确保 uniform convergence 自动跳入分析学面板！
    } else if (query.includes('group') || query.includes('ring') || query.includes('morphism') || query.includes('sequence')) {
      set({ activeDomain: 'algebra' });
    } else {
      set({ activeDomain: 'basics' });
    }

    // 重新获取已经通过语义路由更新过的领域
    const currentDomain = get().activeDomain;

    // 🚀 根据重定向后的正确学科，下发具有硬核几何/物理直观的科学计算节点，不再是虚无的空话
    if (currentDomain === 'analysis') {
      set({
        nodes: [
          { id: 'an0', type: 'premise', label: 'Definition: Uniform Convergence on E.' },
          { id: 'an1', type: 'theorem', label: 'Theorem: Cauchy Criterion for Uniform Convergence.' },
          { id: 'an2', type: 'theorem', label: 'Continuity Preservation: Limit function f is continuous.' }
        ],
        edges: [
          { id: 'ae1', source: 'an0', target: 'an1', label: 'Equivalency' },
          { id: 'ae2', source: 'an1', target: 'an2', label: 'Guarantees' }
        ],
        isSolving: false
      });
    } else if (currentDomain === 'topology') {
      set({
        nodes: [
          { id: 't0', type: 'premise', label: 'T0 (Kolmogorov): Points are topologically distinguishable.' },
          { id: 't2', type: 'theorem', label: 'T2 (Hausdorff): Distinct points have disjoint neighborhoods.' },
        ],
        edges: [{ id: 'e1', source: 't0', target: 't2', label: 'Strengthens' }],
        isSolving: false
      });
    } else {
      // 兜底
      set({
        nodes: [{ id: 'b0', type: 'premise', label: `Locus: ${get().currentQuery}` }],
        edges: [],
        isSolving: false
      });
    }
  }
}));