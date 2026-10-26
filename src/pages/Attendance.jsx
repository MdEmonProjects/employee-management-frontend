import AttendanceRecords from '../components/AttendanceRecords';
import { useGetShiftListQuery, useGetTimeCheckListQuery } from '../features/shift/shiftQuerySlice';

export default function Attendance() {
  const { data: shifts } = useGetShiftListQuery();
  const { data: checkTypes } = useGetTimeCheckListQuery();

  return (
    <div className="min-h-full w-full min-w-0 space-y-4 overflow-x-hidden bg-slate-100 p-3 text-slate-900 sm:p-4 dark:bg-slate-950 dark:text-slate-100">
      <div>
        <h1 className="text-xl font-semibold">উপস্থিতির রেকর্ড</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">ব্যবহারকারীর পাঞ্চের সময় ও উপস্থিতির বিবরণ দেখুন।</p>
      </div>
      <AttendanceRecords shifts={shifts ?? []} checkTypes={checkTypes ?? []} />
    </div>
  );
}
