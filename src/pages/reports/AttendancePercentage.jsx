import { useRef, useState } from 'react';
import { useGetPercentageReportQuery } from '../../features/report/reportQuerySlice';
import {
  CalendarFields, ExportToolbar, PopulationFields, ReportPage, SheetFooter, SheetHeader, SheetPreview, StatusBlock,
} from '../../components/reports/reportKit';
import {
  banglaNumber, buttonClass, filterLabel, inputClass, primaryButtonClass, todayText, usePageSetup,
} from '../../components/reports/reportUtils';

const initial = () => {
  const end = todayText();
  return {
    startDate: `${end.slice(0, 8)}01`, endDate: end, threshold: '75', belowOnly: 'false',
    userType: '1', classId: '', sessionId: '', weeklyOff: '5', recordedDaysOnly: 'true',
  };
};

export default function AttendancePercentage() {
  const [draft, setDraft] = useState(initial);
  const [params, setParams] = useState(initial);
  const [setup, setSetup] = usePageSetup('percentage', { paper: 'A4', orientation: 'portrait' });
  const sheetRef = useRef(null);
  const { currentData: report, isFetching, isError, refetch } = useGetPercentageReportQuery(params);
  const isStudent = params.userType === '1';

  return (
    <ReportPage title="উপস্থিতির হার রিপোর্ট" description="নির্দিষ্ট সময়ে প্রত্যেকের উপস্থিতির শতাংশ। কারা নির্ধারিত সীমার নিচে আছে, তা সহজে বের করা যায়।">
      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 dark:border-slate-700 dark:bg-slate-900">
        <form onSubmit={(event) => { event.preventDefault(); setParams(draft); }} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
          <label className="text-sm font-medium">
            <span className="mb-1 block">শুরুর তারিখ</span>
            <input type="date" required max={todayText()} value={draft.startDate} onChange={(event) => setDraft({ ...draft, startDate: event.target.value })} className={inputClass} />
          </label>
          <label className="text-sm font-medium">
            <span className="mb-1 block">শেষ তারিখ</span>
            <input type="date" required min={draft.startDate} max={todayText()} value={draft.endDate} onChange={(event) => setDraft({ ...draft, endDate: event.target.value })} className={inputClass} />
          </label>
          <PopulationFields value={draft} onChange={setDraft} />
          <label className="text-sm font-medium">
            <span className="mb-1 block">ন্যূনতম উপস্থিতি (%)</span>
            <input type="number" min={0} max={100} required value={draft.threshold} onChange={(event) => setDraft({ ...draft, threshold: event.target.value })} className={inputClass} />
          </label>
          <label className="flex items-center gap-2 text-sm font-medium lg:pb-2">
            <input type="checkbox" checked={draft.belowOnly === 'true'} onChange={(event) => setDraft({ ...draft, belowOnly: String(event.target.checked) })} />
            শুধু সীমার নিচের ব্যক্তিরা
          </label>
          <CalendarFields value={draft} onChange={setDraft} />
          <div className="flex gap-2 lg:col-span-2 lg:justify-end">
            <button type="submit" className={primaryButtonClass}>দেখুন</button>
            <button type="button" onClick={refetch} disabled={isFetching} className={buttonClass}>হালনাগাদ</button>
          </div>
        </form>
        <div className="flex flex-wrap items-end justify-between gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
          {report ? (
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="rounded-lg bg-slate-100 px-3 py-1.5 dark:bg-slate-800">কর্মদিবস: {banglaNumber(report.workingDays)}</span>
              <span className="rounded-lg bg-slate-100 px-3 py-1.5 dark:bg-slate-800">গড় হার: {banglaNumber(report.summary.average)}%</span>
              <span className="rounded-lg bg-red-50 px-3 py-1.5 text-red-700 dark:bg-red-950/40 dark:text-red-300">{banglaNumber(report.threshold)}%-এর নিচে: {banglaNumber(report.summary.below)} / {banglaNumber(report.summary.total)} জন</span>
            </div>
          ) : <span />}
          <ExportToolbar setup={setup} onSetupChange={setSetup} sheetRef={sheetRef} kind="percentage" params={params} title={`attendance-percentage-${params.startDate}-${params.endDate}`} disabled={!report || isFetching} />
        </div>
      </section>

      <StatusBlock isError={isError} isFetching={isFetching} hasData={Boolean(report)} />
      {report && !isError && (
        <SheetPreview setup={setup} sheetRef={sheetRef}>
          <SheetHeader
            title={report.title}
            meta={`${banglaNumber(report.startDate)} থেকে ${banglaNumber(report.endDate)} · ${filterLabel(report.filters)}`}
          />
          <div className="rp-summary">
            <span>কর্মদিবস: {banglaNumber(report.workingDays)}</span>
            <span>গড় হার: {banglaNumber(report.summary.average)}%</span>
            <span>{banglaNumber(report.threshold)}%-এর নিচে: {banglaNumber(report.summary.below)} জন</span>
          </div>
          <table className="rp-table">
            <thead>
              <tr>
                <th>ক্রম</th>
                <th>আইডি</th>
                <th>নাম</th>
                {isStudent && <th>ক্লাস</th>}
                <th>কর্মদিবস</th>
                <th>উপস্থিত</th>
                <th>বিলম্ব</th>
                <th>অনুপস্থিত</th>
                <th>হার</th>
              </tr>
            </thead>
            <tbody>
              {report.rows.map((row, index) => (
                <tr key={row.userId} className={row.below ? 'rp-low' : ''}>
                  <td className="rp-num">{banglaNumber(index + 1)}</td>
                  <td className="rp-num">{banglaNumber(row.userCode ?? row.userId)}</td>
                  <td>{row.name}</td>
                  {isStudent && <td className="rp-c">{row.className || '—'}</td>}
                  <td className="rp-num">{banglaNumber(row.workingDays)}</td>
                  <td className="rp-num">{banglaNumber(row.present)}</td>
                  <td className="rp-num">{banglaNumber(row.late)}</td>
                  <td className="rp-num">{banglaNumber(row.absent)}</td>
                  <td className={`rp-num ${row.below ? 'rp-A' : ''}`}>{banglaNumber(row.percent)}%</td>
                </tr>
              ))}
              {report.rows.length === 0 && (
                <tr><td colSpan={isStudent ? 9 : 8} className="rp-empty">এই ফিল্টারে কোনো তথ্য নেই।</td></tr>
              )}
            </tbody>
          </table>
          <p className="rp-legend">লাল সারি = {banglaNumber(report.threshold)}%-এর নিচে। হার = উপস্থিত ÷ কর্মদিবস। সাপ্তাহিক ছুটি ও যেদিন কেউ হাজিরা দেয়নি সেদিন কর্মদিবস নয়।</p>
          <SheetFooter />
        </SheetPreview>
      )}
    </ReportPage>
  );
}
