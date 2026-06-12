"use client";
import Landing from '@/components/landing';
import Topbar from '@/components/layout/topbar';
import DynamicVisualizer from '@/components/visualizer/dynamic';
import { useMathStore } from '@/store/useMathStore';

export default function AxiomStudioPage() {
  const appMode = useMathStore(s => s.appMode);

  if (!appMode) return <Landing />;

  return (
    <div className="w-screen h-screen bg-[#030303] text-zinc-300 flex flex-col overflow-hidden font-sans selection:bg-blue-500/30">
      <Topbar />
      <main className="flex-1 w-full overflow-hidden relative bg-[#020203]">
        <DynamicVisualizer />
      </main>
    </div>
  );
}
