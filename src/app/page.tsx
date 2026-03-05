"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { RefrigeratorItem } from "@/types/refrigerator";
import { useCookingStore } from "@/store/useCookingStore";
import InventoryList from "@/components/InventoryList";
import AddItemForm from "@/components/AddItemForm";
import CookingPot from "@/components/CookingPot";

export default function Home() {
  const [items, setItems] = useState<RefrigeratorItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { generatedDishes, removeFromPot } = useCookingStore();

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

  const onItemAdded = (newItem: RefrigeratorItem) => {
    setItems(prev => [...prev, newItem].sort((a, b) => new Date(a.expireDate).getTime() - new Date(b.expireDate).getTime()));
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

  const onItemsConsumed = (idsToRemove: string[]) => {
    setItems(items.filter(item => !idsToRemove.includes(item.id)));
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input & Inventory */}
        <div className="lg:col-span-8 space-y-8">
          <AddItemForm onItemAdded={onItemAdded} />

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

          <InventoryList
            items={items}
            updateItemAmount={updateItemAmount}
            deleteItem={deleteItem}
          />
        </div>

        {/* Right Column: Cooking Pot */}
        <div className="lg:col-span-4">
          <CookingPot 
            items={items} 
            onItemsConsumed={onItemsConsumed}
            updateItemAmount={updateItemAmount}
          />
        </div>

      </div>
    </div>
  );
}
