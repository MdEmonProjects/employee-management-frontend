import { useRef, useState } from 'react';
import { useGetMonthlyReportQuery } from '../../features/report/reportQuerySlice';
import {
  CalendarFields, ExportToolbar, PopulationFields, ReportPage, SheetFooter, SheetHeader, SheetPreview, StatusBlock,
} from '../../components/reports/reportKit';
import {
  MONTHS, banglaNumber, buttonClass, filterLabel, inputClass, primaryButtonClass, usePageSetup,
} from '../../components/reports/reportUtils';

const MARK = { P: 'উ', L: 'বি', A: 'অ', O: 'ছু', H: '', '': '' };

const initial = () => {
  const now = new Date();
  return {
    year: String(now.getFullYear()), month: String(now.getMonth() + 1),
    userType: '1', classId: '', sessionId: '', weeklyOff: '5', recordedDaysOnly: 'true',
  };
};

export default function MonthlyRegister() {
  const [draft, setDraft] = useState(initial);
  const [params, setParams] = useState(initial);
  const [setup, setSetup] = usePageSetup('monthly', { paper: 'A4', orientation: 'landscape' });
  const sheetRef = useRef(null);
  const { currentData: report, isFetching, isError, refetch } = useGetMonthlyReportQuery(params);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, index) => currentYear - index);

  return (
    <ReportPage title="মাসিক হাজিরা রেজিস্টার" description="মাসের প্রতিটি দিনের উপস্থিতি, বিলম্ব ও অনুপস্থিতি এক নজরে, হাজিরা খাতার মতো।">
      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 dark:border-slate-700 dark:bg-slate-900">
        <form onSubmit={(event) => { event.preventDefault(); setParams(draft); }} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
          <label className="text-sm font-medium">
            <span className="mb-1 block">মাস</span>
            <select value={draft.month} onChange={(event) => setDraft({ ...draft, month: event.target.value })} className={inputClass}>
              {MONTHS.map((name, index) => <option key={name} value={index + 1}>{name}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium">
            <span className="mb-1 block">বছর</span>
            <select value={draft.year} onChange={(event) => setDraft({ ...draft, year: event.target.value })} className={inputClass}>
              {years.map((year) => <option key={year} value={year}>{banglaNumber(year)}</option>)}
            </select>
          </label>
          <PopulationFields value={draft} onChange={setDraft} />
          <CalendarFields value={draft} onChange={setDraft} />
          <div className="flex gap-2 lg:col-span-2 lg:justify-end">
            <button type="submit" className={primaryButtonClass}>দেখুন</button>
            <button type="button" onClick={refetch} disabled={isFetching} className={buttonClass}>হালনাগাদ</button>
          </div>
        </form>
        <div className="flex flex-wrap items-end justify-between gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {report ? `কর্মদিবস: ${banglaNumber(report.workingDays)} · ব্যক্তি: ${banglaNumber(report.rows.length)}` : ''}
            <span className="block">পরামর্শ: ৩১ দিনের রেজিস্টারের জন্য A4 ল্যান্ডস্কেপ সবচেয়ে ভালো।</span>
          </p>
          <ExportToolbar setup={setup} onSetupChange={setSetup} sheetRef={sheetRef} kind="monthly" params={params} title={`monthly-register-${params.year}-${params.month}`} disabled={!report || isFetching} />
        </div>
      </section>

      <StatusBlock isError={isError} isFetching={isFetching} hasData={Boolean(report)} />
      {report && !isError && (
        <SheetPreview setup={setup} sheetRef={sheetRef}>
          <SheetHeader
            title={report.title}
            meta={`${report.monthName} ${banglaNumber(report.year)} · ${filterLabel(report.filters)} · কর্মদিবস: ${banglaNumber(report.workingDays)}`}
          />
          <table className="rp-table rp-register">
            <thead>
              <tr>
                <th>ক্রম</th>
                <th>আইডি</th>
                <th className="rp-name">নাম</th>
                {report.days.map((day) => (
                  <th key={day.date} className={day.kind === 'working' ? '' : 'rp-off'}>
                    {banglaNumber(day.day)}<br /><span className="rp-muted">{day.weekday}</span>
                  </th>
                ))}
                <th>উপ</th>
                <th>বি</th>
                <th>অনু</th>
                <th>%</th>
              </tr>
            </thead>
            <tbody>
              {report.rows.map((row, index) => (
                <tr key={row.userId}>
                  <td>{banglaNumber(index + 1)}</td>
                  <td>{banglaNumber(row.userCode ?? row.userId)}</td>
                  <td className="rp-name">{row.name}</td>
                  {row.marks.map((mark, dayIndex) => (
                    <td key={report.days[dayIndex].date} className={`${report.days[dayIndex].kind === 'working' ? '' : 'rp-off'} ${mark === 'A' || mark === 'L' ? `rp-${mark}` : ''}`}>
                      {MARK[mark]}
                    </td>
                  ))}
                  <td>{banglaNumber(row.present)}</td>
                  <td>{banglaNumber(row.late)}</td>
                  <td>{banglaNumber(row.absent)}</td>
                  <td>{banglaNumber(row.percent)}</td>
                </tr>
              ))}
              {report.rows.length === 0 && (
                <tr><td colSpan={report.days.length + 7} className="rp-empty">এই ফিল্টারে কোনো ব্যক্তি নেই।</td></tr>
              )}
            </tbody>
          </table>
          <p className="rp-legend">সংকেত: উ = উপস্থিত, বি = বিলম্বে উপস্থিত, অ = অনুপস্থিত, ছু = সাপ্তাহিক ছুটি, ধূসর ঘর = কর্মদিবস নয়। ছুটির দিনের হাজিরা শতাংশে ধরা হয়নি।</p>
          <SheetFooter />
        </SheetPreview>
      )}
    </ReportPage>
  );
}
