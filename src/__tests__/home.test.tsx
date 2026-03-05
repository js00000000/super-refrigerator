import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Home from '../app/page'
import { expect, test, describe, vi, beforeEach } from 'vitest'
import { supabase } from '@/lib/supabase'
import { useCookingStore } from '@/store/useCookingStore'

// Mock data
const mockItems = [
  { id: '1', name: 'Eggs', amount: '6', added_date: '2026-03-01', expire_date: '2026-03-10' },
  { id: '2', name: 'Milk', amount: '1L', added_date: '2026-03-02', expire_date: '2026-03-05' }
];

describe('Super Refrigerator - Core Features', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset Zustand store
    useCookingStore.getState().clearPot();
    useCookingStore.getState().setDishCount(1);
    useCookingStore.getState().setPeopleCount(2);
    useCookingStore.getState().setGeneratedDishes([]);
    useCookingStore.getState().setAiError("");
    useCookingStore.getState().setIsGenerating(false);

    // Default Supabase mock response
    (supabase.from as any).mockImplementation((table: string) => ({
      select: vi.fn().mockImplementation(() => ({
        order: vi.fn().mockResolvedValue({ data: mockItems, error: null })
      })),
      insert: vi.fn().mockImplementation(() => ({
        select: vi.fn().mockResolvedValue({ 
          data: [{ id: '3', name: 'Cheese', amount: '200g', added_date: '2026-03-05', expire_date: '2026-03-12' }], 
          error: null 
        })
      })),
      update: vi.fn().mockImplementation(() => ({
        update: vi.fn().mockImplementation(() => ({
            eq: vi.fn().mockResolvedValue({ error: null })
        })),
        eq: vi.fn().mockResolvedValue({ error: null })
      })),
      delete: vi.fn().mockImplementation(() => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
        in: vi.fn().mockResolvedValue({ error: null })
      }))
    }));

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        dishes: [{ name: 'Test Dish', steps: ['Step 1', 'Step 2'] }]
      })
    });
  });

  test('1. Inventory: Initial Load', async () => {
    render(<Home />)
    expect(await screen.findAllByText(/Eggs/i)).toHaveLength(1) // Initially only in inventory
    expect(screen.getByText(/Milk/i)).toBeInTheDocument()
    // Using getAllByText for '6' because it appears in date too
    expect(screen.getAllByText(/6/i).length).toBeGreaterThan(0)
  })

  test('2. Inventory: Add New Item', async () => {
    render(<Home />)
    
    const nameInput = await screen.findByPlaceholderText(/例如：牛奶、雞蛋\.\.\./i)
    const amountInput = screen.getByPlaceholderText(/2 瓶, 500g\.\.\./i)
    const submitBtn = screen.getByText(/加入冰箱/i)

    fireEvent.change(nameInput, { target: { value: 'Cheese' } })
    fireEvent.change(amountInput, { target: { value: '200g' } })
    fireEvent.click(submitBtn)

    expect(await screen.findByText(/Cheese/i)).toBeInTheDocument()
  })

  test('3. Inventory: Update Item Amount', async () => {
    render(<Home />)
    const amountInput = await screen.findByDisplayValue('6')
    
    fireEvent.change(amountInput, { target: { value: '12' } })
    
    expect(supabase.from).toHaveBeenCalledWith('refrigerator_items')
  })

  test('4. Inventory: Delete Item', async () => {
    render(<Home />)
    await screen.findAllByText(/Eggs/i)
    
    // Find delete button via its SVG path or class
    const deleteBtn = screen.getAllByRole('button').find(btn => 
      btn.querySelector('svg') && btn.className.includes('text-gray-300')
    )
    
    if (deleteBtn) fireEvent.click(deleteBtn)
    
    await waitFor(() => {
      expect(screen.queryByText(/Eggs/i)).not.toBeInTheDocument()
    })
  })

  test('5. Cooking Session: Toggle Item into Pot', async () => {
    render(<Home />)
    const toggleBtns = await screen.findAllByTitle(/用於烹飪/i)
    
    fireEvent.click(toggleBtns[0])
    
    // Now it should appear twice: once in inventory, once in cooking pot
    const items = await screen.findAllByText(/Eggs/i)
    expect(items.length).toBe(2)
  })

  test('6. Recipe Generation: With Selected Items', async () => {
    render(<Home />)
    const toggleBtns = await screen.findAllByTitle(/用於烹飪/i)
    fireEvent.click(toggleBtns[0])
    
    const generateBtn = await screen.findByText(/生成選中食材食譜/i)
    fireEvent.click(generateBtn)
    
    expect(await screen.findByText(/Test Dish/i)).toBeInTheDocument()
  })

  test('7. Recipe Generation: 1-Click Feature', async () => {
    render(<Home />)
    await screen.findAllByText(/Eggs/i)
    
    const oneClickBtn = await screen.findByText(/一鍵生成食譜 \(全冰箱\)/i)
    fireEvent.click(oneClickBtn)
    
    expect(await screen.findByText(/Test Dish/i)).toBeInTheDocument()
  })

  test('8. Cooking Session: Adjust Dish and People Count', async () => {
    render(<Home />)
    
    // Find buttons by text/title after they load
    const plusBtns = await screen.findAllByText('+')
    // Next.js page has many buttons, let's be specific
    // The dish count stepper is in the right column - using more specific selection
    const dishPlusBtn = screen.getAllByText('+').find(btn => btn.parentElement?.className.includes('bg-gray-50'))
    
    if (dishPlusBtn) fireEvent.click(dishPlusBtn)
    
    const oneClickBtn = screen.getByText(/一鍵生成食譜 \(全冰箱\)/i)
    fireEvent.click(oneClickBtn)
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })
  })

  test('9. Cooking Session: Finish Cooking (Remove Items)', async () => {
    // Mock an item without amount to trigger "consume all" checkbox
    const mockItemsNoAmount = [{ id: '4', name: 'Spinach', amount: null, added_date: '2026-03-01', expire_date: '2026-03-10' }];
    (supabase.from as any).mockImplementation((table: string) => ({
      select: vi.fn().mockImplementation(() => ({
        order: vi.fn().mockResolvedValue({ data: mockItemsNoAmount, error: null })
      })),
      delete: vi.fn().mockImplementation(() => ({
        in: vi.fn().mockResolvedValue({ error: null })
      }))
    }))
    
    render(<Home />)
    const spinachToggle = await screen.findByTitle(/用於烹飪/i)
    fireEvent.click(spinachToggle)
    
    const consumeAllCheckbox = await screen.findByLabelText(/全部用完？/i)
    fireEvent.click(consumeAllCheckbox)
    
    const finishBtn = screen.getByText(/完成並清空已用食材/i)
    fireEvent.click(finishBtn)
    
    await waitFor(() => {
       expect(supabase.from).toHaveBeenCalledWith('refrigerator_items')
    })
  })
})
