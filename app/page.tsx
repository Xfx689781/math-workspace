"use client";
import { useState } from "react";
import Image from "next/image"; // 保留这个用于显示 Logo（可选）

export default function Home() {
  const [formula, setFormula] = useState("");
  const [inspiration, setInspiration] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 调用后端 API 的函数
  const getMathInspiration = async () => {
    if (!formula) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formula }),
      });
      const data = await res.json();
      setInspiration(data.suggestion);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // 这里使用了你原模版中的背景色和居中布局
    <div className="flex flex-col min-h-screen items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center py-20 px-8 bg-white dark:bg-zinc-900 shadow-xl sm:rounded-2xl my-10">
        
        {/* 标题部分 */}
        <h1 className="text-3xl font-bold text-black dark:text-white mb-8 tracking-tight">
          Math Workspace <span className="text-blue-500">MVP</span>
        </h1>

        {/* 公式输入框 */}
        <div className="w-full space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-500">输入 LaTeX 数学公式</label>
            <input
              type="text"
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              placeholder="例如: a^2 + b^2 = c^2"
              className="w-full p-4 rounded-xl border border-zinc-200 bg-zinc-50 text-black outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
            />
          </div>

          {/* 触发按钮 */}
          <button
            onClick={getMathInspiration}
            disabled={isLoading}
            className="w-full h-14 rounded-full bg-black text-white font-semibold transition-transform active:scale-95 hover:bg-zinc-800 dark:bg-white dark:text-black disabled:opacity-50"
          >
            {isLoading ? "思考中..." : "获取可视化灵感"}
          </button>
        </div>

        {/* 结果展示区 */}
        {inspiration && (
          <div className="w-full mt-10 p-6 rounded-2xl bg-blue-50 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-blue-900 dark:text-blue-300 font-bold mb-2 text-sm uppercase tracking-wider">AI 灵感：</h2>
            <p className="text-blue-800 dark:text-blue-100 text-lg leading-relaxed italic">
              "{inspiration}"
            </p>
          </div>
        )}
      </main>
    </div>
  );
}