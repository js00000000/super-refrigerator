"use client";

import { RefrigeratorItem } from "@/types/refrigerator";
import { getExpirationStatus } from "@/lib/utils";
import { useCookingStore } from "@/store/useCookingStore";

interface InventoryListProps {
  items: RefrigeratorItem[];
  updateItemAmount: (id: string, amount: string) => void;
  deleteItem: (id: string) => void;
}

export default function InventoryList({
  items,
  updateItemAmount,
  deleteItem,
}: InventoryListProps) {
  const { cookingPot, toggleInPot } = useCookingStore();

  return (
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
  );
}
