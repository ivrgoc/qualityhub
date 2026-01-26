import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/**
 * Theme options for the application.
 */
export type Theme = 'light' | 'dark' | 'system';

/**
 * Modal configuration for displaying modals.
 */
export interface ModalConfig {
  id: string;
  type: string;
  props?: Record<string, unknown>;
}

/**
 * UI state interface for managing sidebar, modals, and theme.
 */
export interface UIState {
  sidebar: {
    isOpen: boolean;
    isCollapsed: boolean;
  };
  modal: {
    isOpen: boolean;
    activeModal: ModalConfig | null;
    modalStack: ModalConfig[];
  };
  theme: {
    current: Theme;
    systemPreference: 'light' | 'dark';
  };
}

const initialState: UIState = {
  sidebar: {
    isOpen: true,
    isCollapsed: false,
  },
  modal: {
    isOpen: false,
    activeModal: null,
    modalStack: [],
  },
  theme: {
    current: 'system',
    systemPreference: 'light',
  },
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Sidebar actions
    /**
     * Toggle the sidebar open/closed state.
     */
    toggleSidebar: (state) => {
      state.sidebar.isOpen = !state.sidebar.isOpen;
    },

    /**
     * Set the sidebar open/closed state explicitly.
     */
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebar.isOpen = action.payload;
    },

    /**
     * Toggle the sidebar collapsed/expanded state.
     */
    toggleSidebarCollapsed: (state) => {
      state.sidebar.isCollapsed = !state.sidebar.isCollapsed;
    },

    /**
     * Set the sidebar collapsed state explicitly.
     */
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebar.isCollapsed = action.payload;
    },

    // Modal actions
    /**
     * Open a modal with the given configuration.
     */
    openModal: (state, action: PayloadAction<ModalConfig>) => {
      state.modal.isOpen = true;
      state.modal.activeModal = action.payload;
      state.modal.modalStack.push(action.payload);
    },

    /**
     * Close the currently active modal.
     * If there are modals in the stack, show the previous one.
     */
    closeModal: (state) => {
      state.modal.modalStack.pop();
      const previousModal = state.modal.modalStack[state.modal.modalStack.length - 1];
      if (previousModal) {
        state.modal.activeModal = previousModal;
      } else {
        state.modal.isOpen = false;
        state.modal.activeModal = null;
      }
    },

    /**
     * Close all modals and clear the stack.
     */
    closeAllModals: (state) => {
      state.modal.isOpen = false;
      state.modal.activeModal = null;
      state.modal.modalStack = [];
    },

    /**
     * Close a specific modal by its ID.
     */
    closeModalById: (state, action: PayloadAction<string>) => {
      const modalId = action.payload;
      state.modal.modalStack = state.modal.modalStack.filter((m) => m.id !== modalId);

      if (state.modal.activeModal?.id === modalId) {
        const previousModal = state.modal.modalStack[state.modal.modalStack.length - 1];
        if (previousModal) {
          state.modal.activeModal = previousModal;
        } else {
          state.modal.isOpen = false;
          state.modal.activeModal = null;
        }
      }
    },

    // Theme actions
    /**
     * Set the application theme.
     */
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme.current = action.payload;
    },

    /**
     * Update the system preference (detected from OS).
     */
    setSystemPreference: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme.systemPreference = action.payload;
    },

    /**
     * Toggle between light and dark theme.
     * If current theme is 'system', switch to the opposite of system preference.
     */
    toggleTheme: (state) => {
      if (state.theme.current === 'system') {
        state.theme.current = state.theme.systemPreference === 'light' ? 'dark' : 'light';
      } else {
        state.theme.current = state.theme.current === 'light' ? 'dark' : 'light';
      }
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleSidebarCollapsed,
  setSidebarCollapsed,
  openModal,
  closeModal,
  closeAllModals,
  closeModalById,
  setTheme,
  setSystemPreference,
  toggleTheme,
} = uiSlice.actions;

// Selectors
export const selectSidebarOpen = (state: { ui: UIState }): boolean => state.ui.sidebar.isOpen;
export const selectSidebarCollapsed = (state: { ui: UIState }): boolean =>
  state.ui.sidebar.isCollapsed;
export const selectSidebar = (state: { ui: UIState }): UIState['sidebar'] => state.ui.sidebar;

export const selectModalOpen = (state: { ui: UIState }): boolean => state.ui.modal.isOpen;
export const selectActiveModal = (state: { ui: UIState }): ModalConfig | null =>
  state.ui.modal.activeModal;
export const selectModalStack = (state: { ui: UIState }): ModalConfig[] => state.ui.modal.modalStack;
export const selectModal = (state: { ui: UIState }): UIState['modal'] => state.ui.modal;

export const selectTheme = (state: { ui: UIState }): Theme => state.ui.theme.current;
export const selectSystemPreference = (state: { ui: UIState }): 'light' | 'dark' =>
  state.ui.theme.systemPreference;
export const selectEffectiveTheme = (state: { ui: UIState }): 'light' | 'dark' => {
  const { current, systemPreference } = state.ui.theme;
  return current === 'system' ? systemPreference : current;
};

export default uiSlice.reducer;
