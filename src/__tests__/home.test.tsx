import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Home from '../app/page'
import { expect, test, describe, vi } from 'vitest'
import { supabase } from '@/lib/supabase'

describe('Home Page', () => {
  test('renders the title', async () => {
    render(<Home />)
    expect(await screen.findByText(/超級冰箱/i)).toBeInTheDocument()
  })

  test('generates recipes with 1-click feature', async () => {
    // Setup mock items
    const mockItems = [
      { id: '1', name: 'Eggs', amount: '6', added_date: '2026-03-01', expire_date: '2026-03-10' },
      { id: '2', name: 'Milk', amount: '1L', added_date: '2026-03-02', expire_date: '2026-03-05' }
    ];
    
    // Mock Supabase response
    (supabase.from as any).mockImplementationOnce(() => ({
      select: vi.fn().mockImplementation(() => ({
        order: vi.fn().mockResolvedValue({ data: mockItems, error: null })
      }))
    }));

    // Mock successful fetch for API
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        dishes: [
          { name: 'Omelette', steps: ['Crack eggs', 'Fry'] },
          { name: 'Scrambled Eggs', steps: ['Mix eggs', 'Fry'] }
        ]
      })
    });

    render(<Home />)
    
    // Wait for items to load
    expect(await screen.findByText(/Eggs/i)).toBeInTheDocument()
    
    // Find and click the 1-click button
    const oneClickBtn = screen.getByText(/一鍵生成食譜 \(全冰箱\)/i)
    fireEvent.click(oneClickBtn)
    
    // Check for "thinking" state
    expect(screen.getByText(/正在分析冰箱\.\.\./i)).toBeInTheDocument()
    
    // Wait for recipes to appear
    expect(await screen.findByText(/Omelette/i)).toBeInTheDocument()
    expect(await screen.findByText(/Scrambled Eggs/i)).toBeInTheDocument()
    expect(screen.getByText(/Crack eggs/i)).toBeInTheDocument()
  })
})
