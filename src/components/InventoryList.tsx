"use client";

import { RefrigeratorItem } from "@/types/refrigerator";
import { getExpirationStatus } from "@/lib/utils";
import { useCookingStore } from "@/store/useCookingStore";

interface InventoryListProps {
  items: RefrigeratorItem[];
  updateItemAmount: (id: string, amount: string) => void;
  deleteItem: (id: string) => void;
}



/* ─── Expiration Badge ──────────────────────────────────────────────────── */
function ExpiryBadge({ expireDate }: { expireDate: string }) {
  const status = getExpirationStatus(expireDate);
  const colorMap: Record<string, string> = {
    "text-red-600 bg-red-100": "bg-red-100 text-red-700 ring-red-200/60",
    "text-orange-600 bg-orange-100": "bg-amber-100 text-amber-700 ring-amber-200/60",
    "text-green-600 bg-green-100": "bg-emerald-100 text-emerald-700 ring-emerald-200/60",
  };
  const cls = colorMap[status.color] ?? "bg-gray-100 text-gray-700 ring-gray-200/60";
  return (
    <span className={`inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-full ring-1 ${cls}`}>
      {status.label}
    </span>
  );
}

/* ─── Ingredient Card ───────────────────────────────────────────────────── */
function IngredientCard({
  item,
  isInPot,
  onToggle,
  onUpdateAmount,
  onDelete,
}: {
  item: RefrigeratorItem;
  isInPot: boolean;
  onToggle: () => void;
  onUpdateAmount: (val: string) => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`ingredient-card glass p-4 rounded-3xl border flex flex-col gap-3 cursor-default group/card
        ${isInPot
          ? "selected border-emerald-400/60 bg-emerald-50/60"
          : "border-white/60 hover:border-emerald-200/80"
        }`}
    >
      {/* Top row: name + toggle */}
      <div className="flex items-start justify-between gap-3">

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-base leading-snug truncate">{item.name}</h3>
          <p className="text-[11px] text-gray-400 font-medium mt-0.5">
            放入：{new Date(item.addedDate).toLocaleDateString("zh-TW")}
          </p>
        </div>

        {/* Toggle button */}
        <button
          onClick={onToggle}
          title={isInPot ? "從烹飪中移除" : "用於烹飪"}
          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-90
            ${isInPot
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-300/40 animate-pulse-glow"
              : "bg-gray-100/80 text-gray-400 hover:bg-emerald-100 hover:text-emerald-600"
            }`}
        >
          <span className="text-base">🍳</span>
        </button>
      </div>

      {/* Bottom row: amount + expiry + delete */}
      <div className="flex items-center gap-2">
        <ExpiryBadge expireDate={item.expireDate} />

        <input
          type="text"
          value={item.amount || ""}
          placeholder="數量"
          onChange={(e) => onUpdateAmount(e.target.value)}
          className="flex-1 min-w-0 text-[12px] font-semibold text-emerald-700 bg-emerald-50/70 border border-emerald-200/60 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-emerald-400 placeholder:text-gray-300 transition-all"
        />

        <button
          onClick={onDelete}
          className="text-gray-300 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-50 flex-shrink-0"
          title="刪除食材"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ─── Empty State ───────────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="glass rounded-3xl p-12 text-center border border-dashed border-emerald-200/60">
      <div className="text-6xl mb-4">🧊</div>
      <p className="text-gray-400 font-semibold text-lg">冰箱空空的</p>
      <p className="text-gray-300 text-sm mt-1">點擊右上角「新增食材」開始 →</p>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────────────── */
export default function InventoryList({ items, updateItemAmount, deleteItem }: InventoryListProps) {
  const { cookingPot, toggleInPot } = useCookingStore();

  return (
    <div className="space-y-5">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-black text-gray-900">冰箱庫存</h2>
        <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full ring-1 ring-emerald-200/60">
          {items.length} 項
        </span>
      </div>

      {/* Ingredient Grid */}
      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item) => {
            const isInPot = cookingPot.some((p) => p.itemId === item.id);
            return (
              <IngredientCard
                key={item.id}
                item={item}
                isInPot={isInPot}
                onToggle={() => toggleInPot(item.id)}
                onUpdateAmount={(val) => updateItemAmount(item.id, val)}
                onDelete={() => deleteItem(item.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
