import { useRef, useState } from 'react';
import { useGetAbsentReportQuery } from '../../features/report/reportQuerySlice';
import {
  ExportToolbar, PopulationFields, ReportPage, SheetFooter, SheetHeader, SheetPreview, StatusBlock,
} from '../../components/reports/reportKit';
import {
  banglaNumber, buttonClass, filterLabel, inputClass, primaryButtonClass, todayText, usePageSetup,
} from '../../components/reports/reportUtils';

const initial = () => ({ date: todayText(), userType: '1', classId: '', sessionId: '' });

export default function AbsentReport() {
  const [draft, setDraft] = useState(initial);
  const [params, setParams] = useState(initial);
  const [setup, setSetup] = usePageSetup('absent', { paper: 'A4', orientation: 'portrait' });
  const sheetRef = useRef(null);
  const { currentData: report, isFetching, isError, refetch } = useGetAbsentReportQuery(params, { refetchOnFocus: true });
  const isStudent = params.userType === '1';

  return (
    <ReportPage title="দৈনিক অনুপস্থিতি তালিকা" description="নির্দিষ্ট দিনে যারা কোনো হাজিরা দেয়নি, তাদের তালিকা ও অভিভাবকের মোবাইল নম্বর।">
      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 dark:border-slate-700 dark:bg-slate-900">
        <form onSubmit={(event) => { event.preventDefault(); setParams(draft); }} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
          <label className="text-sm font-medium">
            <span className="mb-1 block">তারিখ</span>
            <input type="date" required max={todayText()} value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} className={inputClass} />
          </label>
          <PopulationFields value={draft} onChange={setDraft} />
          <div className="flex gap-2">
            <button type="submit" className={primaryButtonClass}>দেখুন</button>
            <button type="button" onClick={refetch} disabled={isFetching} className={buttonClass}>হালনাগাদ</button>
          </div>
        </form>
        <div className="flex flex-wrap items-end justify-between gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
          {report ? (
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="rounded-lg bg-slate-100 px-3 py-1.5 dark:bg-slate-800">মোট: {banglaNumber(report.summary.total)}</span>
              <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">উপস্থিত: {banglaNumber(report.summary.present)}</span>
              <span className="rounded-lg bg-red-50 px-3 py-1.5 text-red-700 dark:bg-red-950/40 dark:text-red-300">অনুপস্থিত: {banglaNumber(report.summary.absent)}</span>
            </div>
          ) : <span />}
          <ExportToolbar setup={setup} onSetupChange={setSetup} sheetRef={sheetRef} kind="absent" params={params} title={`absent-${params.date}`} disabled={!report || isFetching} />
        </div>
        {report && !report.hasAttendance && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">এই তারিখে কোনো হাজিরা পাওয়া যায়নি। দিনটি ছুটি হতে পারে, অথবা ডিভাইস থেকে ডেটা এখনও sync হয়নি।</p>
        )}
      </section>

      <StatusBlock isError={isError} isFetching={isFetching} hasData={Boolean(report)} />
      {report && !isError && (
        <SheetPreview setup={setup} sheetRef={sheetRef}>
          <SheetHeader
            title={report.title}
            meta={`তারিখ: ${banglaNumber(report.date)} (${report.weekday}) · ${filterLabel(report.filters)}`}
          />
          <div className="rp-summary">
            <span>মোট: {banglaNumber(report.summary.total)}</span>
            <span>উপস্থিত: {banglaNumber(report.summary.present)}</span>
            <span>অনুপস্থিত: {banglaNumber(report.summary.absent)}</span>
          </div>
          <table className="rp-table">
            <thead>
              <tr>
                <th>ক্রম</th>
                <th>আইডি</th>
                <th>নাম</th>
                {isStudent && <th>ক্লাস</th>}
                <th>মোবাইল</th>
                {isStudent && <th>অভিভাবক ও মোবাইল</th>}
              </tr>
            </thead>
            <tbody>
              {report.rows.map((row, index) => (
                <tr key={row.userId}>
                  <td className="rp-num">{banglaNumber(index + 1)}</td>
                  <td className="rp-num">{banglaNumber(row.userCode ?? row.userId)}</td>
                  <td>{row.name}</td>
                  {isStudent && <td className="rp-c">{row.className || '—'}</td>}
                  <td className="rp-num">{row.mobile || '—'}</td>
                  {isStudent && (
                    <td>
                      {row.guardians.length === 0 ? '—' : row.guardians.map((guardian, guardianIndex) => (
                        <div key={guardianIndex}>
                          {guardian.name}{guardian.relation && <span className="rp-muted"> ({guardian.relation})</span>}
                          {guardian.mobile && <span> · {guardian.mobile}</span>}
                        </div>
                      ))}
                    </td>
                  )}
                </tr>
              ))}
              {report.rows.length === 0 && (
                <tr><td colSpan={isStudent ? 6 : 4} className="rp-empty">এই দিনে কেউ অনুপস্থিত নেই।</td></tr>
              )}
            </tbody>
          </table>
          <SheetFooter />
        </SheetPreview>
      )}
    </ReportPage>
  );
}
