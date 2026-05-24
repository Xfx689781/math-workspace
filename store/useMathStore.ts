import { create } from 'zustand';

// 对应你的模块结构：basics 涵盖 Fundamentals/Calculus/Multivariable
export type MathSubdomain = 'basics' | 'analysis' | 'topology' | 'algebra' | 'discrete';

export interface MathNode {
  id: string;
  label: string;
  type: 'premise' | 'theorem' | 'contradiction';
  latex?: string;
}

export interface MathEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface VisualConfig {
  type: 'basics-plot' | 'analysis-stream' | 'topology-3d' | 'algebra-diagram' | 'discrete-combinatorics' | 'placeholder';
  data: any;
}

interface MathState {
  activeDomain: MathSubdomain;
  currentQuery: string;
  nodes: MathNode[];
  edges: MathEdge[];
  visualConfig: VisualConfig;
  isSolving: boolean;
  activeNodeId: string | null;
  setActiveDomain: (domain: MathSubdomain) => void;
  setQuery: (q: string) => void;
  setActiveNode: (id: string | null) => void;
  executeSolver: () => Promise<void>;
}

export const useMathStore = create<MathState>((set, get) => ({
  activeDomain: 'basics',
  currentQuery: '',
  nodes: [],
  edges: [],
  visualConfig: { type: 'placeholder', data: {} },
  isSolving: false,
  activeNodeId: null,
  setActiveDomain: (domain) => set({ activeDomain: domain, nodes: [], edges: [], activeNodeId: null, visualConfig: { type: 'placeholder', data: {} } }),
  setQuery: (q) => set({ currentQuery: q }),
  setActiveNode: (id) => set({ activeNodeId: id }),
  executeSolver: async () => {
    const { currentQuery, activeDomain } = get();
    if (!currentQuery) return;
    set({ isSolving: true });

    try {
      const res = await fetch('/app/api/parse', { // 根据你的路径微调
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: currentQuery, domain: activeDomain }),
      });
      const data = await res.json();
      set({ 
        nodes: data.nodes, 
        edges: data.edges, 
        visualConfig: data.visualConfig,
        isSolving: false 
      });
    } catch (err) {
      console.error("Solver Error:", err);
      set({ isSolving: false });
    }
  },
}));