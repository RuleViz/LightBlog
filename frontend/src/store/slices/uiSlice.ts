import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  loading: boolean;
  error: string | null;
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  currentPage: string;
}

const initialState: UIState = {
  loading: false,
  error: null,
  sidebarCollapsed: false,
  theme: 'light',
  currentPage: 'home',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<string>) => {
      state.currentPage = action.payload;
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  toggleSidebar,
  setSidebarCollapsed,
  setTheme,
  setCurrentPage,
} = uiSlice.actions;

export default uiSlice.reducer;
