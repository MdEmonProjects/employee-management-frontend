import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

// Kept apart from the institute login token so both sessions can coexist.
export const SUPER_ADMIN_TOKEN_KEY = 'super_admin_token';

export function getSuperAdminToken() {
  try {
    return localStorage.getItem(SUPER_ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function clearSuperAdminToken() {
  try {
    localStorage.removeItem(SUPER_ADMIN_TOKEN_KEY);
  } catch {
    // Storage unavailable; nothing to clear.
  }
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${API_URL}/api/super-admin`,
  prepareHeaders: (headers) => {
    const token = getSuperAdminToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

const baseQuery = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  const isLogin = typeof args === 'object' && args.url === 'login';
  if (result.error?.status === 401 && !isLogin) {
    clearSuperAdminToken();
    window.location.assign('/super-admin/login');
  }
  return result;
};

export const superAdminQuerySlice = createApi({
  reducerPath: 'superAdminApi',
  baseQuery,
  tagTypes: ['Institute', 'Master'],
  endpoints: (builder) => ({
    superAdminLogin: builder.mutation({
      query: (body) => ({ url: 'login', method: 'POST', body }),
    }),
    getMasterStatus: builder.query({
      query: () => 'master/status',
      providesTags: ['Master'],
    }),
    setupMaster: builder.mutation({
      query: () => ({ url: 'master/setup', method: 'POST' }),
      invalidatesTags: ['Master', 'Institute'],
    }),
    getInstitutes: builder.query({
      query: () => 'institutes',
      providesTags: ['Institute'],
    }),
    createInstitute: builder.mutation({
      query: (body) => ({ url: 'institutes', method: 'POST', body }),
      invalidatesTags: ['Institute'],
    }),
  }),
});

export const {
  useSuperAdminLoginMutation,
  useGetMasterStatusQuery,
  useSetupMasterMutation,
  useGetInstitutesQuery,
  useCreateInstituteMutation,
} = superAdminQuerySlice;
