import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_SERVER_URL;

export const userQuerySlice = createApi({
  reducerPath: 'user',
  tagTypes: ['UserList'],
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/users`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getSingleUser: builder.query({
      query: (userId) => `get_single_user/${userId}`,
      providesTags: (result, error, userId) => [{ type: 'UserList', id: userId }],
    }),

    createUser: builder.mutation({
      query: (data) => ({
        url: 'insert_user_info',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'UserList', id: 'LIST' }],
    }),

    getUserBySearch: builder.query({
      query: ({ search, ClassID, SessionID } = {}) => {
        const params = new URLSearchParams();
        if (search) {
          params.append('search', search);
        }
        if (ClassID) params.append('ClassID', ClassID);
        if (SessionID) params.append('SessionID', SessionID);
        return `search_user?${params.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              { type: 'UserList', id: 'LIST' },
              ...result.map(({ UserID }) => ({ type: 'UserList', id: UserID })),
            ]
          : [{ type: 'UserList', id: 'LIST' }],
    }),

    updateUser: builder.mutation({
      query: ({ id, data }) => ({
        url: `update_user_info/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'UserList', id: 'LIST' },
        { type: 'UserList', id },
      ],
    }),

  }),
});

export const {
  useGetSingleUserQuery,
  useCreateUserMutation,
  useGetUserBySearchQuery,
  useUpdateUserMutation,
} = userQuerySlice;
