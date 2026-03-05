"use client";

import { RefrigeratorItem } from "@/types/refrigerator";
import { useCookingStore } from "@/store/useCookingStore";
import { supabase } from "@/lib/supabase";

interface CookingPotProps {
  items: RefrigeratorItem[];
  onItemsConsumed: (ids: string[]) => void;
  updateItemAmount: (id: string, amount: string) => void;
}

export default function CookingPot({ items, onItemsConsumed, updateItemAmount }: CookingPotProps) {
  const {
    cookingPot,
    dishCount,
    peopleCount,
    isGenerating,
    aiError,
    setDishCount,
    setPeopleCount,
    removeFromPot,
    updateConsumeAll,
    setGeneratedDishes,
    setIsGenerating,
    setAiError,
    clearPot
  } = useCookingStore();

  const generateRecipes = async () => {
    if (cookingPot.length === 0) return;
    
    setIsGenerating(true);
    setAiError("");
    setGeneratedDishes([]);
    
    const selectedItems = cookingPot.map(p => items.find(i => i.id === p.itemId)).filter(Boolean);
    
    try {
      const res = await fetch("/api/generate-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: selectedItems, dishCount, peopleCount }),
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setGeneratedDishes(data.dishes || []);
    } catch (err: any) {
      setAiError(err.message || "發生了一些錯誤。");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAllRecipes = async () => {
    if (items.length === 0) return;
    
    setIsGenerating(true);
    setAiError("");
    setGeneratedDishes([]);
    
    try {
      const res = await fetch("/api/generate-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, dishCount, peopleCount, isAllItems: true }),
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setGeneratedDishes(data.dishes || []);
    } catch (err: any) {
      setAiError(err.message || "發生了一些錯誤。");
    } finally {
      setIsGenerating(false);
    }
  };

  const finishCooking = async () => {
    const idsToRemove = cookingPot
      .filter(p => p.consumeAll)
      .map(p => p.itemId);
    
    if (idsToRemove.length > 0) {
      const { error } = await supabase
        .from("refrigerator_items")
        .delete()
        .in("id", idsToRemove);

      if (error) {
        console.error("Error removing consumed items:", error);
        return;
      }
      onItemsConsumed(idsToRemove);
    }

    clearPot();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden sticky top-8">
      <div className="bg-orange-500 p-6 text-white">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span>🔥</span> 烹飪環節
        </h2>
        <p className="text-orange-100 text-sm mt-1">選擇食材並生成食譜</p>
      </div>
      
      <div className="p-6 space-y-6">
        {cookingPot.length > 0 ? (
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {cookingPot.map((selection) => {
              const item = items.find(i => i.id === selection.itemId);
              if (!item) return null;
              return (
                <div key={item.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col flex-1">
                      <span className="font-bold text-gray-800">{item.name}</span>
                      {item.amount && (
                        <input
                          type="text"
                          value={item.amount || ""}
                          placeholder="剩餘數量"
                          onChange={(e) => updateItemAmount(item.id, e.target.value)}
                          className="text-xs text-blue-500 font-medium bg-transparent border-b border-dashed border-blue-200 focus:border-blue-500 outline-none w-24"
                        />
                      )}
                    </div>
                    <button 
                      onClick={() => removeFromPot(item.id)}
                      className="text-gray-400 hover:text-gray-600 ml-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {!item.amount && (
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={selection.consumeAll}
                        onChange={(e) => updateConsumeAll(item.id, e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500 transition-all"
                      />
                      <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">全部用完？</span>
                    </label>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400 italic text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200 px-4">
            點擊食材上的 🍳 加入烹飪清單，或直接使用下方一鍵生成。
          </div>
        )}

        <div className="pt-6 border-t border-gray-100 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">菜餚數量</label>
              <div className="flex items-center justify-center gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <button
                  onClick={() => setDishCount(Math.max(1, dishCount - 1))}
                  disabled={dishCount <= 1}
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-white shadow-sm border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-all active:scale-90 font-bold text-xl"
                >
                  -
                </button>
                <div className="flex flex-col items-center min-w-[60px]">
                  <span className="text-2xl font-black text-orange-600 leading-none">{dishCount}</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase mt-1">菜餚</span>
                </div>
                <button
                  onClick={() => setDishCount(Math.min(5, dishCount + 1))}
                  disabled={dishCount >= 5}
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-white shadow-sm border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-all active:scale-90 font-bold text-xl"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">用餐人數</label>
              <div className="flex items-center justify-center gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <button
                  onClick={() => setPeopleCount(Math.max(1, peopleCount - 1))}
                  disabled={peopleCount <= 1}
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-white shadow-sm border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-all active:scale-90 font-bold text-xl"
                >
                  -
                </button>
                <div className="flex flex-col items-center min-w-[60px]">
                  <span className="text-2xl font-black text-blue-600 leading-none">{peopleCount}</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase mt-1">人數</span>
                </div>
                <button
                  onClick={() => setPeopleCount(Math.min(10, peopleCount + 1))}
                  disabled={peopleCount >= 10}
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-white shadow-sm border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-all active:scale-90 font-bold text-xl"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {aiError && (
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">
              {aiError}
            </div>
          )}

          <div className="flex flex-col gap-3">
            {cookingPot.length > 0 && (
              <button
                onClick={generateRecipes}
                disabled={isGenerating}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isGenerating && cookingPot.length > 0 ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    思考中...
                  </span>
                ) : (
                  <>
                    <span>🍳</span> 生成選中食材食譜
                  </>
                )}
              </button>
            )}

            <button
              onClick={generateAllRecipes}
              disabled={isGenerating || items.length === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 border-2 border-indigo-200"
            >
              {isGenerating && cookingPot.length === 0 ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  正在分析冰箱...
                </span>
              ) : (
                <>
                  <span>✨</span> 一鍵生成食譜 (全冰箱)
                </>
              )}
            </button>
          </div>

          {cookingPot.length > 0 && (
            <>
              <button
                onClick={finishCooking}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                完成並清空已用食材
              </button>
              <p className="text-[10px] text-gray-400 text-center uppercase tracking-wider font-semibold">
                庫存將根據勾選框更新
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
