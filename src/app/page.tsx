"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface RefrigeratorItem {
  id: string;
  name: string;
  amount?: string;
  addedDate: string;
  expireDate: string;
}

interface CookingSelection {
  itemId: string;
  consumeAll: boolean;
}

interface Dish {
  name: string;
  steps: string[];
}

export default function Home() {
  const getTodayString = () => new Date().toISOString().split("T")[0];
  const getTomorrowString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const [items, setItems] = useState<RefrigeratorItem[]>([]);
  const [itemName, setItemName] = useState("");
  const [itemAmount, setItemAmount] = useState("");
  const [addedDate, setAddedDate] = useState(getTodayString());
  const [expireDate, setExpireDate] = useState(getTomorrowString());
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Cooking & AI states
  const [cookingPot, setCookingPot] = useState<CookingSelection[]>([]);
  const [dishCount, setDishCount] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDishes, setGeneratedDishes] = useState<Dish[]>([]);
  const [aiError, setAiError] = useState("");

  // Load items from Supabase
  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase
        .from("refrigerator_items")
        .select("*")
        .order("expire_date", { ascending: true });

      if (error) {
        console.error("Error fetching items:", error);
      } else {
        setItems(data.map(item => ({
          id: item.id,
          name: item.name,
          amount: item.amount,
          addedDate: item.added_date,
          expireDate: item.expire_date
        })));
      }
      setIsLoaded(true);
    };

    fetchItems();
  }, []);

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !expireDate || !addedDate) return;

    const { data, error } = await supabase
      .from("refrigerator_items")
      .insert([
        { 
          name: itemName, 
          amount: itemAmount || null,
          added_date: addedDate, 
          expire_date: expireDate 
        }
      ])
      .select();

    if (error) {
      console.error("Error adding item:", error);
    } else if (data) {
      const newItem = {
        id: data[0].id,
        name: data[0].name,
        amount: data[0].amount,
        addedDate: data[0].added_date,
        expireDate: data[0].expire_date
      };
      setItems([...items, newItem].sort((a, b) => new Date(a.expireDate).getTime() - new Date(b.expireDate).getTime()));
      setItemName("");
      setItemAmount("");
      setAddedDate(getTodayString());
      setExpireDate(getTomorrowString());
    }
  };

  const updateItemAmount = async (id: string, newAmount: string) => {
    // Update local state first for responsiveness
    setItems(items.map(item => item.id === id ? { ...item, amount: newAmount } : item));

    const { error } = await supabase
      .from("refrigerator_items")
      .update({ amount: newAmount || null })
      .eq("id", id);

    if (error) {
      console.error("Error updating amount:", error);
    }
  };

  const modifyDate = (days: number) => {
    const current = new Date(expireDate);
    current.setDate(current.getDate() + days);
    setExpireDate(current.toISOString().split("T")[0]);
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase
      .from("refrigerator_items")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting item:", error);
    } else {
      setItems(items.filter((item) => item.id !== id));
      removeFromPot(id);
    }
  };

  const toggleInPot = (itemId: string) => {
    if (cookingPot.some(p => p.itemId === itemId)) {
      setCookingPot(cookingPot.filter(p => p.itemId !== itemId));
    } else {
      setCookingPot([...cookingPot, { itemId, consumeAll: false }]);
    }
    setGeneratedDishes([]);
    setAiError("");
  };

  const removeFromPot = (itemId: string) => {
    setCookingPot(cookingPot.filter(p => p.itemId !== itemId));
    setGeneratedDishes([]);
  };

  const updateConsumeAll = (itemId: string, consumeAll: boolean) => {
    setCookingPot(cookingPot.map(p => p.itemId === itemId ? { ...p, consumeAll } : p));
  };

  const generateRecipes = async () => {
    if (cookingPot.length === 0) return;
    
    setIsGenerating(true);
    setAiError("");
    setGeneratedDishes([]);
    
    const selectedItems = cookingPot.map(p => items.find(i => i.id === p.itemId));
    
    try {
      const res = await fetch("/api/generate-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: selectedItems, dishCount }),
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
    }

    setItems(items.filter(item => !idsToRemove.includes(item.id)));
    setCookingPot([]);
    setGeneratedDishes([]);
  };

  const getExpirationStatus = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expireDate = new Date(dateString);
    expireDate.setHours(0, 0, 0, 0);

    const diffTime = expireDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: "已過期", color: "text-red-600 bg-red-100" };
    if (diffDays <= 3) return { label: `${diffDays} 天後過期`, color: "text-orange-600 bg-orange-100" };
    return { label: `還有 ${diffDays} 天過期`, color: "text-green-600 bg-green-100" };
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input & Inventory */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center flex items-center justify-center gap-2">
              <span className="text-4xl">🧊</span> 超級冰箱
            </h1>

            <form onSubmit={addItem} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 mb-1">
                      物品名稱
                    </label>
                    <input
                      type="text"
                      id="itemName"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      placeholder="例如：牛奶、雞蛋..."
                      className="block w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="itemAmount" className="block text-sm font-medium text-gray-700 mb-1">
                      數量 (選填)
                    </label>
                    <input
                      type="text"
                      id="itemAmount"
                      value={itemAmount}
                      onChange={(e) => setItemAmount(e.target.value)}
                      placeholder="2 瓶, 500g..."
                      className="block w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="addedDate" className="block text-sm font-medium text-gray-700 mb-1">
                      放入日期
                    </label>
                    <input
                      type="date"
                      id="addedDate"
                      value={addedDate}
                      onChange={(e) => setAddedDate(e.target.value)}
                      className="block w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="expireDate" className="block text-sm font-medium text-gray-700 mb-1">
                      有效日期
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => modifyDate(-1)}
                        className="h-12 w-12 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors font-bold text-xl"
                        title="減少 1 天"
                      >
                        -
                      </button>
                      <input
                        type="date"
                        id="expireDate"
                        value={expireDate}
                        onChange={(e) => setExpireDate(e.target.value)}
                        className="block w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => modifyDate(1)}
                        className="h-12 w-12 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors font-bold text-xl"
                        title="增加 1 天"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                加入冰箱
              </button>
            </form>
          </div>

          {/* AI Generated Recipes Section */}
          {generatedDishes.length > 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span>👨‍🍳</span> AI 推薦食譜
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {generatedDishes.map((dish, idx) => (
                  <div key={idx} className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6 space-y-4 hover:border-blue-300 transition-colors">
                    <h3 className="text-xl font-bold text-blue-700">{dish.name}</h3>
                    <ol className="space-y-3">
                      {dish.steps.map((step, sIdx) => (
                        <li key={sIdx} className="flex gap-3 text-sm text-gray-600">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                            {sIdx + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              冰箱庫存 <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-sm font-medium">{items.length}</span>
            </h2>
            {items.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200 text-gray-500 italic">
                您的冰箱是空的。
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {items.map((item) => {
                  const status = getExpirationStatus(item.expireDate);
                  const isInPot = cookingPot.some(p => p.itemId === item.id);
                  return (
                    <div
                      key={item.id}
                      className={`bg-white p-5 rounded-2xl shadow-sm border transition-all flex items-center justify-between group ${isInPot ? 'border-orange-300 ring-2 ring-orange-100 bg-orange-50/30' : 'border-gray-100 hover:shadow-md'}`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                         <button
                          onClick={() => toggleInPot(item.id)}
                          className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center transition-all ${isInPot ? 'bg-orange-500 text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                          title={isInPot ? "從烹飪中移除" : "用於烹飪"}
                        >
                          <span className="text-lg">🍳</span>
                        </button>
                        <div className="space-y-1 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                            <input
                              type="text"
                              value={item.amount || ""}
                              placeholder="數量"
                              onChange={(e) => updateItemAmount(item.id, e.target.value)}
                              className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-md font-medium border-none focus:ring-1 focus:ring-blue-300 w-20 outline-none"
                            />
                          </div>
                          <div className="flex flex-wrap gap-2 items-center">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.color}`}>
                              {status.label}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                              放入: {new Date(item.addedDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="text-gray-300 hover:text-red-500 p-2 rounded-lg transition-colors group-hover:bg-red-50 flex-shrink-0"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Cooking Pot */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden sticky top-8">
            <div className="bg-orange-500 p-6 text-white">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span>🔥</span> 烹飪環節
              </h2>
              <p className="text-orange-100 text-sm mt-1">選擇食材並生成食譜</p>
            </div>
            
            <div className="p-6 space-y-6">
              {cookingPot.length === 0 ? (
                <div className="text-center py-8 text-gray-400 italic text-sm">
                  點擊食材上的 🍳 圖示加入這裡。
                </div>
              ) : (
                <>
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

                  <div className="pt-6 border-t border-gray-100 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">建議菜餚數量</label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="range" 
                          min="1" 
                          max="5" 
                          value={dishCount} 
                          onChange={(e) => setDishCount(parseInt(e.target.value))}
                          className="flex-1 accent-orange-500"
                        />
                        <span className="font-bold text-orange-600 w-4">{dishCount}</span>
                      </div>
                    </div>

                    {aiError && (
                      <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">
                        {aiError}
                      </div>
                    )}

                    <button
                      onClick={generateRecipes}
                      disabled={isGenerating || cookingPot.length === 0}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      {isGenerating ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          思考中...
                        </span>
                      ) : (
                        <>
                          <span>✨</span> 生成 AI 食譜
                        </>
                      )}
                    </button>

                    <button
                      onClick={finishCooking}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      完成並清空已用食材
                    </button>
                    <p className="text-[10px] text-gray-400 text-center uppercase tracking-wider font-semibold">
                      庫存將根據勾選框更新
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
