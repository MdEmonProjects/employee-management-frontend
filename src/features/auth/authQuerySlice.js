import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${API_URL}/api/auth` }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (body) => ({ url: '/login', method: 'POST', body }),
    }),
  }),
});

export const { useLoginMutation } = authApi;