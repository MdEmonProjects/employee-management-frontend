import { useState } from 'react';
import { toast } from 'react-toastify';
import { useGetClassListQuery } from '../../features/class/classQuerySlice';
import { useGetSessionsQuery } from '../../features/session/sessionQuerySlice';
import { useGetCurrentInstitutionQuery } from '../../features/institution/institutionQuerySlice';
import { downloadReportExcel } from '../../features/report/reportQuerySlice';
import { WEEKDAYS, banglaNumber, buttonClass, inputClass, primaryButtonClass, printSheet, sheetCss } from './reportUtils';

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

/** Student/teacher type, class and session selectors shared by every report. */
export function PopulationFields({ value, onChange }) {
  const isStudent = String(value.userType) === '1';
  const { data: classList = [] } = useGetClassListQuery(undefined, { skip: !isStudent });
  const { data: sessionList = [] } = useGetSessionsQuery(undefined, { skip: !isStudent });
  const set = (key, next) => onChange({ ...value, [key]: next });
  return (
    <>
      <label className="text-sm font-medium">
        <span className="mb-1 block">ধরন</span>
        <select value={value.userType} onChange={(event) => onChange({ ...value, userType: event.target.value, classId: '', sessionId: '' })} className={inputClass}>
          <option value="1">শিক্ষার্থী</option>
          <option value="2">শিক্ষক/স্টাফ</option>
        </select>
      </label>
      {isStudent && (
        <>
          <label className="text-sm font-medium">
            <span className="mb-1 block">ক্লাস</span>
            <select value={value.classId} onChange={(event) => set('classId', event.target.value)} className={inputClass}>
              <option value="">সব ক্লাস</option>
              {classList.map((item) => <option key={item.ClassID} value={item.ClassID}>{item.ClassName || item.EnglishClass || item.ClassID}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium">
            <span className="mb-1 block">শিক্ষাবর্ষ</span>
            <select value={value.sessionId} onChange={(event) => set('sessionId', event.target.value)} className={inputClass}>
              <option value="">সব শিক্ষাবর্ষ</option>
              {sessionList.map((item) => <option key={item.SessionID} value={item.SessionID}>{item.SessionName || item.SessionEngName || item.SessionID}</option>)}
            </select>
          </label>
        </>
      )}
    </>
  );
}

/** Weekly-off days and the "count only days with punches" switch. */
export function CalendarFields({ value, onChange }) {
  const offDays = value.weeklyOff ? value.weeklyOff.split(',').map(Number) : [];
  const toggle = (day) => {
    const next = offDays.includes(day) ? offDays.filter((item) => item !== day) : [...offDays, day].sort();
    onChange({ ...value, weeklyOff: next.join(',') });
  };
  return (
    <div className="space-y-2 text-sm sm:col-span-2 lg:col-span-3">
      <div>
        <span className="mb-1 block font-medium">সাপ্তাহিক ছুটি</span>
        <div className="flex flex-wrap gap-2">
          {WEEKDAYS.map((name, day) => (
            <label key={day} className={`cursor-pointer rounded-lg border px-2.5 py-1 ${offDays.includes(day) ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' : 'border-slate-300 dark:border-slate-600'}`}>
              <input type="checkbox" className="sr-only" checked={offDays.includes(day)} onChange={() => toggle(day)} />
              {name}
            </label>
          ))}
        </div>
      </div>
      <label className="flex items-start gap-2">
        <input type="checkbox" className="mt-1" checked={value.recordedDaysOnly !== 'false'} onChange={(event) => onChange({ ...value, recordedDaysOnly: event.target.checked ? 'true' : 'false' })} />
        <span>যেদিন কেউই হাজিরা দেয়নি সেদিনকে ছুটি ধরুন <span className="text-slate-500 dark:text-slate-400">(সরকারি ছুটি ও প্রতিষ্ঠান বন্ধের দিন কর্মদিবস থেকে বাদ যাবে)</span></span>
      </label>
    </div>
  );
}

/** Paper/orientation controls with Print (PDF) and Excel export. */
export function ExportToolbar({ setup, onSetupChange, sheetRef, kind, params, title, disabled }) {
  const [exporting, setExporting] = useState(false);
  const exportExcel = async () => {
    setExporting(true);
    try {
      await downloadReportExcel(kind, params, setup);
    } catch {
      toast.error('Excel ফাইল তৈরি করা যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setExporting(false);
    }
  };
  return (
    <div className="flex flex-wrap items-end gap-2">
      <label className="text-sm font-medium">
        <span className="mb-1 block">কাগজের মাপ</span>
        <select value={setup.paper} onChange={(event) => onSetupChange({ ...setup, paper: event.target.value })} className={inputClass}>
          <option value="A4">A4</option>
          <option value="A5">A5</option>
        </select>
      </label>
      <label className="text-sm font-medium">
        <span className="mb-1 block">দিক</span>
        <select value={setup.orientation} onChange={(event) => onSetupChange({ ...setup, orientation: event.target.value })} className={inputClass}>
          <option value="portrait">পোর্ট্রেট (খাড়া)</option>
          <option value="landscape">ল্যান্ডস্কেপ (আড়াআড়ি)</option>
        </select>
      </label>
      <button type="button" disabled={disabled} onClick={() => printSheet(sheetRef.current, { ...setup, title })} className={primaryButtonClass}>
        প্রিন্ট / PDF
      </button>
      <button type="button" disabled={disabled || exporting} onClick={exportExcel} className={buttonClass}>
        {exporting ? 'তৈরি হচ্ছে...' : 'Excel'}
      </button>
    </div>
  );
}

/** On-screen paper preview; the inner .rp-sheet element is what gets printed. */
export function SheetPreview({ setup, sheetRef, children }) {
  return (
    <div className="rp-screen overflow-x-auto rounded-xl border border-slate-200 bg-slate-200/60 p-3 sm:p-6 dark:border-slate-700 dark:bg-slate-800/60">
      <style>{sheetCss(setup.paper, setup.orientation)}</style>
      <div ref={sheetRef} className="rp-sheet">{children}</div>
    </div>
  );
}

/** Institution header printed at the top of every report. */
export function SheetHeader({ title, meta }) {
  const { data: institution } = useGetCurrentInstitutionQuery();
  const logo = institution?.Logo ? (/^https?:/.test(institution.Logo) ? institution.Logo : `${API_URL}${institution.Logo}`) : null;
  const address = institution?.Address || [institution?.Village, institution?.PostOffice, institution?.PoliceStation, institution?.District].filter(Boolean).join(', ');
  return (
    <>
      {institution && (
        <div className="rp-head">
          {logo && <img src={logo} alt="" />}
          <div>
            <p className="rp-inst">{institution.InstitutionName || institution.EngInstitutionName}</p>
            {address && <p className="rp-addr">{address}</p>}
          </div>
        </div>
      )}
      <p className="rp-title">{title}</p>
      {meta && <p className="rp-meta">{meta}</p>}
    </>
  );
}

export function SheetFooter() {
  return (
    <>
      <div className="rp-sign">
        <span>প্রস্তুতকারীর স্বাক্ষর</span>
        <span>প্রতিষ্ঠান প্রধানের স্বাক্ষর</span>
      </div>
      <p className="rp-foot">প্রস্তুতের সময়: {banglaNumber(new Date().toLocaleString('en-GB'))}</p>
    </>
  );
}

export function ReportPage({ title, description, children }) {
  return (
    <div className="min-h-full w-full min-w-0 space-y-4 bg-slate-100 p-3 text-slate-900 sm:p-4 dark:bg-slate-950 dark:text-slate-100">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      {children}
    </div>
  );
}

export function StatusBlock({ isError, isFetching, hasData }) {
  if (isError) return <div className="rounded-lg bg-red-50 px-4 py-8 text-center text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">রিপোর্ট লোড করা যায়নি। আবার চেষ্টা করুন।</div>;
  if (isFetching && !hasData) return <div className="px-4 py-8 text-center text-sm text-slate-500">রিপোর্ট তৈরি হচ্ছে...</div>;
  return null;
}
