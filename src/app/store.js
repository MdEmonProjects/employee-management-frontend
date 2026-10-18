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
import { shiftQuerySlice } from '../features/shift/shiftQuerySlice';
import { attendanceQuerySlice } from '../features/attendance/attendanceQuerySlice';
import { institutionQuerySlice } from '../features/institution/institutionQuerySlice';

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
    [shiftQuerySlice.reducerPath]: shiftQuerySlice.reducer,
    [attendanceQuerySlice.reducerPath]: attendanceQuerySlice.reducer,
    [institutionQuerySlice.reducerPath]: institutionQuerySlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(departmentQuerySlice.middleware)
      .concat(authQuerySlice.middleware)
      .concat(classQuerySlice.middleware)
      .concat(sessionQuerySlice.middleware)
      .concat(userQuerySlice.middleware)
      .concat(shiftQuerySlice.middleware)
      .concat(attendanceQuerySlice.middleware)
      .concat(institutionQuerySlice.middleware),
});

export default store;
