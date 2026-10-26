import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

export const attendanceQuerySlice = createApi({
  reducerPath: 'attendance',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/attendance`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getLiveAttendance: builder.query({
      query: ({ date, limit = 500 }) => ({
        url: 'live',
        params: { date, limit },
      }),
    }),
    getAttendanceRecords: builder.query({
      query: ({ startDate, endDate, search, shiftId, checkTypeId, page }) => ({
        url: 'records',
        params: { startDate, endDate, search, shiftId, checkTypeId, page },
      }),
    }),
  }),
});

export const { useGetLiveAttendanceQuery, useGetAttendanceRecordsQuery } = attendanceQuerySlice;
