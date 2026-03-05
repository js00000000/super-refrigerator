import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CookingSelection, Dish } from "@/types/refrigerator";

interface CookingState {
  cookingPot: CookingSelection[];
  dishCount: number;
  peopleCount: number;
  generatedDishes: Dish[];
  isGenerating: boolean;
  aiError: string;

  // Actions
  toggleInPot: (itemId: string) => void;
  removeFromPot: (itemId: string) => void;
  updateConsumeAll: (itemId: string, consumeAll: boolean) => void;
  setDishCount: (count: number) => void;
  setPeopleCount: (count: number) => void;
  setGeneratedDishes: (dishes: Dish[]) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setAiError: (error: string) => void;
  clearPot: () => void;
  clearGeneratedDishes: () => void;
}

export const useCookingStore = create<CookingState>()(
  persist(
    (set) => ({
      cookingPot: [],
      dishCount: 1,
      peopleCount: 2,
      generatedDishes: [],
      isGenerating: false,
      aiError: "",

      toggleInPot: (itemId) =>
        set((state) => {
          const exists = state.cookingPot.some((p) => p.itemId === itemId);
          if (exists) {
            return {
              cookingPot: state.cookingPot.filter((p) => p.itemId !== itemId),
            };
          } else {
            return {
              cookingPot: [...state.cookingPot, { itemId, consumeAll: false }],
            };
          }
        }),

      removeFromPot: (itemId) =>
        set((state) => ({
          cookingPot: state.cookingPot.filter((p) => p.itemId !== itemId),
        })),

      updateConsumeAll: (itemId, consumeAll) =>
        set((state) => ({
          cookingPot: state.cookingPot.map((p) =>
            p.itemId === itemId ? { ...p, consumeAll } : p
          ),
        })),

      setDishCount: (count) => set({ dishCount: count }),
      setPeopleCount: (count) => set({ peopleCount: count }),
      setGeneratedDishes: (dishes) => set({ generatedDishes: dishes }),
      setIsGenerating: (isGenerating) => set({ isGenerating }),
      setAiError: (error) => set({ aiError: error }),
      clearPot: () => set({ cookingPot: [] }),
      clearGeneratedDishes: () => set({ generatedDishes: [] }),
    }),
    {
      name: "cooking-store", // localStorage key
      partialize: (state) => ({
        generatedDishes: state.generatedDishes,
        dishCount: state.dishCount,
        peopleCount: state.peopleCount,
      }),
    }
  )
);
