import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_SERVER_URL;

export const guardianQuerySlice = createApi({
  reducerPath: 'guardians',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/guardians`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Guardians', 'Relations'],
  endpoints: (builder) => ({
    getGuardians: builder.query({
      query: () => '',
      providesTags: ['Guardians'],
    }),
    getGuardianRelations: builder.query({
      query: () => 'relations',
      providesTags: ['Relations'],
    }),
    searchGuardianStudents: builder.query({
      query: ({ search, ClassID, SessionID }) => ({
        url: 'students',
        params: {
          ...(search && { search }),
          ...(ClassID && { ClassID }),
          ...(SessionID && { SessionID }),
        },
      }),
    }),
    createGuardianRelation: builder.mutation({
      query: (name) => ({ url: 'relations', method: 'POST', body: { name } }),
      invalidatesTags: ['Relations'],
    }),
    saveGuardianLinks: builder.mutation({
      query: (body) => ({ url: 'links', method: 'POST', body }),
      invalidatesTags: ['Guardians'],
    }),
    removeGuardianLink: builder.mutation({
      query: (id) => ({ url: `links/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Guardians'],
    }),
  }),
});

export const {
  useGetGuardiansQuery,
  useGetGuardianRelationsQuery,
  useSearchGuardianStudentsQuery,
  useCreateGuardianRelationMutation,
  useSaveGuardianLinksMutation,
  useRemoveGuardianLinkMutation,
} = guardianQuerySlice;
