import { useMemo, useState } from 'react';
import SvgIcon from '../components/icons/SvgIcon';
import SortableTable from '../components/SortableTable';

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

export default function ClassList() {
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
  const sampleRow = [
    {
      marhala: "সানাবিয়া উলিয়া",
      regularFee: "২০০৳",
      irregularFee: "৩০০৳",
      lateRegularFee: "৩০০৳",
      lateIrregularFee: "৪০০৳",
    }
  ];

  const columnsMadrasah = [
    {
      title: "SL",
      hozAlign: 'center',
      width: 80,
      render: (row, index) => <p className="text-sm">{index + 1}</p>,
    },
    {
      title: "মারহালা",
      field: 'marhala',
      hozAlign: 'center',
    },
    {
      title: "নিয়মিত ফি",
      field: 'regularFee'
    },
    {
      title: "অ্যাকশন",
      hozAlign: 'center',
      render: (row) => (
        <div className="flex items-center justify-center space-x-2">
          <button

            className="text-gray-600 hover:text-gray-900 focus:outline-none"
            title="More Actions"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>
      ),
    },
  ];
  return (
    <div className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-4 flex min-w-0 items-center gap-2 text-sm text-muted">
        <a href="/dashboard" className="shrink-0 hover:text-foreground">হোম</a>
        <svg aria-hidden="true" className="size-4 shrink-0 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6" />
        </svg>
        <span className="shrink-0">নিবন্ধন সংক্রান্ত</span>
        <svg aria-hidden="true" className="size-4 shrink-0 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6" />
        </svg>
        <span aria-current="page" className="truncate font-medium text-foreground">ক্লাস গ্রুপ নিবন্ধন</span>
      </nav>

      <section className="overflow-hidden rounded-md border border-border bg-surface">
        <header className="flex flex-col gap-4 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-icon-bg text-clay">
              <SvgIcon name="UserList" size={22} />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold text-foreground">ক্লাস গ্রুপ নিবন্ধন</h1>
              <p className="text-sm text-muted">ক্লাস গ্রুপ তালিকা</p>
            </div>
          </div>
          <button type="button" className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-cta px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-cta-hover">
            <SvgIcon name="TbPlus" size={18} />
            নতুন ক্লাস গ্রুপ নিবন্ধন
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
              <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="ক্লাস গ্রুপের নাম অনুসন্ধান করুন" className="h-10 w-full rounded-md border border-border bg-surface px-3 pl-9 text-sm text-foreground outline-none focus:border-accent" />
            </label>
     
          </div>

          <SortableTable columns={columnsMadrasah} data={sampleRow} isFilterColumn={false} />
        </div>
      </section>
    </div>
  );
}
