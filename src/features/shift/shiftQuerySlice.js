import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_SERVER_URL;


export const shiftQuerySlice = createApi({
  reducerPath: 'shift',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/timesettings`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['ShiftList', 'TimeCheckList', 'TimeSwitchs', 'TimeShiftAssignments'],
  endpoints: (builder) => ({
    // GET endpoints
    getShiftList: builder.query({
      query: () => 'view_shift',
      providesTags: ['ShiftList'],
    }),
    createShift: builder.mutation({
      query: (data) => ({
        url: 'insert_shift',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ShiftList'],

    }),
    updateShift: builder.mutation({
      query: (data) => ({
        url: `update_shift/${data.id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['ShiftList'],
    }),
    getSingleShift: builder.query({
      query: (id) => `single_shift/${id}`,
      providesTags: (result, error, id) => [{ type: 'ShiftList', id }],
    }),
    createTimeCheck: builder.mutation({
      query: (data) => ({
        url: 'insert_timecheck',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['TimeCheckList'],

    }),
    getTimeCheckList: builder.query({
      query: () => 'view_timecheck',
      providesTags: ['TimeCheckList'],
    }),
    getSingleTimeCheck: builder.query({
      query: (id) => `single_timecheck/${id}`,
      providesTags: (result, error, id) => [{ type: 'TimeCheckList', id }],
    }),
    updateTimeCheck: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `update_timecheck/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['TimeCheckList'],
    }),

    // time_switch
    getTimeSwitchs: builder.query({
      query: () => `view_time_switch`,
      providesTags: ["TimeSwitchs"],
    }),
    createTimeSwitch: builder.mutation({
      query: (data) => ({
        url: 'create_time_switch',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['TimeSwitchs'],

    }),
    updateTimeSwitch: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `update_time_switch/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['TimeSwitchs'],
    }),
    deleteTimeSwitch: builder.mutation({
      query: (id) => ({
        url: `delete_time_switch/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TimeSwitchs'],
    }),
    getTimeShiftAssignmentOptions: builder.query({
      query: () => 'time_shift_assignment_options',
    }),
    getTimeShiftAssignments: builder.query({
      query: ({ SessionID, SubClassID, ShiftID }) => ({
        url: 'view_time_shift_assignments',
        params: { SessionID, SubClassID, ShiftID },
      }),
      providesTags: ['TimeShiftAssignments'],
    }),
    assignTimeShift: builder.mutation({
      query: (data) => ({
        url: 'assign_time_shift',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['TimeShiftAssignments'],
    }),
    removeTimeShiftAssignment: builder.mutation({
      query: (data) => ({
        url: 'remove_time_shift_assignment',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['TimeShiftAssignments'],
    }),

  }),
});

// Export all hooks
export const {
  useGetShiftListQuery,
  useCreateShiftMutation,
  useUpdateShiftMutation,
  useGetSingleShiftQuery,
  useCreateTimeCheckMutation,
  useGetTimeCheckListQuery,
  useGetSingleTimeCheckQuery,
  useUpdateTimeCheckMutation,
  useGetTimeSwitchsQuery,
  useCreateTimeSwitchMutation,
  useUpdateTimeSwitchMutation,
  useDeleteTimeSwitchMutation,
  useGetTimeShiftAssignmentOptionsQuery,
  useGetTimeShiftAssignmentsQuery,
  useAssignTimeShiftMutation,
  useRemoveTimeShiftAssignmentMutation,

} = shiftQuerySlice;
