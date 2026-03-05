"use client";

import { useState } from "react";
import { RefrigeratorItem } from "@/types/refrigerator";
import { supabase } from "@/lib/supabase";

interface AddItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onItemAdded: (item: RefrigeratorItem) => void;
}

export default function AddItemForm({ isOpen, onClose, onItemAdded }: AddItemFormProps) {
  const getTodayString = () => new Date().toISOString().split("T")[0];
  const getTomorrowString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const [itemName, setItemName] = useState("");
  const [itemAmount, setItemAmount] = useState("");
  const [addedDate, setAddedDate] = useState(getTodayString());
  const [expireDate, setExpireDate] = useState(getTomorrowString());

  const modifyDate = (days: number) => {
    const current = new Date(expireDate);
    current.setDate(current.getDate() + days);
    setExpireDate(current.toISOString().split("T")[0]);
  };

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
      onItemAdded(newItem);
      setItemName("");
      setItemAmount("");
      setAddedDate(getTodayString());
      setExpireDate(getTomorrowString());
      onClose(); // Close modal after successful add
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/60 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl sm:rounded-[2rem] shadow-2xl p-6 sm:p-10 w-full max-w-lg border border-gray-100 animate-in zoom-in-95 duration-300 relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-3">
            <span className="text-3xl sm:text-4xl">🧊</span> 新增食材
          </h2>
          <button 
            onClick={onClose}
            className="p-2 sm:p-3 hover:bg-gray-100 rounded-xl sm:rounded-2xl transition-all text-gray-400 hover:text-gray-600 active:scale-90"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={addItem} className="space-y-6 sm:space-y-8">
          <div className="space-y-4 sm:space-y-6">
            {/* Item Name */}
            <div>
              <label htmlFor="itemName" className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5 ml-1">
                物品名稱
              </label>
              <input
                type="text"
                id="itemName"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="例如：牛奶、雞蛋..."
                className="block w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 border-gray-100 focus:border-blue-500 focus:ring-0 outline-none transition-all text-gray-900 bg-gray-50/50 text-base sm:text-lg placeholder:text-gray-300"
                required
              />
            </div>

            {/* Item Amount */}
            <div>
              <label htmlFor="itemAmount" className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5 ml-1">
                數量 (選填)
              </label>
              <input
                type="text"
                id="itemAmount"
                value={itemAmount}
                onChange={(e) => setItemAmount(e.target.value)}
                placeholder="2 瓶, 500g..."
                className="block w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 border-gray-100 focus:border-blue-500 focus:ring-0 outline-none transition-all text-gray-900 bg-gray-50/50 text-base sm:text-lg placeholder:text-gray-300"
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {/* Added Date */}
              <div>
                <label htmlFor="addedDate" className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5 ml-1">
                  放入日期
                </label>
                <input
                  type="date"
                  id="addedDate"
                  value={addedDate}
                  onChange={(e) => setAddedDate(e.target.value)}
                  className="block w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 border-gray-100 focus:border-blue-500 focus:ring-0 outline-none transition-all text-gray-900 bg-gray-50/50 text-base sm:text-lg"
                  required
                />
              </div>

              {/* Expire Date */}
              <div>
                <label htmlFor="expireDate" className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5 ml-1">
                  有效日期
                </label>
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => modifyDate(-1)}
                    className="h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 flex items-center justify-center rounded-xl sm:rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all font-black text-xl sm:text-2xl active:scale-90 shadow-sm"
                    title="減少 1 天"
                  >
                    -
                  </button>
                  <input
                    type="date"
                    id="expireDate"
                    value={expireDate}
                    onChange={(e) => setExpireDate(e.target.value)}
                    className="flex-1 min-w-0 px-4 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 border-gray-100 focus:border-blue-500 focus:ring-0 outline-none transition-all text-gray-900 bg-gray-50/50 text-base sm:text-lg"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => modifyDate(1)}
                    className="h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 flex items-center justify-center rounded-xl sm:rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all font-black text-xl sm:text-2xl active:scale-90 shadow-sm"
                    title="增加 1 天"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
            <button
              type="button"
              onClick={onClose}
              className="order-2 sm:order-1 flex-1 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 border-gray-100 text-gray-500 font-bold hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-95 text-sm sm:text-base"
            >
              取消
            </button>
            <button
              type="submit"
              className="order-1 sm:order-2 flex-[1.5] bg-blue-600 hover:bg-blue-700 text-white font-black py-3 sm:py-4 px-6 sm:px-8 rounded-xl sm:rounded-2xl shadow-xl shadow-blue-100 hover:shadow-2xl hover:shadow-blue-200 transform transition-all active:scale-95 flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg"
            >
              確認加入冰箱
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
