import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  currentBrandId: string | null;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setCurrentBrandId: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  currentBrandId: null,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setCurrentBrandId: (id) => set({ currentBrandId: id }),
}));
