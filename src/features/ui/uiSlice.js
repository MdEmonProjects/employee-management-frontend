import { createSlice } from '@reduxjs/toolkit';

export const SIDEBAR_MIN_WIDTH = 200;
export const SIDEBAR_MAX_WIDTH = 420;
export const SIDEBAR_DEFAULT_WIDTH = 260;

const storedWidth = Number(localStorage.getItem('sidebar_width'));

const initialState = {
  // Mobile: whether the sidebar drawer is open (overlay).
  mobileSidebarOpen: false,
  // Desktop: whether the sidebar is minimized to icon-only rail.
  sidebarCollapsed: false,
  // Desktop: current drag-resized width in px (icon rail width is separate/fixed).
  sidebarWidth:
    storedWidth >= SIDEBAR_MIN_WIDTH && storedWidth <= SIDEBAR_MAX_WIDTH
      ? storedWidth
      : SIDEBAR_DEFAULT_WIDTH,
  isResizingSidebar: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openMobileSidebar: (state) => {
      state.mobileSidebarOpen = true;
    },
    closeMobileSidebar: (state) => {
      state.mobileSidebarOpen = false;
    },
    toggleSidebarCollapsed: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarWidth: (state, action) => {
      const clamped = Math.min(
        SIDEBAR_MAX_WIDTH,
        Math.max(SIDEBAR_MIN_WIDTH, action.payload)
      );
      state.sidebarWidth = clamped;
      localStorage.setItem('sidebar_width', String(clamped));
    },
    resetSidebarWidth: (state) => {
      state.sidebarWidth = SIDEBAR_DEFAULT_WIDTH;
      localStorage.setItem('sidebar_width', String(SIDEBAR_DEFAULT_WIDTH));
    },
    setResizingSidebar: (state, action) => {
      state.isResizingSidebar = action.payload;
    },
  },
});

export const {
  openMobileSidebar,
  closeMobileSidebar,
  toggleSidebarCollapsed,
  setSidebarWidth,
  resetSidebarWidth,
  setResizingSidebar,
} = uiSlice.actions;
export default uiSlice.reducer;
