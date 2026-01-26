import { describe, it, expect } from 'vitest';
import uiReducer, {
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
  selectSidebarOpen,
  selectSidebarCollapsed,
  selectSidebar,
  selectModalOpen,
  selectActiveModal,
  selectModalStack,
  selectModal,
  selectTheme,
  selectSystemPreference,
  selectEffectiveTheme,
  type UIState,
  type ModalConfig,
} from './uiSlice';

describe('uiSlice', () => {
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

  const mockModal: ModalConfig = {
    id: 'modal-1',
    type: 'confirm',
    props: { title: 'Confirm Action' },
  };

  const mockModal2: ModalConfig = {
    id: 'modal-2',
    type: 'form',
    props: { formId: 'test-form' },
  };

  describe('reducers', () => {
    it('should return the initial state', () => {
      const state = uiReducer(undefined, { type: 'unknown' });
      expect(state).toEqual(initialState);
    });

    // Sidebar tests
    describe('sidebar', () => {
      it('should handle toggleSidebar', () => {
        const state = uiReducer(undefined, toggleSidebar());
        expect(state.sidebar.isOpen).toBe(false);

        const state2 = uiReducer(state, toggleSidebar());
        expect(state2.sidebar.isOpen).toBe(true);
      });

      it('should handle setSidebarOpen', () => {
        const state = uiReducer(undefined, setSidebarOpen(false));
        expect(state.sidebar.isOpen).toBe(false);

        const state2 = uiReducer(state, setSidebarOpen(true));
        expect(state2.sidebar.isOpen).toBe(true);
      });

      it('should handle toggleSidebarCollapsed', () => {
        const state = uiReducer(undefined, toggleSidebarCollapsed());
        expect(state.sidebar.isCollapsed).toBe(true);

        const state2 = uiReducer(state, toggleSidebarCollapsed());
        expect(state2.sidebar.isCollapsed).toBe(false);
      });

      it('should handle setSidebarCollapsed', () => {
        const state = uiReducer(undefined, setSidebarCollapsed(true));
        expect(state.sidebar.isCollapsed).toBe(true);

        const state2 = uiReducer(state, setSidebarCollapsed(false));
        expect(state2.sidebar.isCollapsed).toBe(false);
      });
    });

    // Modal tests
    describe('modal', () => {
      it('should handle openModal', () => {
        const state = uiReducer(undefined, openModal(mockModal));
        expect(state.modal.isOpen).toBe(true);
        expect(state.modal.activeModal).toEqual(mockModal);
        expect(state.modal.modalStack).toEqual([mockModal]);
      });

      it('should handle opening multiple modals (stacking)', () => {
        let state = uiReducer(undefined, openModal(mockModal));
        state = uiReducer(state, openModal(mockModal2));

        expect(state.modal.isOpen).toBe(true);
        expect(state.modal.activeModal).toEqual(mockModal2);
        expect(state.modal.modalStack).toEqual([mockModal, mockModal2]);
      });

      it('should handle closeModal', () => {
        let state = uiReducer(undefined, openModal(mockModal));
        state = uiReducer(state, closeModal());

        expect(state.modal.isOpen).toBe(false);
        expect(state.modal.activeModal).toBeNull();
        expect(state.modal.modalStack).toEqual([]);
      });

      it('should handle closeModal with stacked modals', () => {
        let state = uiReducer(undefined, openModal(mockModal));
        state = uiReducer(state, openModal(mockModal2));
        state = uiReducer(state, closeModal());

        expect(state.modal.isOpen).toBe(true);
        expect(state.modal.activeModal).toEqual(mockModal);
        expect(state.modal.modalStack).toEqual([mockModal]);
      });

      it('should handle closeAllModals', () => {
        let state = uiReducer(undefined, openModal(mockModal));
        state = uiReducer(state, openModal(mockModal2));
        state = uiReducer(state, closeAllModals());

        expect(state.modal.isOpen).toBe(false);
        expect(state.modal.activeModal).toBeNull();
        expect(state.modal.modalStack).toEqual([]);
      });

      it('should handle closeModalById for active modal', () => {
        let state = uiReducer(undefined, openModal(mockModal));
        state = uiReducer(state, openModal(mockModal2));
        state = uiReducer(state, closeModalById('modal-2'));

        expect(state.modal.isOpen).toBe(true);
        expect(state.modal.activeModal).toEqual(mockModal);
        expect(state.modal.modalStack).toEqual([mockModal]);
      });

      it('should handle closeModalById for non-active modal', () => {
        let state = uiReducer(undefined, openModal(mockModal));
        state = uiReducer(state, openModal(mockModal2));
        state = uiReducer(state, closeModalById('modal-1'));

        expect(state.modal.isOpen).toBe(true);
        expect(state.modal.activeModal).toEqual(mockModal2);
        expect(state.modal.modalStack).toEqual([mockModal2]);
      });

      it('should handle closeModalById closing last modal', () => {
        let state = uiReducer(undefined, openModal(mockModal));
        state = uiReducer(state, closeModalById('modal-1'));

        expect(state.modal.isOpen).toBe(false);
        expect(state.modal.activeModal).toBeNull();
        expect(state.modal.modalStack).toEqual([]);
      });
    });

    // Theme tests
    describe('theme', () => {
      it('should handle setTheme', () => {
        const state = uiReducer(undefined, setTheme('dark'));
        expect(state.theme.current).toBe('dark');

        const state2 = uiReducer(state, setTheme('light'));
        expect(state2.theme.current).toBe('light');

        const state3 = uiReducer(state2, setTheme('system'));
        expect(state3.theme.current).toBe('system');
      });

      it('should handle setSystemPreference', () => {
        const state = uiReducer(undefined, setSystemPreference('dark'));
        expect(state.theme.systemPreference).toBe('dark');

        const state2 = uiReducer(state, setSystemPreference('light'));
        expect(state2.theme.systemPreference).toBe('light');
      });

      it('should handle toggleTheme from light', () => {
        let state = uiReducer(undefined, setTheme('light'));
        state = uiReducer(state, toggleTheme());
        expect(state.theme.current).toBe('dark');
      });

      it('should handle toggleTheme from dark', () => {
        let state = uiReducer(undefined, setTheme('dark'));
        state = uiReducer(state, toggleTheme());
        expect(state.theme.current).toBe('light');
      });

      it('should handle toggleTheme from system with light preference', () => {
        let state = uiReducer(undefined, setSystemPreference('light'));
        state = uiReducer(state, toggleTheme());
        expect(state.theme.current).toBe('dark');
      });

      it('should handle toggleTheme from system with dark preference', () => {
        let state = uiReducer(undefined, setSystemPreference('dark'));
        state = uiReducer(state, toggleTheme());
        expect(state.theme.current).toBe('light');
      });
    });
  });

  describe('selectors', () => {
    describe('sidebar selectors', () => {
      it('selectSidebarOpen should return sidebar open state', () => {
        expect(selectSidebarOpen({ ui: initialState })).toBe(true);
        const closedState = { ui: { ...initialState, sidebar: { ...initialState.sidebar, isOpen: false } } };
        expect(selectSidebarOpen(closedState)).toBe(false);
      });

      it('selectSidebarCollapsed should return sidebar collapsed state', () => {
        expect(selectSidebarCollapsed({ ui: initialState })).toBe(false);
        const collapsedState = { ui: { ...initialState, sidebar: { ...initialState.sidebar, isCollapsed: true } } };
        expect(selectSidebarCollapsed(collapsedState)).toBe(true);
      });

      it('selectSidebar should return full sidebar state', () => {
        expect(selectSidebar({ ui: initialState })).toEqual({
          isOpen: true,
          isCollapsed: false,
        });
      });
    });

    describe('modal selectors', () => {
      const stateWithModal: UIState = {
        ...initialState,
        modal: {
          isOpen: true,
          activeModal: mockModal,
          modalStack: [mockModal],
        },
      };

      it('selectModalOpen should return modal open state', () => {
        expect(selectModalOpen({ ui: initialState })).toBe(false);
        expect(selectModalOpen({ ui: stateWithModal })).toBe(true);
      });

      it('selectActiveModal should return active modal', () => {
        expect(selectActiveModal({ ui: initialState })).toBeNull();
        expect(selectActiveModal({ ui: stateWithModal })).toEqual(mockModal);
      });

      it('selectModalStack should return modal stack', () => {
        expect(selectModalStack({ ui: initialState })).toEqual([]);
        expect(selectModalStack({ ui: stateWithModal })).toEqual([mockModal]);
      });

      it('selectModal should return full modal state', () => {
        expect(selectModal({ ui: initialState })).toEqual({
          isOpen: false,
          activeModal: null,
          modalStack: [],
        });
      });
    });

    describe('theme selectors', () => {
      it('selectTheme should return current theme', () => {
        expect(selectTheme({ ui: initialState })).toBe('system');
        const darkState = { ui: { ...initialState, theme: { ...initialState.theme, current: 'dark' as const } } };
        expect(selectTheme(darkState)).toBe('dark');
      });

      it('selectSystemPreference should return system preference', () => {
        expect(selectSystemPreference({ ui: initialState })).toBe('light');
        const darkPreference = { ui: { ...initialState, theme: { ...initialState.theme, systemPreference: 'dark' as const } } };
        expect(selectSystemPreference(darkPreference)).toBe('dark');
      });

      it('selectEffectiveTheme should return system preference when theme is system', () => {
        expect(selectEffectiveTheme({ ui: initialState })).toBe('light');
        const darkPreference = { ui: { ...initialState, theme: { current: 'system' as const, systemPreference: 'dark' as const } } };
        expect(selectEffectiveTheme(darkPreference)).toBe('dark');
      });

      it('selectEffectiveTheme should return current theme when not system', () => {
        const darkTheme = { ui: { ...initialState, theme: { current: 'dark' as const, systemPreference: 'light' as const } } };
        expect(selectEffectiveTheme(darkTheme)).toBe('dark');

        const lightTheme = { ui: { ...initialState, theme: { current: 'light' as const, systemPreference: 'dark' as const } } };
        expect(selectEffectiveTheme(lightTheme)).toBe('light');
      });
    });
  });
});
