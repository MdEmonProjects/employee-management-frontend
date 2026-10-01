import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import chatReducer from '../features/chat/chatSlice';
import uiReducer from '../features/ui/uiSlice';
import modalReducer from '../features/modal/modalSlice';
import { departmentQuerySlice } from '../features/department/departmentQuerySlice';
import { authQuerySlice } from '../features/auth/authQuerySlice';
import { classQuerySlice } from '../features/class/classQuerySlice';
import { sessionQuerySlice } from '../features/session/sessionQuerySlice';
import { userQuerySlice } from '../features/user/userQuerySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    ui: uiReducer,
    modal: modalReducer,
    [departmentQuerySlice.reducerPath]: departmentQuerySlice.reducer,
    [authQuerySlice.reducerPath]: authQuerySlice.reducer,
    [classQuerySlice.reducerPath]: classQuerySlice.reducer,
    [sessionQuerySlice.reducerPath]: sessionQuerySlice.reducer,
    [userQuerySlice.reducerPath]: userQuerySlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(departmentQuerySlice.middleware)
      .concat(authQuerySlice.middleware)
      .concat(classQuerySlice.middleware)
      .concat(sessionQuerySlice.middleware)
      .concat(userQuerySlice.middleware),
});

export default store;
