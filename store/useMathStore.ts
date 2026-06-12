import { create } from 'zustand';

export type MathSubdomain = 'basics' | 'analysis' | 'topology' | 'algebra' | 'discrete';
export type AppMode = 'theorem' | 'problem' | 'latex' | null;
export type Language = 'en' | 'zh';

export interface MathNode {
  id: string;
  type: 'premise' | 'theorem' | 'contradiction';
  label: string;
  position?: { x: number; y: number };
}

export interface MathEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
}

export interface SolveStep {
  id: string;
  stepNumber: number;
  type: 'setup' | 'definition' | 'key-step' | 'calculation' | 'conclusion' | 'insight';
  title: string;
  body: string;
}

export interface VisualConfig {
  type: 'basics-plot' | 'topology-3d' | 'algebra-sequence' | 'analysis-space' | 'discrete-graph' | 'set-diagram' | 'riemann-sum' | 'epsilon-delta' | 'level-set' | 'gram-schmidt';
  subdomainLabel: string;
  data: {
    title: string;
    definition: string;
    example?: string;
    interactiveType: string;
    params?: Record<string, any>;
  };
}

interface MathStore {
  appMode: AppMode;
  language: Language;
  activeDomain: MathSubdomain;
  currentQuery: string;
  isSolving: boolean;
  nodes: MathNode[];
  edges: MathEdge[];
  activeNodeId: string | null;
  visualConfig: VisualConfig | null;
  cachedConfigs: Record<string, any>;
  subdomainLabel: string;
  steps: SolveStep[];
  errorMessage: string | null;

  setAppMode: (mode: AppMode) => void;
  setLanguage: (lang: Language) => void;
  setActiveDomain: (domain: MathSubdomain) => void;
  setQuery: (query: string) => void;
  setCurrentQuery: (query: string) => void;
  setActiveNode: (id: string | null) => void;
  setErrorMessage: (msg: string | null) => void;
  executeSolver: () => Promise<void>;
  setNodes: (nodes: MathNode[]) => void;
  setEdges: (edges: MathEdge[]) => void;
}

export const useMathStore = create<MathStore>((set, get) => ({
  appMode: null,
  language: 'en',
  activeDomain: 'basics',
  currentQuery: '',
  isSolving: false,
  nodes: [],
  edges: [],
  activeNodeId: null,
  visualConfig: null,
  cachedConfigs: {},
  subdomainLabel: 'Telemetry_Idle',
  steps: [],
  errorMessage: null,

  setAppMode: (mode) => set({ appMode: mode }),
  setLanguage: (lang) => set({ language: lang }),
  setActiveDomain: (domain) => set({ activeDomain: domain }),
  setQuery: (query) => set({ currentQuery: query }),
  setCurrentQuery: (query) => set({ currentQuery: query }),
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setErrorMessage: (msg) => set({ errorMessage: msg }),

  setActiveNode: (id) => {
    if (!id) { set({ activeNodeId: null, visualConfig: null }); return; }
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
            interactiveType: cached.interactiveType,
            params: cached.params || {},
          }
        }
      });
    } else {
      set({ activeNodeId: id, visualConfig: null });
    }
  },

  executeSolver: async () => {
    const query = get().currentQuery?.trim();
    if (!query) return;

    // Reject trivially short inputs or obvious non-math phrases before hitting the API
    if (query.length < 3) {
      set({ errorMessage: 'Query too short. Please enter a mathematical theorem or problem.' });
      return;
    }
    const trivial = /^(hi+|hello|hey|thanks?|ok|okay|yes|no|good|nice|cool|wow|lol|test|ping|who|what time|weather|recipe|how are|tell me a joke)[\s!?.]*$/i.test(query);
    if (trivial) {
      set({ errorMessage: 'This workspace is for mathematics only. Try entering a theorem, definition, or problem.' });
      return;
    }

    set({ isSolving: true, nodes: [], edges: [], activeNodeId: null,
          visualConfig: null, cachedConfigs: {}, steps: [], errorMessage: null });

    try {
      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, mode: get().appMode, language: get().language }),
      });

      const blueprint = await response.json();
      if (!response.ok) throw new Error(blueprint.error || 'AI reasoning pipeline failed.');

      const layoutNodes = (blueprint.nodes || []).map((node: MathNode, index: number) => ({
        ...node,
        position: node.position || { x: 100 + index * 250, y: 150 + (index % 2) * 80 }
      }));

      const animatedEdges = (blueprint.edges || []).map((edge: MathEdge) => ({
        ...edge, animated: true, style: { stroke: '#3f3f46', strokeWidth: 1.5 }
      }));

      // Build visualConfig directly from the first entry in visualConfigs.
      // Do NOT rely on node IDs matching visualConfigs keys — Claude often uses
      // different IDs in each, causing a silent mismatch that leaves visualConfig null.
      const configs: Record<string, any> = blueprint.visualConfigs || {};
      const firstKey = Object.keys(configs)[0];
      const cfg = firstKey ? configs[firstKey] : null;
      const subLabel = blueprint.subdomainLabel || 'MATHEMATICS';

      const visualConfig: VisualConfig | null = cfg ? {
        type: cfg.type,
        subdomainLabel: subLabel,
        data: {
          title: cfg.title || '',
          definition: cfg.definition || '',
          example: cfg.example,
          interactiveType: cfg.interactiveType || '',
          params: cfg.params || {},
        },
      } : null;

      set({
        activeDomain: blueprint.activeDomain || 'basics',
        subdomainLabel: subLabel,
        nodes: layoutNodes,
        edges: animatedEdges,
        activeNodeId: firstKey || (layoutNodes[0]?.id ?? null),
        cachedConfigs: configs,
        steps: blueprint.steps || [],
        visualConfig,
        isSolving: false,
      });

    } catch (error: any) {
      console.error('Solver error:', error);
      set({ isSolving: false, errorMessage: error.message || 'Connection failed.' });
    }
  }
}));
