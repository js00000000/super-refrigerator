"use client";

import { useState } from "react";
import { RefrigeratorItem } from "@/types/refrigerator";
import { useCookingStore } from "@/store/useCookingStore";
import { supabase } from "@/lib/supabase";

interface CookingPotProps {
  items: RefrigeratorItem[];
  onItemsConsumed: (ids: string[]) => void;
  updateItemAmount: (id: string, amount: string) => void;
  /** When true, renders as a mobile bottom sheet instead of a sidebar card. */
  isMobileSheet?: boolean;
}

/* ─── Spinner SVG ────────────────────────────────────────────────────────── */
function Spinner() {
  return (
    <svg className="animate-spin-slow w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3.5" strokeOpacity="0.2" />
      <path fill="currentColor" fillOpacity="0.9" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

/* ─── Stepper control ────────────────────────────────────────────────────── */
function Stepper({
  label, value, min, max, color, onDecrement, onIncrement,
}: {
  label: string; value: number; min: number; max: number;
  color: string; onDecrement: () => void; onIncrement: () => void;
}) {
  return (
    <div className="flex-1 space-y-1.5">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
      <div className="flex items-center gap-2 bg-white/70 rounded-2xl p-2 border border-gray-100/80">
        <button
          type="button"
          onClick={onDecrement}
          disabled={value <= min}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-30 transition-all active:scale-90 font-bold text-lg"
        >
          −
        </button>
        <span className={`flex-1 text-center text-xl font-black ${color}`}>{value}</span>
        <button
          type="button"
          onClick={onIncrement}
          disabled={value >= max}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-30 transition-all active:scale-90 font-bold text-lg"
        >
          +
        </button>
      </div>
    </div>
  );
}

/* ─── CookerBody (shared UI for sidebar and bottom sheet) ─────────────────── */
function CookerBody({
  items,
  updateItemAmount,
  onItemsConsumed,
}: Pick<CookingPotProps, "items" | "updateItemAmount" | "onItemsConsumed">) {
  const {
    cookingPot, dishCount, peopleCount, isGenerating, aiError,
    setDishCount, setPeopleCount, removeFromPot, updateConsumeAll,
    setGeneratedDishes, setIsGenerating, setAiError, clearPot,
  } = useCookingStore();

  const generateRecipes = async () => {
    if (cookingPot.length === 0) return;
    setIsGenerating(true); setAiError(""); setGeneratedDishes([]);
    const selectedItems = cookingPot.map((p) => items.find((i) => i.id === p.itemId)).filter(Boolean);
    try {
      const res = await fetch("/api/generate-recipe", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: selectedItems, dishCount, peopleCount }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setGeneratedDishes(data.dishes || []);
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : "發生了一些錯誤。");
    } finally { setIsGenerating(false); }
  };

  const generateAllRecipes = async () => {
    if (items.length === 0) return;
    setIsGenerating(true); setAiError(""); setGeneratedDishes([]);
    try {
      const res = await fetch("/api/generate-recipe", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, dishCount, peopleCount, isAllItems: true }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setGeneratedDishes(data.dishes || []);
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : "發生了一些錯誤。");
    } finally { setIsGenerating(false); }
  };

  const finishCooking = async () => {
    const idsToRemove = cookingPot.filter((p) => p.consumeAll).map((p) => p.itemId);
    if (idsToRemove.length > 0) {
      const { error } = await supabase.from("refrigerator_items").delete().in("id", idsToRemove);
      if (error) { console.error("Error removing consumed items:", error); return; }
      onItemsConsumed(idsToRemove);
    }
    clearPot();
  };

  return (
    <div className="space-y-5">
      {/* Selected ingredients */}
      <div className="space-y-2">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">已選食材</p>
        {cookingPot.length === 0 ? (
          <div className="text-center py-5 px-4 rounded-2xl bg-gray-50/70 border border-dashed border-gray-200/80 text-gray-400 text-sm font-medium">
            點擊食材上的 🍳 加入
          </div>
        ) : (
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {cookingPot.map((selection) => {
              const item = items.find((i) => i.id === selection.itemId);
              if (!item) return null;
              return (
                <div key={item.id} className="selection-chip !flex !flex-row !items-start !justify-between !w-full !rounded-xl !px-3 !py-2 gap-2">
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-bold text-gray-800 text-sm truncate">{item.name}</span>
                    {item.amount && (
                      <input
                        type="text"
                        value={item.amount}
                        onChange={(e) => updateItemAmount(item.id, e.target.value)}
                        className="text-xs text-emerald-600 bg-transparent border-b border-dashed border-emerald-200 focus:border-emerald-500 outline-none w-20 mt-0.5"
                      />
                    )}
                    {!item.amount && (
                      <label className="flex items-center gap-2 mt-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selection.consumeAll}
                          onChange={(e) => updateConsumeAll(item.id, e.target.checked)}
                          className="w-3.5 h-3.5 rounded accent-emerald-500"
                        />
                        <span className="text-[11px] text-gray-500">全部用完？</span>
                      </label>
                    )}
                  </div>
                  <button
                    onClick={() => removeFromPot(item.id)}
                    className="text-gray-300 hover:text-red-400 p-1 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0 mt-0.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Steppers */}
      <div className="flex gap-3">
        <Stepper label="菜餚數" value={dishCount} min={1} max={5} color="text-emerald-600"
          onDecrement={() => setDishCount(Math.max(1, dishCount - 1))}
          onIncrement={() => setDishCount(Math.min(5, dishCount + 1))}
        />
        <Stepper label="用餐人數" value={peopleCount} min={1} max={10} color="text-blue-600"
          onDecrement={() => setPeopleCount(Math.max(1, peopleCount - 1))}
          onIncrement={() => setPeopleCount(Math.min(10, peopleCount + 1))}
        />
      </div>

      {/* Error */}
      {aiError && (
        <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 font-medium">{aiError}</div>
      )}

      {/* Buttons */}
      <div className="space-y-2.5">
        {cookingPot.length > 0 && (
          <button
            onClick={generateRecipes}
            disabled={isGenerating}
            className="btn-aurora w-full py-3.5 rounded-2xl text-white font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating && cookingPot.length > 0
              ? <><Spinner /><span>思考中...</span></>
              : <><span>🍳</span><span>生成選中食材食譜</span></>}
          </button>
        )}

        <button
          onClick={generateAllRecipes}
          disabled={isGenerating || items.length === 0}
          className="w-full py-3.5 rounded-2xl font-bold text-sm text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100 border-2 border-emerald-200/80 hover:border-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.97] flex items-center justify-center gap-2"
        >
          {isGenerating && cookingPot.length === 0
            ? <><Spinner /><span>正在分析冰箱...</span></>
            : <><span>✨</span><span>一鍵生成食譜 (全冰箱)</span></>}
        </button>

        {cookingPot.length > 0 && (
          <>
            <button
              onClick={finishCooking}
              className="w-full py-2.5 rounded-2xl text-sm font-bold text-amber-700 bg-amber-50/80 hover:bg-amber-100 border border-amber-200/80 transition-all active:scale-[0.97] flex items-center justify-center gap-2"
            >
              ✅ 完成並清空已用食材
            </button>
            <p className="text-[10px] text-gray-300 text-center font-semibold uppercase tracking-wider">
              庫存將根據勾選框更新
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function CookingPot({
  items, onItemsConsumed, updateItemAmount, isMobileSheet = false,
}: CookingPotProps) {
  const { cookingPot } = useCookingStore();
  const [mobileExpanded, setMobileExpanded] = useState(false);

  /* ── Desktop Sidebar ─────────────────────────────────────────────────── */
  if (!isMobileSheet) {
    return (
      <div className="glass rounded-3xl border border-white/60 overflow-hidden sticky top-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="text-base">🔥</span>
            </div>
            <div>
              <h2 className="text-base font-black text-white leading-tight">烹飪環節</h2>
              <p className="text-emerald-100 text-xs font-medium">選擇食材並生成食譜</p>
            </div>
          </div>
          {cookingPot.length > 0 && (
            <div className="mt-3">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/20 text-white">
                {cookingPot.length} 項已選
              </span>
            </div>
          )}
        </div>
        <div className="p-5">
          <CookerBody items={items} updateItemAmount={updateItemAmount} onItemsConsumed={onItemsConsumed} />
        </div>
      </div>
    );
  }

  /* ── Mobile Bottom Sheet ─────────────────────────────────────────────── */
  return (
    <>
      {/* Collapsed bar */}
      {!mobileExpanded && (
        <div
          className="bottom-sheet animate-bottom-sheet px-4 py-3 flex items-center justify-between cursor-pointer"
          onClick={() => setMobileExpanded(true)}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
              <span className="text-sm">🔥</span>
            </div>
            <div>
              <p className="text-sm font-black text-gray-900">烹飪環節</p>
              <p className="text-[11px] text-gray-400 font-medium">
                {cookingPot.length > 0 ? `${cookingPot.length} 項已選 · 點擊展開` : "點擊展開 · 選擇食材生成食譜"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {cookingPot.length > 0 && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
                {cookingPot.length}
              </span>
            )}
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </div>
        </div>
      )}

      {/* Expanded overlay */}
      {mobileExpanded && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileExpanded(false)}
          />
          <div className="bottom-sheet z-40 animate-bottom-sheet max-h-[80vh] overflow-y-auto">
            {/* Handle + header */}
            <div className="flex flex-col items-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-200 mb-3" />
              <div className="w-full flex items-center gap-3 px-4 pb-3 border-b border-gray-100">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                  <span className="text-base">🔥</span>
                </div>
                <div>
                  <p className="font-black text-gray-900">烹飪環節</p>
                  <p className="text-xs text-gray-400">選擇食材並生成食譜</p>
                </div>
                <button
                  type="button"
                  className="ml-auto p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors"
                  onClick={() => setMobileExpanded(false)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4">
              <CookerBody items={items} updateItemAmount={updateItemAmount} onItemsConsumed={onItemsConsumed} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
