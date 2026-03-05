"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { RefrigeratorItem } from "@/types/refrigerator";
import { useCookingStore } from "@/store/useCookingStore";
import InventoryList from "@/components/InventoryList";
import AddItemForm from "@/components/AddItemForm";
import CookingPot from "@/components/CookingPot";

/* ─── Hero Section: SVG Fridge Illustration ─────────────────────────────── */
function FridgeIllustration() {
  return (
    <div className="relative w-full max-w-[420px] mx-auto select-none" aria-hidden="true">
      {/* Glow backdrop */}
      <div className="absolute inset-0 rounded-full bg-emerald-400/10 blur-3xl scale-110" />

      {/* Floating food emojis */}
      <span className="absolute top-4 left-4 text-4xl animate-float" style={{ animationDelay: "0s" }}>🥦</span>
      <span className="absolute top-16 right-2 text-3xl animate-float2" style={{ animationDelay: "0.5s" }}>🍋</span>
      <span className="absolute bottom-16 left-0 text-3xl animate-float3" style={{ animationDelay: "1s" }}>🥕</span>
      <span className="absolute bottom-4 right-8 text-4xl animate-float" style={{ animationDelay: "1.5s" }}>🍅</span>
      <span className="absolute top-1/2 -left-4 text-2xl animate-float2" style={{ animationDelay: "0.8s" }}>🧀</span>
      <span className="absolute top-1/3 right-0 text-2xl animate-float3" style={{ animationDelay: "0.3s" }}>🥚</span>

      {/* Main fridge SVG */}
      <svg viewBox="0 0 280 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 w-full drop-shadow-2xl">
        {/* Fridge body */}
        <rect x="30" y="10" width="220" height="360" rx="20" fill="url(#fridgeGrad)" />
        {/* Fridge door highlight */}
        <rect x="42" y="22" width="196" height="340" rx="14" fill="white" fillOpacity="0.08" />
        {/* Freezer compartment */}
        <rect x="38" y="18" width="204" height="105" rx="14" fill="url(#freezerGrad)" />
        {/* Divider line */}
        <rect x="30" y="128" width="220" height="4" fill="rgba(16,185,129,0.35)" />
        {/* Left handle - freezer */}
        <rect x="186" y="48" width="8" height="44" rx="4" fill="rgba(16,185,129,0.7)" />
        {/* Left handle - fridge */}
        <rect x="186" y="165" width="8" height="70" rx="4" fill="rgba(16,185,129,0.7)" />

        {/* Freezer items */}
        <rect x="58" y="44" width="60" height="38" rx="8" fill="white" fillOpacity="0.15" />
        <text x="70" y="68" fontSize="22" textAnchor="middle">🧊</text>
        <rect x="128" y="44" width="60" height="38" rx="8" fill="white" fillOpacity="0.15" />
        <text x="158" y="68" fontSize="20" textAnchor="middle">🥩</text>

        {/* Fridge shelf 1 */}
        <rect x="50" y="160" width="180" height="4" rx="2" fill="rgba(16,185,129,0.25)" />
        {/* Fridge items row 1 */}
        <text x="82" y="205" fontSize="26" textAnchor="middle">🥦</text>
        <text x="140" y="205" fontSize="26" textAnchor="middle">🍎</text>
        <text x="198" y="205" fontSize="26" textAnchor="middle">🥛</text>

        {/* Fridge shelf 2 */}
        <rect x="50" y="218" width="180" height="4" rx="2" fill="rgba(16,185,129,0.25)" />
        {/* Fridge items row 2 */}
        <text x="82" y="262" fontSize="24" textAnchor="middle">🧄</text>
        <text x="140" y="262" fontSize="24" textAnchor="middle">🫙</text>
        <text x="198" y="262" fontSize="24" textAnchor="middle">🥕</text>

        {/* Fridge shelf 3 */}
        <rect x="50" y="274" width="180" height="4" rx="2" fill="rgba(16,185,129,0.25)" />
        {/* Door bins */}
        <text x="82" y="320" fontSize="22" textAnchor="middle">🥚</text>
        <text x="140" y="320" fontSize="22" textAnchor="middle">🧃</text>
        <text x="198" y="320" fontSize="22" textAnchor="middle">🫐</text>

        {/* Status circle - green dot */}
        <circle cx="68" cy="35" r="5" fill="#34D399" />
        <circle cx="68" cy="35" r="9" fill="#34D399" fillOpacity="0.2" />

        <defs>
          <linearGradient id="fridgeGrad" x1="30" y1="10" x2="250" y2="370" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#e8faf3" />
            <stop offset="100%" stopColor="#d1fae5" />
          </linearGradient>
          <linearGradient id="freezerGrad" x1="38" y1="18" x2="242" y2="123" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#a7f3d0" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#6ee7b7" stopOpacity="0.25" />
          </linearGradient>
        </defs>
      </svg>

      {/* Decorative ring */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-40 h-10 bg-emerald-300/20 blur-xl rounded-full" />
    </div>
  );
}

/* ─── Navbar ─────────────────────────────────────────────────────────────── */
function Navbar({ onAddClick }: { onAddClick: () => void }) {
  return (
    <nav className="glass-nav sticky top-0 z-30 px-4 sm:px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200/50">
            <span className="text-lg">🧊</span>
          </div>
          <span className="text-xl font-black tracking-tight text-emerald-600">超級冰箱</span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Add button */}
          <button
            id="add-item-btn"
            onClick={onAddClick}
            className="btn-aurora flex items-center gap-2 px-4 py-2.5 rounded-2xl text-white font-bold text-sm shadow-lg shadow-emerald-200/50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">新增食材</span>
            <span className="sm:hidden">新增</span>
          </button>

          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center ring-2 ring-emerald-200/60 cursor-pointer hover:ring-emerald-400/60 transition-all">
            <span className="text-base">👤</span>
          </div>
        </div>
      </div>
    </nav>
  );
}

/* ─── Hero Section ───────────────────────────────────────────────────────── */
function HeroSection({ onCtaClick }: { onCtaClick: () => void }) {
  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-6 overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-300/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-300/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left: Copy */}
        <div className="space-y-8 animate-slide-up text-center lg:text-left">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-sm font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            AI 智能食材管理
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-tight tracking-tight">
            別讓食材<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">
              在冰箱裡哭泣
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 leading-relaxed max-w-lg mx-auto lg:mx-0">
            智能管理食材，一鍵生成美味食譜。<br className="hidden sm:block" />
            減少浪費，從超級冰箱開始。
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <button
              onClick={onCtaClick}
              className="btn-aurora px-8 py-4 rounded-2xl text-white font-bold text-lg shadow-xl shadow-emerald-300/30"
            >
              即刻整理冰箱 →
            </button>

            <a
              href="#inventory"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 border-gray-200/80 text-gray-600 font-bold text-base hover:border-emerald-300 hover:text-emerald-700 transition-all"
            >
              查看食材庫存
            </a>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8 justify-center lg:justify-start pt-2">
            {[
              { value: "0", label: "食材浪費" },
              { value: "∞", label: "食譜靈感" },
              { value: "AI", label: "智能分析" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-black text-emerald-600">{s.value}</p>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Fridge Illustration (hide on very small screens) */}
        <div className="hidden sm:flex justify-center lg:justify-end animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <FridgeIllustration />
        </div>
      </div>
    </section>
  );
}

/* ─── Generated Recipe Card ─────────────────────────────────────────────── */
function RecipeCard({ dish, idx }: { dish: { name: string; steps: string[] }; idx: number }) {
  return (
    <div
      className="glass p-6 rounded-3xl space-y-4 animate-slide-up"
      style={{ animationDelay: `${idx * 0.08}s` }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 flex items-center justify-center">
          <span className="text-xl">👨‍🍳</span>
        </div>
        <h3 className="text-lg font-bold text-gray-900">{dish.name}</h3>
      </div>
      <ol className="space-y-2.5">
        {dish.steps.map((step, sIdx) => (
          <li key={sIdx} className="flex gap-3 text-sm text-gray-600">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs ring-1 ring-emerald-200">
              {sIdx + 1}
            </span>
            <span className="leading-relaxed">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function Home() {
  const [items, setItems] = useState<RefrigeratorItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showHero, setShowHero] = useState(true);
  const { generatedDishes, cookingPot, removeFromPot } = useCookingStore();

  /* Load items from Supabase */
  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase
        .from("refrigerator_items")
        .select("*")
        .order("expire_date", { ascending: true });

      if (error) {
        console.error("Error fetching items:", error);
      } else {
        setItems(
          data.map((item) => ({
            id: item.id,
            name: item.name,
            amount: item.amount,
            addedDate: item.added_date,
            expireDate: item.expire_date,
          }))
        );
      }
      setIsLoaded(true);
    };
    fetchItems();
  }, []);

  const onItemAdded = (newItem: RefrigeratorItem) => {
    setItems((prev) =>
      [...prev, newItem].sort(
        (a, b) => new Date(a.expireDate).getTime() - new Date(b.expireDate).getTime()
      )
    );
    // Scroll to inventory after adding
    setShowHero(false);
    setTimeout(() => {
      const el = document.getElementById("inventory");
      if (el && typeof el.scrollIntoView === "function") el.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const updateItemAmount = async (id: string, newAmount: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, amount: newAmount } : item)));
    const { error } = await supabase
      .from("refrigerator_items")
      .update({ amount: newAmount || null })
      .eq("id", id);
    if (error) console.error("Error updating amount:", error);
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from("refrigerator_items").delete().eq("id", id);
    if (error) {
      console.error("Error deleting item:", error);
    } else {
      setItems(items.filter((item) => item.id !== id));
      removeFromPot(id);
    }
  };

  const onItemsConsumed = (idsToRemove: string[]) => {
    setItems(items.filter((item) => !idsToRemove.includes(item.id)));
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg animate-pulse">
            <span className="text-2xl">🧊</span>
          </div>
          <p className="text-sm text-gray-400 font-medium animate-pulse">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <Navbar onAddClick={() => setIsAddModalOpen(true)} />

      {/* Hero Section */}
      {showHero && (
        <HeroSection
          onCtaClick={() => {
            setShowHero(false);
            setTimeout(() => {
              const el = document.getElementById("inventory");
              if (el && typeof el.scrollIntoView === "function") el.scrollIntoView({ behavior: "smooth" });
            }, 100);
          }}
        />
      )}

      {/* Toggle Hero / Back to Hero */}
      {!showHero && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
          <button
            onClick={() => setShowHero(true)}
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-600 font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回首頁
          </button>
        </div>
      )}

      {/* Main Content */}
      <main id="inventory" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-32 lg:pb-12">
        {/* AI Recipes Section */}
        {generatedDishes.length > 0 && (
          <section className="mb-10 animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 flex items-center justify-center">
                <span className="text-lg">✨</span>
              </div>
              <h2 className="text-2xl font-black text-gray-900">AI 推薦食譜</h2>
              <span className="ml-auto text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {generatedDishes.length} 道料理
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {generatedDishes.map((dish, idx) => (
                <RecipeCard key={idx} dish={dish} idx={idx} />
              ))}
            </div>
          </section>
        )}

        {/* 3:1 Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left: Inventory (3/4 width) */}
          <div className="lg:col-span-3">
            <InventoryList
              items={items}
              updateItemAmount={updateItemAmount}
              deleteItem={deleteItem}
            />
          </div>

          {/* Right: Cooking Pot (1/4 width) — hidden on mobile (shown as bottom sheet) */}
          <div className="hidden lg:block lg:col-span-1">
            <CookingPot
              items={items}
              onItemsConsumed={onItemsConsumed}
              updateItemAmount={updateItemAmount}
            />
          </div>
        </div>
      </main>

      {/* Mobile Bottom Sheet: Cooking Pot */}
      <div className="lg:hidden">
        <CookingPot
          items={items}
          onItemsConsumed={onItemsConsumed}
          updateItemAmount={updateItemAmount}
          isMobileSheet
        />
      </div>

      {/* Add Item Modal */}
      <AddItemForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onItemAdded={onItemAdded}
      />
    </div>
  );
}
