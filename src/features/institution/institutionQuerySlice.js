import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

export const institutionQuerySlice = createApi({
  reducerPath: 'institutionApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/institution-information`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Institution'],
  endpoints: (builder) => ({
    getCurrentInstitution: builder.query({
      query: () => 'current',
      providesTags: (result) =>
        result ? [{ type: 'Institution', id: result.ID }, 'Institution'] : ['Institution'],
    }),
    getInstitutions: builder.query({
      query: () => '',
      providesTags: (result = []) => [
        'Institution',
        ...result.map(({ ID }) => ({ type: 'Institution', id: ID })),
      ],
    }),
    getInstitution: builder.query({
      query: (id) => `${id}`,
      providesTags: (result, error, id) => [{ type: 'Institution', id }],
    }),
    addInstitution: builder.mutation({
      query: (body) => ({ url: '', method: 'POST', body }),
      invalidatesTags: ['Institution'],
    }),
    updateInstitution: builder.mutation({
      query: ({ id, data }) => ({ url: `${id}`, method: 'PUT', body: data }),
      invalidatesTags: (result, error, { id }) => [
        'Institution',
        { type: 'Institution', id },
      ],
    }),
    patchInstitution: builder.mutation({
      query: ({ id, data }) => ({ url: `${id}`, method: 'PATCH', body: data }),
      invalidatesTags: (result, error, { id }) => [
        'Institution',
        { type: 'Institution', id },
      ],
    }),
    uploadInstitutionLogo: builder.mutation({
      query: ({ id, file }) => {
        const body = new FormData();
        body.append('logo', file);
        return { url: `${id}/logo`, method: 'POST', body };
      },
      invalidatesTags: (result, error, { id }) => [
        'Institution',
        { type: 'Institution', id },
      ],
    }),
    deleteInstitution: builder.mutation({
      query: (id) => ({ url: `${id}`, method: 'DELETE' }),
      invalidatesTags: ['Institution'],
    }),
  }),
});

export const {
  useGetCurrentInstitutionQuery,
  useGetInstitutionsQuery,
  useGetInstitutionQuery,
  useAddInstitutionMutation,
  useUpdateInstitutionMutation,
  usePatchInstitutionMutation,
  useUploadInstitutionLogoMutation,
  useDeleteInstitutionMutation,
} = institutionQuerySlice;
