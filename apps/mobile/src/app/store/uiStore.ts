import { create } from 'zustand';

interface UIState {
  loading: boolean;
  modalVisible: boolean;
  modalContent: string | null;
  setLoading: (v: boolean) => void;
  setModal: (visible: boolean, content?: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  loading: false,
  modalVisible: false,
  modalContent: null,
  setLoading: (loading) => set({ loading }),
  setModal: (modalVisible, modalContent = null) => set({ modalVisible, modalContent }),
}));
