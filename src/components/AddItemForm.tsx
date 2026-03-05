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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modifyDate = (days: number) => {
    const current = new Date(expireDate);
    current.setDate(current.getDate() + days);
    setExpireDate(current.toISOString().split("T")[0]);
  };

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !expireDate || !addedDate) return;
    setIsSubmitting(true);

    const { data, error } = await supabase
      .from("refrigerator_items")
      .insert([{ name: itemName, amount: itemAmount || null, added_date: addedDate, expire_date: expireDate }])
      .select();

    if (error) {
      console.error("Error adding item:", error);
    } else if (data) {
      onItemAdded({
        id: data[0].id,
        name: data[0].name,
        amount: data[0].amount,
        addedDate: data[0].added_date,
        expireDate: data[0].expire_date,
      });
      setItemName("");
      setItemAmount("");
      setAddedDate(getTodayString());
      setExpireDate(getTomorrowString());
      onClose();
    }
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    /* ── Backdrop ──────────────────────────────────────────────────────── */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/50 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      {/* ── Modal Card ─────────────────────────────────────────────────── */}
      <div
        className="w-full sm:max-w-md glass rounded-t-3xl sm:rounded-3xl border border-white/60 shadow-2xl animate-bottom-sheet sm:animate-slide-up p-6 sm:p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle (mobile) */}
        <div className="sm:hidden w-10 h-1 rounded-full bg-gray-200 mx-auto mb-5" />

        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200/50">
              <span className="text-xl">🧊</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">新增食材</h2>
              <p className="text-xs text-gray-400 font-medium">加入冰箱庫存</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 transition-all active:scale-90"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={addItem} className="space-y-5">
          {/* Item Name */}
          <div className="space-y-1.5">
            <label htmlFor="itemName" className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
              物品名稱 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="itemName"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="例如：牛奶、雞蛋..."
              className="input-field"
              required
              autoFocus
            />
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <label htmlFor="itemAmount" className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
              數量 <span className="text-gray-300">(選填)</span>
            </label>
            <input
              type="text"
              id="itemAmount"
              value={itemAmount}
              onChange={(e) => setItemAmount(e.target.value)}
              placeholder="2 瓶..."
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Added Date */}
            <div className="space-y-1.5">
              <label htmlFor="addedDate" className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                放入日期
              </label>
              <input
                type="date"
                id="addedDate"
                value={addedDate}
                onChange={(e) => setAddedDate(e.target.value)}
                className="input-field text-sm"
                required
              />
            </div>

            {/* Expire Date */}
            <div className="space-y-1.5">
              <label htmlFor="expireDate" className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                有效日期
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => modifyDate(-1)}
                  className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-lg transition-all active:scale-90"
                  title="減少 1 天"
                >−</button>
                <input
                  type="date"
                  id="expireDate"
                  value={expireDate}
                  onChange={(e) => setExpireDate(e.target.value)}
                  className="input-field text-sm flex-1 min-w-0"
                  required
                />
                <button
                  type="button"
                  onClick={() => modifyDate(1)}
                  className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-lg transition-all active:scale-90"
                  title="增加 1 天"
                >+</button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl border-2 border-gray-200/80 text-gray-500 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95 text-sm"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-aurora flex-[1.5] py-3.5 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-emerald-300/30"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin-slow w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3.5" strokeOpacity="0.25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  加入中...
                </>
              ) : (
                "確認加入冰箱"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
