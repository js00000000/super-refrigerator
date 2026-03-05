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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-xl border border-gray-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-4xl">🧊</span> 新增物品
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={addItem} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="itemName" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  物品名稱
                </label>
                <input
                  type="text"
                  id="itemName"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="例如：牛奶、雞蛋..."
                  className="block w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 bg-gray-50/50"
                  required
                />
              </div>
              <div>
                <label htmlFor="itemAmount" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  數量 (選填)
                </label>
                <input
                  type="text"
                  id="itemAmount"
                  value={itemAmount}
                  onChange={(e) => setItemAmount(e.target.value)}
                  placeholder="2 瓶..."
                  className="block w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 bg-gray-50/50"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="addedDate" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  放入日期
                </label>
                <input
                  type="date"
                  id="addedDate"
                  value={addedDate}
                  onChange={(e) => setAddedDate(e.target.value)}
                  className="block w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 bg-gray-50/50"
                  required
                />
              </div>
              <div>
                <label htmlFor="expireDate" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  有效日期
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => modifyDate(-1)}
                    className="h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors font-bold text-xl"
                  >
                    -
                  </button>
                  <input
                    type="date"
                    id="expireDate"
                    value={expireDate}
                    onChange={(e) => setExpireDate(e.target.value)}
                    className="block w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 bg-gray-50/50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => modifyDate(1)}
                    className="h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors font-bold text-xl"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-2xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-blue-200 hover:shadow-xl transform transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              確認加入
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
