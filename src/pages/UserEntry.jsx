import { useMemo, useState } from 'react';
import SvgIcon from '../components/icons/SvgIcon';

const EXAMINEES = Array.from({ length: 20 }, (_, index) => ({
  applicationId: `EX-2026-${String(index + 1).padStart(4, '0')}`,
  name: ['আব্দুল্লাহ আল মামুন', 'মুহাম্মদ আবু বকর', 'আব্দুর রহমান', 'মোঃ ইব্রাহিম'][index % 4],
  father: ['মোঃ আব্দুল করিম', 'মোঃ আব্দুল জলিল', 'মোঃ নুরুল ইসলাম', 'মোঃ আব্দুল হক'][index % 4],
  dob: `200${index % 5}-0${(index % 8) + 1}-1${index % 9}`,
  marhala: ['সানাবিয়া উলইয়া', 'ফযীলত', 'তাকমীল'][index % 3],
  studentType: index % 2 === 0 ? 'Regular' : 'Private',
  applicationDate: `2026-08-${String((index % 20) + 1).padStart(2, '0')}`,
  attachments: index % 3 === 0 ? 1 : 2,
  payment: 'Unpaid',
  status: 'Pending',
  exam: ['Dakhil', 'Alim', 'Fazil'][index % 3],
}));

const FILTERS = [
  { key: 'exam', label: 'Exam', options: ['All exams', 'Dakhil', 'Alim', 'Fazil'] },
  { key: 'marhala', label: 'Marhala', options: ['All marhalas', 'সানাবিয়া উলইয়া', 'ফযীলত', 'তাকমীল'] },
  { key: 'status', label: 'Status', options: ['All statuses', 'Pending'] },
  { key: 'studentType', label: 'Student type', options: ['All types', 'Regular', 'Private'] },
];

export default function UserEntry() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ exam: '', marhala: '', status: '', studentType: '' });
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filteredExaminees = useMemo(() => EXAMINEES.filter((examinee) => {
    const matchesSearch = `${examinee.applicationId} ${examinee.name} ${examinee.father}`
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesSearch && Object.entries(filters).every(([key, value]) => !value || examinee[key] === value);
  }), [filters, search]);
  const pageCount = Math.max(1, Math.ceil(filteredExaminees.length / pageSize));
  const visibleExaminees = filteredExaminees.slice((page - 1) * pageSize, page * pageSize);
  const firstRecord = filteredExaminees.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastRecord = Math.min(page * pageSize, filteredExaminees.length);

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  const columns = [
    ['App ID', 'applicationId'],
    ['Name', 'name'],
    ['Father', 'father'],
    ['DOB', 'dob'],
    ['Marhala', 'marhala'],
    ['Type', 'studentType'],
    ['Date', 'applicationDate'],
    ['Attachments', 'attachments'],
    ['Payment', 'payment'],
    ['Status', 'status'],
  ];

    return (
    <div className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-4 flex min-w-0 items-center gap-2 text-sm text-muted">
        <a href="/dashboard" className="shrink-0 hover:text-foreground">Home</a>
        <svg aria-hidden="true" className="size-4 shrink-0 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6" />
        </svg>
        <span className="shrink-0">Registration</span>
        <svg aria-hidden="true" className="size-4 shrink-0 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6" />
        </svg>
        <span aria-current="page" className="truncate font-medium text-foreground">Examinee Registration</span>
      </nav>

      <section className="overflow-hidden rounded-md border border-border bg-surface">
        <header className="flex flex-col gap-4 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand-icon-bg text-brand-600">
              <SvgIcon name="UserList" size={22} />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold text-foreground">Examinee Registration</h1>
              <p className="text-sm text-muted">পরীক্ষার্থীর তালিকা</p>
            </div>
                    </div>
          <button type="button" className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover">
            <SvgIcon name="TbPlus" size={18} />
            New Registration
          </button>
        </header>

        <div className="space-y-4 p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <label className="relative block sm:col-span-2 xl:col-span-1">
              <span className="sr-only">Search examinees</span>
              <svg aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search by name or app ID" className="h-10 w-full rounded-md border border-border bg-surface px-3 pl-9 text-sm text-foreground outline-none focus:border-accent" />
            </label>
            {FILTERS.map((filter) => (
              <label key={filter.key} className="block">
                <span className="sr-only">Filter by {filter.label}</span>
                <select value={filters[filter.key]} onChange={(event) => updateFilter(filter.key, event.target.value)} className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-accent">
                  {filter.options.map((option, index) => <option key={option} value={index === 0 ? '' : option}>{option}</option>)}
                </select>
              </label>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => window.print()} className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-surface px-3 text-sm font-medium text-foreground hover:bg-surface-secondary">
              <SvgIcon name="TbFileTypePdf" size={18} />
              PDF Download
            </button>
            <button type="button" onClick={() => window.print()} className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-surface px-3 text-sm font-medium text-foreground hover:bg-surface-secondary">
              <SvgIcon name="TbPrinter" size={18} />
              Proof Copy Download
            </button>
          </div>

          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
              <thead className="bg-table-header-bg text-xs font-semibold text-muted">
                <tr>
                  {columns.map(([label]) => <th key={label} scope="col" className="whitespace-nowrap px-3 py-3">{label}</th>)}
                  <th scope="col" className="whitespace-nowrap px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleExaminees.map((examinee) => (
                  <tr key={examinee.applicationId} className="border-t border-border text-foreground even:bg-table-stripe">
                    {columns.map(([, key]) => (
                      <td key={key} className="whitespace-nowrap px-3 py-3">
                        {key === 'attachments' ? `${examinee.attachments} files` : key === 'payment' ? <span className="rounded-full bg-warning/15 px-2 py-1 text-xs font-medium text-warning-foreground">{examinee[key]}</span> : key === 'status' ? <span className="rounded-full bg-warning/15 px-2 py-1 text-xs font-medium text-warning-foreground">{examinee[key]}</span> : examinee[key]}
                      </td>
                    ))}
                    <td className="whitespace-nowrap px-3 py-3 text-right">
                      <button type="button" aria-label={`View ${examinee.applicationId}`} className="inline-flex size-8 items-center justify-center rounded-md text-muted hover:bg-surface-tertiary hover:text-foreground">
                        <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
                {visibleExaminees.length === 0 && <tr><td colSpan={columns.length + 1} className="px-3 py-10 text-center text-muted">No examinees match these filters.</td></tr>}
              </tbody>
            </table>
          </div>

          <footer className="flex flex-col gap-3 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
            <p>Showing {firstRecord}-{lastRecord} of {filteredExaminees.length}</p>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="mr-2">Page {page} of {pageCount}</span>
              <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} aria-label="Previous page" className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-surface text-foreground hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-40">
                <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              </button>
              <button type="button" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={page === pageCount} aria-label="Next page" className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-surface text-foreground hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-40">
                <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
              </button>
            </div>
          </footer>
        </div>
        </section>
    </div>
    );
}
