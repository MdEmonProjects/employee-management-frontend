import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import chatReducer from '../features/chat/chatSlice';
import uiReducer from '../features/ui/uiSlice';
import modalReducer from '../features/modal/modalSlice';
import { departmentSlice } from '../features/department/departmentQuerySlice';
import { authApi } from '../features/auth/authQuerySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    ui: uiReducer,
    modal: modalReducer,
    [departmentSlice.reducerPath]: departmentSlice.reducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(departmentSlice.middleware)
      .concat(authApi.middleware),
});

export default store;
