import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

export const authQuerySlice = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${API_URL}/api/users` }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (body) => ({ url: '/login', method: 'POST', body }),
    }),
  }),
});

export const { useLoginMutation } = authQuerySlice;