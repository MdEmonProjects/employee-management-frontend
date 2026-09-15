import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout } from "../auth/authSlice";

const API_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

const normalizeDepartmentBody = (body) => {
  if (body.parentDepartmentId === undefined) return body;

  if (
    body.parentDepartmentId === null ||
    (typeof body.parentDepartmentId === "string" &&
      body.parentDepartmentId.trim() === "")
  ) {
    return { ...body, parentDepartmentId: null };
  }

  const normalizedParentId = Number(body.parentDepartmentId);

  return {
    ...body,
    parentDepartmentId: Number.isNaN(normalizedParentId)
      ? body.parentDepartmentId
      : normalizedParentId,
  };
};

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_URL}/api/department`,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const departmentSlice = createApi({
  reducerPath: "department",
  baseQuery: async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);

    if (result.error?.status === 401) {
      api.dispatch(logout());
    }

    return result;
  },
  tagTypes: ["Department"],
  endpoints: (builder) => ({
    getDepartments: builder.query({
      query: () => "/",
      providesTags: ["Department"],
    }),
    createDepartment: builder.mutation({
      query: (body) => ({
        url: "/",
        method: "POST",
        body: normalizeDepartmentBody(body),
      }),
      invalidatesTags: ["Department"],
    }),
    updateDepartment: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: "PATCH",
        body: normalizeDepartmentBody(body),
      }),
      invalidatesTags: ["Department"],
    }),
    deleteDepartment: builder.mutation({
      query: (id) => ({ url: `/${id}`, method: "DELETE" }),
      invalidatesTags: ["Department"],
    }),
  }),
});

export const {
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} = departmentSlice;
