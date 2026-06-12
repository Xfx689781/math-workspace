"use client";
import Topbar from '@/components/layout/topbar';
import DynamicVisualizer from '@/components/visualizer/dynamic';
import { useMathStore } from '@/store/useMathStore';

export default function AxiomStudioPage() {
  const { visualConfig } = useMathStore();

  return (
    <div className="w-screen h-screen bg-[#030303] text-zinc-300 flex flex-col overflow-hidden font-sans selection:bg-blue-500/30">
      <Topbar />
      <main className="flex-1 w-full overflow-hidden relative bg-[#020203]">
        {visualConfig && (
          <div className="absolute top-4 left-6 z-10 pointer-events-none">
            <span className="text-[9px] font-mono tracking-[0.25em] text-blue-500/80 bg-blue-950/30 border border-blue-900/30 px-2.5 py-1 rounded-md uppercase backdrop-blur-md">
              {visualConfig.subdomainLabel}
            </span>
          </div>
        )}
        <DynamicVisualizer />
      </main>
    </div>
  );
}