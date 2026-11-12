import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
const REPORT_URL = `${API_URL}/api/reports`;

const cleanParams = (params) =>
  Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== null));

export const reportQuerySlice = createApi({
  reducerPath: 'reports',
  baseQuery: fetchBaseQuery({
    baseUrl: REPORT_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getAbsentReport: builder.query({ query: (params) => ({ url: 'absent', params: cleanParams(params) }) }),
    getMonthlyReport: builder.query({ query: (params) => ({ url: 'monthly', params: cleanParams(params) }) }),
    getPercentageReport: builder.query({ query: (params) => ({ url: 'percentage', params: cleanParams(params) }) }),
  }),
});

export const {
  useGetAbsentReportQuery,
  useGetMonthlyReportQuery,
  useGetPercentageReportQuery,
} = reportQuerySlice;

/** Downloads the Excel version of a report with the chosen paper size and orientation. */
export async function downloadReportExcel(kind, params, { paper, orientation }) {
  const search = new URLSearchParams(cleanParams({ ...params, format: 'xlsx', paper, orientation }));
  const response = await fetch(`${REPORT_URL}/${kind}?${search}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` },
  });
  if (!response.ok) throw new Error(`Export failed (${response.status})`);
  const disposition = response.headers.get('Content-Disposition') || '';
  const fileName = disposition.match(/filename="([^"]+)"/)?.[1] || `${kind}-report.xlsx`;
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
