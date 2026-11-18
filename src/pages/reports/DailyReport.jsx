import { useMemo, useRef, useState } from 'react';
import { useGetDailyReportOptionsQuery, useGetDailyReportQuery } from '../../features/report/reportQuerySlice';
import {
  CalendarFields, ExportToolbar, ReportPage, SheetFooter, SheetHeader, SheetPreview, StatusBlock,
} from '../../components/reports/reportKit';
import {
  banglaNumber, buttonClass, inputClass, primaryButtonClass, todayText, usePageSetup,
} from '../../components/reports/reportUtils';

/** Same keys and order as DAILY_COLUMNS in the backend Excel export. */
const COLUMNS = [
  { key: 'date', label: 'তারিখ' },
  { key: 'code', label: 'আইডি' },
  { key: 'name', label: 'নাম', locked: true },
  { key: 'type', label: 'ধরন' },
  { key: 'class', label: 'ক্লাস' },
  { key: 'session', label: 'শিক্ষাবর্ষ' },
  { key: 'gender', label: 'লিঙ্গ' },
  { key: 'mobile', label: 'মোবাইল' },
  { key: 'card', label: 'কার্ড নম্বর' },
  { key: 'shift', label: 'শিফট' },
  { key: 'inTime', label: 'প্রবেশ' },
  { key: 'outTime', label: 'বাহির' },
  { key: 'punches', label: 'সব পাঞ্চ' },
  { key: 'late', label: 'বিলম্ব (মিনিট)' },
  { key: 'work', label: 'মোট সময়' },
  { key: 'device', label: 'ডিভাইস' },
  { key: 'status', label: 'অবস্থা' },
  { key: 'guardian', label: 'অভিভাবক ও মোবাইল' },
];
const DEFAULT_COLUMNS = ['date', 'code', 'name', 'class', 'shift', 'inTime', 'outTime', 'late', 'status'];

const STATUSES = [
  { key: 'on_time', label: 'সময়মতো', tone: 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' },
  { key: 'late', label: 'বিলম্ব', tone: 'border-amber-600 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200' },
  { key: 'absent', label: 'অনুপস্থিত', tone: 'border-red-600 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300' },
  { key: 'off', label: 'ছুটি', tone: 'border-slate-500 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200' },
];
const ALL_STATUSES = STATUSES.map((item) => item.key).join(',');
const STATUS_CLASS = { late: 'rp-L', absent: 'rp-A', off: 'rp-muted', holiday: 'rp-muted' };

const shiftDate = (text, days) => {
  const date = new Date(`${text}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};
const DATE_PRESETS = [
  { label: 'আজ', range: (today) => [today, today] },
  { label: 'গতকাল', range: (today) => [shiftDate(today, -1), shiftDate(today, -1)] },
  // Week starts on Saturday.
  { label: 'এই সপ্তাহ', range: (today) => [shiftDate(today, -((new Date(`${today}T00:00:00Z`).getUTCDay() + 1) % 7)), today] },
  { label: 'গত ৭ দিন', range: (today) => [shiftDate(today, -6), today] },
  { label: 'এই মাস', range: (today) => [`${today.slice(0, 8)}01`, today] },
];

const initial = () => ({
  startDate: todayText(), endDate: todayText(),
  userType: '', classId: '', sessionId: '', genderId: '', search: '',
  shiftId: '', switchId: '', checkTypeId: '', deviceId: '', timeFrom: '', timeTo: '', minLate: '',
  status: ALL_STATUSES, sortBy: 'default', groupBy: '', weeklyOff: '5', recordedDaysOnly: 'true',
});

const withoutEmpty = (params) => Object.fromEntries(Object.entries(params).filter(([, value]) => value !== ''));

const formatTime = (value, format) => {
  if (!value) return '';
  if (format !== '12') return banglaNumber(value);
  const [hour, minute] = value.split(':').map(Number);
  return `${banglaNumber(`${String(hour % 12 || 12).padStart(2, '0')}:${String(minute).padStart(2, '0')}`)} ${hour < 12 ? 'AM' : 'PM'}`;
};
const formatDuration = (minutes) => (minutes ? banglaNumber(`${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`) : '—');

function Field({ label, children, className = '' }) {
  return (
    <label className={`text-sm font-medium ${className}`}>
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  );
}

function SectionTitle({ children }) {
  return <p className="col-span-full border-b border-slate-200 pb-1 text-xs dark:border-slate-700 font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{children}</p>;
}

export default function DailyReport() {
  const [draft, setDraft] = useState(initial);
  const [params, setParams] = useState(initial);
  const [showMore, setShowMore] = useState(false);
  const [setup, setSetup] = usePageSetup('daily', { paper: 'A4', orientation: 'landscape' });
  const [display, setDisplay] = usePageSetup('daily-display', { columns: DEFAULT_COLUMNS, timeFormat: '12', showPanel: true, previewFit: true });
  const sheetRef = useRef(null);
  const { data: options } = useGetDailyReportOptionsQuery();
  const query = useMemo(() => withoutEmpty(params), [params]);
  const { currentData: report, isFetching, isError, error, refetch } = useGetDailyReportQuery(query);

  const set = (key) => (event) => setDraft({ ...draft, [key]: event.target.value });
  const apply = (next) => { setDraft(next); setParams(next); };
  const isStudent = draft.userType === '1';
  const draftStatuses = draft.status.split(',').filter(Boolean);
  const toggleStatus = (key) => {
    const next = draftStatuses.includes(key) ? draftStatuses.filter((item) => item !== key) : [...draftStatuses, key];
    if (next.length) setDraft({ ...draft, status: STATUSES.map((item) => item.key).filter((item) => next.includes(item)).join(',') });
  };
  const switchGroups = (options?.shifts ?? []).filter((shift) => !draft.shiftId || String(shift.id) === draft.shiftId);

  const chosen = new Set([...(Array.isArray(display.columns) ? display.columns : DEFAULT_COLUMNS), 'name']);
  const columns = COLUMNS.filter((column) => chosen.has(column.key) && !(column.key === 'date' && report?.singleDay));
  const toggleColumn = (key) => {
    const next = chosen.has(key) ? [...chosen].filter((item) => item !== key) : [...chosen, key];
    setDisplay({ ...display, columns: COLUMNS.map((column) => column.key).filter((item) => next.includes(item)) });
  };
  const exportParams = { ...query, columns: columns.map((column) => column.key).join(','), timeFormat: display.timeFormat };
  const groupMap = new Map((report?.groups ?? []).map((group) => [group.label, group]));

  const cell = (key, row) => {
    switch (key) {
      case 'date': return <td key={key} className="rp-num">{banglaNumber(row.date)} <span className="rp-muted">{row.weekday}</span></td>;
      case 'code': return <td key={key} className="rp-num">{banglaNumber(row.userCode ?? row.userId)}</td>;
      case 'name': return <td key={key}>{row.name}</td>;
      case 'type': return <td key={key} className="rp-c">{row.userType}</td>;
      case 'class': return <td key={key} className="rp-c">{row.className || '—'}</td>;
      case 'session': return <td key={key} className="rp-c">{row.sessionName || '—'}</td>;
      case 'gender': return <td key={key} className="rp-c">{row.gender || '—'}</td>;
      case 'mobile': return <td key={key} className="rp-num">{row.mobile || '—'}</td>;
      case 'card': return <td key={key} className="rp-num">{row.cardNumber || '—'}</td>;
      case 'shift': return <td key={key} className="rp-c">{row.shiftName || '—'}</td>;
      case 'inTime': return <td key={key} className={`rp-num ${row.status === 'late' ? 'rp-L' : ''}`}>{formatTime(row.inTime, display.timeFormat) || '—'}</td>;
      case 'outTime': return <td key={key} className="rp-num">{formatTime(row.outTime, display.timeFormat) || '—'}</td>;
      case 'punches':
        return (
          <td key={key}>
            {row.punches.length === 0 ? '—' : row.punches.map((punch, index) => (
              <span key={index} className={punch.late ? 'rp-L' : ''}>
                {index > 0 && ', '}{punch.label} {formatTime(punch.time, display.timeFormat)}
              </span>
            ))}
          </td>
        );
      case 'late': return <td key={key} className={`rp-num ${row.lateMinutes ? 'rp-L' : ''}`}>{row.lateMinutes ? banglaNumber(row.lateMinutes) : '—'}</td>;
      case 'work': return <td key={key} className="rp-num">{formatDuration(row.workMinutes)}</td>;
      case 'device': return <td key={key} className="rp-c">{row.devices || '—'}</td>;
      case 'status': return <td key={key} className={`rp-c ${STATUS_CLASS[row.status] ?? ''}`}>{row.statusLabel}</td>;
      case 'guardian':
        return (
          <td key={key}>
            {row.guardians.length === 0 ? '—' : row.guardians.map((guardian, index) => (
              <div key={index}>
                {guardian.name}{guardian.relation && <span className="rp-muted"> ({guardian.relation})</span>}
                {guardian.mobile && <span> · {guardian.mobile}</span>}
              </div>
            ))}
          </td>
        );
      default: return null;
    }
  };

  const tableRows = [];
  if (report) {
    let currentGroup;
    report.rows.forEach((row, index) => {
      if (report.groupBy && row.groupLabel !== currentGroup) {
        currentGroup = row.groupLabel;
        const group = groupMap.get(row.groupLabel);
        tableRows.push(
          <tr key={`group-${row.groupLabel}`} className="rp-group">
            <td colSpan={columns.length + 1}>
              {banglaNumber(row.groupLabel)}
              {group && <span className="rp-group-count"> — মোট {banglaNumber(group.total)} · উপস্থিত {banglaNumber(group.present)} · বিলম্ব {banglaNumber(group.late)} · অনুপস্থিত {banglaNumber(group.absent)}</span>}
            </td>
          </tr>,
        );
      }
      tableRows.push(
        <tr key={`${row.date}-${row.userId}`}>
          <td className="rp-num">{banglaNumber(index + 1)}</td>
          {columns.map((column) => cell(column.key, row))}
        </tr>,
      );
    });
  }

  const summaryChips = report ? [
    { label: 'মোট', value: report.summary.total, status: ALL_STATUSES, tone: 'bg-slate-100 dark:bg-slate-800' },
    { label: 'উপস্থিত', value: report.summary.present, status: 'on_time,late', tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' },
    { label: 'সময়মতো', value: report.summary.onTime, status: 'on_time', tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' },
    { label: 'বিলম্ব', value: report.summary.late, status: 'late', tone: 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200' },
    { label: 'অনুপস্থিত', value: report.summary.absent, status: 'absent', tone: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300' },
    { label: 'ছুটি', value: report.summary.off, status: 'off', tone: 'bg-slate-100 dark:bg-slate-800' },
  ] : [];

  const showPanel = display.showPanel !== false;
  const grid = 'grid gap-3 @md:grid-cols-2 @4xl:grid-cols-4 @4xl:items-end';
  const pair = 'grid grid-cols-2 gap-2 @4xl:col-span-2';

  return (
    <ReportPage title="দৈনিক বিস্তারিত রিপোর্ট" description="কে কখন পাঞ্চ করেছে, কে দেরিতে এসেছে, কে আসেনি: ধরন, ক্লাস, শিফট, টাইম সুইচ ও সময় দিয়ে ফিল্টার করে প্রিন্ট বা Excel করুন।">
      {/* Wide screens: filters on the left (sticky, own scroll), report on the right. Narrow screens: stacked. */}
      <div className={`grid gap-4 xl:items-start ${showPanel ? 'xl:grid-cols-[minmax(320px,360px)_minmax(0,1fr)]' : ''}`}>
        {showPanel && (
          <aside className="@container rounded-xl border border-slate-200 bg-white shadow-sm xl:sticky xl:top-4 xl:flex xl:max-h-[calc(100dvh-2rem)] xl:flex-col dark:border-slate-700 dark:bg-slate-900">
            <form onSubmit={(event) => { event.preventDefault(); setParams(draft); }} className="flex min-h-0 flex-1 flex-col">
              <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-3 py-2 sm:px-4 dark:border-slate-700">
                <h2 className="text-sm font-semibold">ফিল্টার ও সেটিংস</h2>
                <button type="button" onClick={() => setDisplay({ ...display, showPanel: false })} className="rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                  লুকান ✕
                </button>
              </div>

              <div className="thin-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto p-3 sm:p-4">
                <div className={grid}>
                  <SectionTitle>সময়কাল</SectionTitle>
                  <div className={pair}>
                    <Field label="শুরুর তারিখ">
                      <input type="date" required max={todayText()} value={draft.startDate} onChange={(event) => setDraft({ ...draft, startDate: event.target.value, endDate: draft.endDate < event.target.value ? event.target.value : draft.endDate })} className={inputClass} />
                    </Field>
                    <Field label="শেষ তারিখ">
                      <input type="date" required min={draft.startDate} max={todayText()} value={draft.endDate} onChange={set('endDate')} className={inputClass} />
                    </Field>
                  </div>
                  <div className="flex flex-wrap gap-1.5 @md:col-span-2 @4xl:col-span-2">
                    {DATE_PRESETS.map((preset) => {
                      const [startDate, endDate] = preset.range(todayText());
                      const active = draft.startDate === startDate && draft.endDate === endDate;
                      return (
                        <button key={preset.label} type="button" onClick={() => apply({ ...draft, startDate, endDate })} className={`${buttonClass} !px-2.5 !py-1 ${active ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' : ''}`}>
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className={grid}>
                  <SectionTitle>ব্যক্তি</SectionTitle>
                  <Field label="ধরন">
                    <select value={draft.userType} onChange={(event) => setDraft({ ...draft, userType: event.target.value, classId: '', sessionId: '' })} className={inputClass}>
                      <option value="">সবাই</option>
                      <option value="1">শিক্ষার্থী</option>
                      <option value="2">শিক্ষক/স্টাফ</option>
                    </select>
                  </Field>
                  <Field label="লিঙ্গ">
                    <select value={draft.genderId} onChange={set('genderId')} className={inputClass}>
                      <option value="">সব</option>
                      {options?.genders.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                  </Field>
                  {isStudent && (
                    <>
                      <Field label="ক্লাস">
                        <select value={draft.classId} onChange={set('classId')} className={inputClass}>
                          <option value="">সব ক্লাস</option>
                          {options?.classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                        </select>
                      </Field>
                      <Field label="শিক্ষাবর্ষ">
                        <select value={draft.sessionId} onChange={set('sessionId')} className={inputClass}>
                          <option value="">সব শিক্ষাবর্ষ</option>
                          {options?.sessions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                        </select>
                      </Field>
                    </>
                  )}
                  <Field label="নাম / আইডি / মোবাইল / কার্ড" className="col-span-full">
                    <input type="search" maxLength={100} value={draft.search} onChange={set('search')} placeholder="খুঁজুন..." className={inputClass} />
                  </Field>
                </div>

                <div className={grid}>
                  <SectionTitle>শিফট ও হাজিরা</SectionTitle>
                  <Field label="শিফট">
                    <select
                      value={draft.shiftId}
                      onChange={(event) => {
                        const shiftId = event.target.value;
                        // Keep the chosen switch only if it belongs to the newly chosen shift.
                        const keepSwitch = shiftId === '' || Boolean(
                          options?.shifts.find((shift) => String(shift.id) === shiftId)?.switches.some((sw) => String(sw.id) === draft.switchId),
                        );
                        setDraft({ ...draft, shiftId, switchId: keepSwitch ? draft.switchId : '' });
                      }}
                      className={inputClass}
                    >
                      <option value="">সব শিফট</option>
                      {options?.shifts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                      <option value="none">শিফট নির্ধারিত নেই</option>
                    </select>
                  </Field>
                  <Field label="টাইম সুইচ">
                    <select value={draft.switchId} onChange={set('switchId')} disabled={draft.shiftId === 'none'} className={inputClass}>
                      <option value="">সব সুইচ</option>
                      {switchGroups.map((shift) => (
                        <optgroup key={shift.id} label={shift.name}>
                          {shift.switches.map((sw) => (
                            <option key={sw.id} value={sw.id}>
                              {sw.name} ({sw.startTime}–{sw.endTime}{sw.lateAfter ? `, বিলম্ব ${sw.lateAfter}-এর পর` : ''})
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </Field>
                  <Field label="চেক টাইপ">
                    <select value={draft.checkTypeId} onChange={set('checkTypeId')} className={inputClass}>
                      <option value="">সব চেক টাইপ</option>
                      {options?.checkTypes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                  </Field>
                  <Field label="ডিভাইস">
                    <select value={draft.deviceId} onChange={set('deviceId')} className={inputClass}>
                      <option value="">সব ডিভাইস</option>
                      {options?.devices.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                  </Field>
                  <div className={pair}>
                    <Field label="পাঞ্চ (থেকে)">
                      <input type="time" value={draft.timeFrom} onChange={set('timeFrom')} className={inputClass} />
                    </Field>
                    <Field label="পাঞ্চ (পর্যন্ত)">
                      <input type="time" value={draft.timeTo} onChange={set('timeTo')} className={inputClass} />
                    </Field>
                  </div>
                  <Field label="বিলম্ব কমপক্ষে (মিনিট)">
                    <input type="number" min={0} max={1440} value={draft.minLate} onChange={set('minLate')} placeholder="যেমন ১০" className={inputClass} />
                  </Field>
                  <p className="col-span-full text-xs text-slate-500 dark:text-slate-400">
                    সুইচ, চেক টাইপ, ডিভাইস বা সময় দিলে শুধু সেই পাঞ্চগুলো গোনা হবে; যার মিল নেই সে অনুপস্থিত দেখাবে।
                  </p>
                </div>

                <div className="space-y-2">
                  <SectionTitle>অবস্থা</SectionTitle>
                  <div className="flex flex-wrap items-center gap-1.5 text-sm">
                    {STATUSES.map((item) => (
                      <label key={item.key} className={`cursor-pointer rounded-lg border px-2.5 py-1 ${draftStatuses.includes(item.key) ? item.tone : 'border-slate-300 text-slate-500 dark:border-slate-600'}`}>
                        <input type="checkbox" className="sr-only" checked={draftStatuses.includes(item.key)} onChange={() => toggleStatus(item.key)} />
                        {item.label}
                      </label>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button type="button" onClick={() => apply({ ...draft, status: 'absent' })} className={`${buttonClass} !px-2.5 !py-1`}>শুধু অনুপস্থিত</button>
                    <button type="button" onClick={() => apply({ ...draft, status: 'late' })} className={`${buttonClass} !px-2.5 !py-1`}>শুধু বিলম্ব</button>
                    <button type="button" onClick={() => apply({ ...draft, status: ALL_STATUSES })} className={`${buttonClass} !px-2.5 !py-1`}>সব</button>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 dark:border-slate-700">
                  <button type="button" onClick={() => setShowMore(!showMore)} aria-expanded={showMore} className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm font-medium">
                    আরও সেটিংস: সাজানো, গ্রুপ, কলাম, ছুটি
                    <span aria-hidden="true">{showMore ? '▲' : '▼'}</span>
                  </button>
                  {showMore && (
                    <div className={`${grid} border-t border-slate-200 p-3 dark:border-slate-700`}>
                      <Field label="সাজানো">
                        <select value={draft.sortBy} onChange={set('sortBy')} className={inputClass}>
                          <option value="default">তারিখ, ক্লাস ও আইডি</option>
                          <option value="code">আইডি</option>
                          <option value="name">নাম</option>
                          <option value="inTime">প্রবেশের সময় (আগে আসা আগে)</option>
                          <option value="late">বেশি বিলম্ব আগে</option>
                        </select>
                      </Field>
                      <Field label="গ্রুপ করে দেখান">
                        <select value={draft.groupBy} onChange={set('groupBy')} className={inputClass}>
                          <option value="">গ্রুপ ছাড়া</option>
                          <option value="date">তারিখ অনুযায়ী</option>
                          <option value="class">ক্লাস অনুযায়ী</option>
                          <option value="shift">শিফট অনুযায়ী</option>
                          <option value="status">অবস্থা অনুযায়ী</option>
                        </select>
                      </Field>
                      <Field label="সময়ের ফরম্যাট">
                        <select value={display.timeFormat} onChange={(event) => setDisplay({ ...display, timeFormat: event.target.value })} className={inputClass}>
                          <option value="12">১২ ঘণ্টা (AM/PM)</option>
                          <option value="24">২৪ ঘণ্টা</option>
                        </select>
                      </Field>
                      <div className="col-span-full">
                        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-sm font-medium">রিপোর্টের কলাম (প্রিন্ট ও Excel)</span>
                          <button type="button" onClick={() => setDisplay({ ...display, columns: DEFAULT_COLUMNS })} className="text-sm text-blue-700 hover:underline dark:text-blue-300">ডিফল্ট</button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 text-sm">
                          {COLUMNS.map((column) => (
                            <label key={column.key} className={`rounded-lg border px-2 py-0.5 ${column.locked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} ${chosen.has(column.key) ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' : 'border-slate-300 dark:border-slate-600'}`}>
                              <input type="checkbox" className="sr-only" disabled={column.locked} checked={chosen.has(column.key)} onChange={() => toggleColumn(column.key)} />
                              {column.label}
                            </label>
                          ))}
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">কলাম ও সময়ের ফরম্যাট সাথে সাথে বদলায়, “দেখুন” চাপতে হয় না। এক দিনের রিপোর্টে তারিখ কলাম আপনা-আপনি বাদ যায়।</p>
                      </div>
                      <div className="col-span-full">
                        <CalendarFields value={draft} onChange={setDraft} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 border-t border-slate-200 bg-white p-3 sm:px-4 dark:border-slate-700 dark:bg-slate-900 xl:rounded-b-xl">
                <button type="submit" className={`${primaryButtonClass} flex-1`}>দেখুন</button>
                <button type="button" onClick={refetch} disabled={isFetching} className={buttonClass}>হালনাগাদ</button>
                <button type="button" onClick={() => apply(initial())} className={buttonClass}>রিসেট</button>
              </div>
            </form>
          </aside>
        )}

        <div className="min-w-0 space-y-4">
          <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {!showPanel && (
                  <button type="button" onClick={() => setDisplay({ ...display, showPanel: true })} className={primaryButtonClass}>
                    ☰ ফিল্টার ও সেটিংস
                  </button>
                )}
                {summaryChips.map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    title="এই অবস্থার তালিকা দেখুন"
                    onClick={() => apply({ ...params, status: chip.status })}
                    className={`rounded-lg px-3 py-1.5 hover:ring-2 hover:ring-blue-600/30 ${chip.tone} ${params.status === chip.status ? 'ring-2 ring-blue-600/60' : ''}`}
                  >
                    {chip.label}: {banglaNumber(chip.value)}
                  </button>
                ))}
                {report?.summary.late > 0 && (
                  <span className="rounded-lg bg-slate-100 px-3 py-1.5 dark:bg-slate-800">গড় বিলম্ব: {banglaNumber(report.summary.averageLate)} মিনিট</span>
                )}
                {report && <span className="text-slate-500 dark:text-slate-400">{banglaNumber(report.summary.shown)} সারি</span>}
                {isFetching && report && <span className="text-slate-500 dark:text-slate-400">হালনাগাদ হচ্ছে...</span>}
              </div>
            </div>
            <div className="flex flex-wrap items-end justify-between gap-3 border-t border-slate-200 pt-3 dark:border-slate-700">
              <label className="text-sm font-medium">
                <span className="mb-1 block">প্রিভিউ</span>
                <select value={display.previewFit === false ? 'actual' : 'fit'} onChange={(event) => setDisplay({ ...display, previewFit: event.target.value === 'fit' })} className={inputClass}>
                  <option value="fit">জায়গা অনুযায়ী ছোট-বড়</option>
                  <option value="actual">আসল মাপ</option>
                </select>
              </label>
              <ExportToolbar
                setup={setup}
                onSetupChange={setSetup}
                sheetRef={sheetRef}
                kind="daily"
                params={exportParams}
                title={`daily-details-${params.startDate}${params.endDate !== params.startDate ? `-to-${params.endDate}` : ''}`}
                disabled={!report || isFetching}
              />
            </div>
            {report?.unrecordedDates?.length > 0 && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                {report.singleDay ? 'এই তারিখে' : `${report.unrecordedDates.slice(0, 10).map(banglaNumber).join(', ')}${report.unrecordedDates.length > 10 ? ' …' : ''} তারিখে`} কোনো হাজিরা পাওয়া যায়নি। দিনটি ছুটি হতে পারে, অথবা ডিভাইস থেকে ডেটা এখনও sync হয়নি।
              </p>
            )}
          </section>

          <StatusBlock isError={isError} isFetching={isFetching} hasData={Boolean(report)} message={error?.data?.message} />
          {report && !isError && (
            <SheetPreview setup={setup} sheetRef={sheetRef} fit={display.previewFit !== false}>
              <SheetHeader
                title={report.title}
                meta={[
                  report.singleDay
                    ? `তারিখ: ${banglaNumber(report.startDate)} (${report.weekday})`
                    : `${banglaNumber(report.startDate)} থেকে ${banglaNumber(report.endDate)}`,
                  ...report.filterLabels.map(banglaNumber),
                ].join(' · ')}
              />
              <div className="rp-summary">
                <span>মোট: {banglaNumber(report.summary.total)}</span>
                <span>উপস্থিত: {banglaNumber(report.summary.present)}</span>
                <span>সময়মতো: {banglaNumber(report.summary.onTime)}</span>
                <span>বিলম্ব: {banglaNumber(report.summary.late)}</span>
                <span>অনুপস্থিত: {banglaNumber(report.summary.absent)}</span>
                {report.summary.off > 0 && <span>ছুটি: {banglaNumber(report.summary.off)}</span>}
              </div>
              <table className="rp-table">
                <thead>
                  <tr>
                    <th>ক্রম</th>
                    {columns.map((column) => <th key={column.key}>{column.label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {tableRows}
                  {report.rows.length === 0 && (
                    <tr><td colSpan={columns.length + 1} className="rp-empty">এই ফিল্টারে কোনো তথ্য নেই।</td></tr>
                  )}
                </tbody>
              </table>
              <SheetFooter />
            </SheetPreview>
          )}
        </div>
      </div>
    </ReportPage>
  );
}
