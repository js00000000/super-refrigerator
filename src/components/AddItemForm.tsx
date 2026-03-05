"use client";

import { useState } from "react";
import { RefrigeratorItem } from "@/types/refrigerator";
import { supabase } from "@/lib/supabase";

interface AddItemFormProps {
  onItemAdded: (item: RefrigeratorItem) => void;
}

export default function AddItemForm({ onItemAdded }: AddItemFormProps) {
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
    }
  };

  return (
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
  );
}
