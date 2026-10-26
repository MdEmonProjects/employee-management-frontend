import { useState } from 'react';
import { useGetAttendanceRecordsQuery } from '../features/attendance/attendanceQuerySlice';

const todayText = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString().slice(0, 10);
};

const initialFilters = () => ({
  startDate: todayText(), endDate: todayText(), search: '', shiftId: '', checkTypeId: '',
});

const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100';
const cellClass = 'whitespace-nowrap px-3 py-3 text-left';
const banglaNumber = (value) => String(value).replace(/\d/g, (digit) => '০১২৩৪৫৬৭৮৯'[Number(digit)]);

const formatPunchTime = (value) => {
  if (!value) return '—';
  const match = value.match(/^(\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!match) return value;
  const hours = Number(match[1]);
  const time = `${String(hours % 12 || 12).padStart(2, '0')}:${match[2]}${match[3] ? `:${match[3]}` : ''}`;
  return `${banglaNumber(time)} ${hours >= 12 ? 'অপরাহ্ণ' : 'পূর্বাহ্ণ'}`;
};

const formatCheckType = (value) => {
  const labels = {
    in: 'প্রবেশ', checkin: 'প্রবেশ', 'check in': 'প্রবেশ', entry: 'প্রবেশ',
    out: 'প্রস্থান', checkout: 'প্রস্থান', 'check out': 'প্রস্থান', exit: 'প্রস্থান',
  };
  return labels[String(value || '').trim().toLowerCase()] || value || '—';
};

export default function AttendanceRecords({ shifts = [], checkTypes = [] }) {
  const [draft, setDraft] = useState(initialFilters);
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const { currentData: data, isFetching, isError, refetch } = useGetAttendanceRecordsQuery({
    ...filters, page,
  }, { refetchOnFocus: true, refetchOnReconnect: true });

  const updateDraft = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const applyFilters = (event) => {
    event.preventDefault();
    setPage(1);
    setFilters({ ...draft, search: draft.search.trim() });
  };
  const clearFilters = () => {
    const next = initialFilters();
    setDraft(next);
    setFilters(next);
    setPage(1);
  };
  const records = data?.records ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / (data?.pageSize || 25)));

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold">ব্যবহারকারীর উপস্থিতির সময়</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">শুরু ও শেষ তারিখ, ব্যবহারকারী, শিফট এবং পাঞ্চের ধরন দিয়ে রেকর্ড খুঁজুন।</p>
        </div>
        <button type="button" onClick={refetch} disabled={isFetching} className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-800">
          হালনাগাদ
        </button>
      </div>

      <form onSubmit={applyFilters} className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-[minmax(140px,1fr)_minmax(140px,1fr)_minmax(200px,1.5fr)_minmax(140px,1fr)_minmax(140px,1fr)_auto] 2xl:items-end">
        <label className="text-sm font-medium">
          <span className="mb-1 block">শুরুর তারিখ</span>
          <input type="date" required max={todayText()} value={draft.startDate} onChange={(event) => updateDraft('startDate', event.target.value)} className={inputClass} />
        </label>
        <label className="text-sm font-medium">
          <span className="mb-1 block">শেষ তারিখ</span>
          <input type="date" required min={draft.startDate} max={todayText()} value={draft.endDate} onChange={(event) => updateDraft('endDate', event.target.value)} className={inputClass} />
        </label>
        <label className="text-sm font-medium">
          <span className="mb-1 block">ব্যবহারকারী</span>
          <input type="search" maxLength={100} placeholder="নাম, আইডি বা কার্ড নম্বর" value={draft.search} onChange={(event) => updateDraft('search', event.target.value)} className={inputClass} />
        </label>
        <label className="text-sm font-medium">
          <span className="mb-1 block">শিফট</span>
          <select value={draft.shiftId} onChange={(event) => updateDraft('shiftId', event.target.value)} className={inputClass}>
            <option value="">সব শিফট</option>
            {shifts.map((shift) => <option key={shift.ID} value={shift.ID}>{shift.ShiftNameBangla || shift.ShiftNameEnglish || `শিফট #${shift.ID}`}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium">
          <span className="mb-1 block">পাঞ্চের ধরন</span>
          <select value={draft.checkTypeId} onChange={(event) => updateDraft('checkTypeId', event.target.value)} className={inputClass}>
            <option value="">সব ধরন</option>
            {checkTypes.map((type) => <option key={type.ID} value={type.ID}>{type.TypeNameBangla || type.TypeNameEnglish || `ধরন #${type.ID}`}</option>)}
          </select>
        </label>
        <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
          <button type="submit" className="rounded-lg bg-clay px-4 py-2 text-sm font-medium text-white hover:bg-clay-dark">খুঁজুন</button>
          <button type="button" onClick={clearFilters} className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800">রিসেট</button>
        </div>
      </form>

      {isError ? (
        <div className="rounded-lg bg-red-50 px-4 py-8 text-center text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">উপস্থিতির তথ্য লোড করা যায়নি। আবার চেষ্টা করুন।</div>
      ) : isFetching && !data ? (
        <div className="px-4 py-8 text-center text-sm text-slate-500">উপস্থিতির তথ্য লোড হচ্ছে...</div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <tr>
                  {['তারিখ', 'ব্যবহারকারী', 'পাঞ্চের সময়', 'নির্ধারিত সময়', 'দেরির সীমা', 'ধরন', 'শিফট', 'ডিভাইস', 'অবস্থা'].map((heading) => <th key={heading} scope="col" className={cellClass}>{heading}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className={cellClass}>{banglaNumber(record.date || '—')}</td>
                    <td className={cellClass}>
                      <span className="font-medium">{record.userName}</span>
                      <span className="block text-xs text-slate-500 dark:text-slate-400">আইডি: {banglaNumber(record.userCode ?? record.userId ?? '—')}{record.cardNumber ? ` · কার্ড: ${record.cardNumber}` : ''}</span>
                      {record.linkedStudentName && <span className="block text-xs text-slate-500 dark:text-slate-400">শিক্ষার্থী: {record.linkedStudentName}</span>}
                    </td>
                    <td className={`${cellClass} font-semibold tabular-nums`}>{formatPunchTime(record.punchTime)}</td>
                    <td className={`${cellClass} tabular-nums`}>{formatPunchTime(record.scheduledTime)}</td>
                    <td className={`${cellClass} tabular-nums`}>{formatPunchTime(record.lateAfter)}</td>
                    <td className={cellClass}>{formatCheckType(record.checkType)}</td>
                    <td className={cellClass}>{record.shiftName || '—'}</td>
                    <td className={cellClass}>{record.deviceName || '—'}</td>
                    <td className={cellClass}>{record.scheduledTime ? (record.status === 'late' ? 'বিলম্বিত' : 'সময়মতো') : 'নির্ধারিত নয়'}</td>
                  </tr>
                ))}
                {records.length === 0 && <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-500">এই ফিল্টারে কোনো উপস্থিতির রেকর্ড নেই।</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
            <span>মোট রেকর্ড: {banglaNumber(total)}</span>
            <div className="flex items-center gap-3">
              <button type="button" disabled={page <= 1 || isFetching} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40 dark:border-slate-600">আগের</button>
              <span>পৃষ্ঠা {banglaNumber(page)} / {banglaNumber(pageCount)}</span>
              <button type="button" disabled={page >= pageCount || isFetching} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40 dark:border-slate-600">পরের</button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
