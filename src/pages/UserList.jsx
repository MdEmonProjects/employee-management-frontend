import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SvgIcon from '../components/icons/SvgIcon';
import SortableTable from '../components/SortableTable';
import { useGetClassListQuery } from '../features/class/classQuerySlice';
import { useGetSessionsQuery } from '../features/session/sessionQuerySlice';
import { useGetUserBySearchQuery } from '../features/user/userQuerySlice';
import { showModal } from '../utils/ModalControlar';
import convertBijoyToBengali from '../utils/uniconveter';

const selectClassName = 'h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-accent';

export default function UserList({ userType = 1 }) {
  const isStudent = userType === 1;
  const label = userType === 3 ? 'অভিভাবক' : userType === 2 ? 'শিক্ষক/স্টাফ' : 'শিক্ষার্থী';
  const sectionPath = userType === 3 ? 'guardians' : 'staff';
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [classId, setClassId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState('25');
  const [selectedStudentIds, setSelectedStudentIds] = useState(() => new Set());
  const { currentData: data, isLoading, isFetching, isError, refetch } =
    useGetUserBySearchQuery({
      search,
      UserTypeID: userType,
      ...(isStudent && { ClassID: classId, SessionID: sessionId }),
    });
  const { data: classList = [] } = useGetClassListQuery(undefined, { skip: !isStudent });
  const { data: sessionList = [] } = useGetSessionsQuery(undefined, { skip: !isStudent });
  const users = Array.isArray(data) ? data : [];

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const handlePromotionComplete = (event) => {
      setSelectedStudentIds((current) => {
        const next = new Set(current);
        (event.detail?.userIds || []).forEach((id) => next.delete(id));
        return next;
      });
      setPage(1);
    };
    window.addEventListener('student-promotion-complete', handlePromotionComplete);
    return () => window.removeEventListener('student-promotion-complete', handlePromotionComplete);
  }, []);

  const classNames = useMemo(
    () => new Map(classList.map((item) => [String(item.ClassID), item.ClassName || item.EnglishClass])),
    [classList],
  );
  const sessionNames = useMemo(
    () => new Map(sessionList.map((item) => [String(item.SessionID), item.SessionName || item.SessionEngName])),
    [sessionList],
  );
  const pageSize = rowsPerPage === 'all' ? Math.max(1, users.length) : Number(rowsPerPage);
  const pageCount = Math.max(1, Math.ceil(users.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleUsers = users.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const visibleStudentIds = visibleUsers.map((user) => user.UserID);
  const allVisibleSelected = visibleStudentIds.length > 0 &&
    visibleStudentIds.every((id) => selectedStudentIds.has(id));
  const firstRecord = users.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastRecord = Math.min(currentPage * pageSize, users.length);

  const toggleStudent = (id) => setSelectedStudentIds((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });

  const toggleVisibleStudents = () => setSelectedStudentIds((current) => {
    const next = new Set(current);
    visibleStudentIds.forEach((id) => {
      if (allVisibleSelected) next.delete(id);
      else next.add(id);
    });
    return next;
  });

  const openPromotion = () => {
    if (selectedStudentIds.size > 0 && selectedStudentIds.size <= 2000) {
      showModal('শিক্ষার্থী প্রমোট করুন', 'STUDENT_PROMOTION', null, { userIds: [...selectedStudentIds] });
    }
  };

  const resetFilters = () => {
    setSearchInput('');
    setSearch('');
    setClassId('');
    setSessionId('');
    setPage(1);
  };

  const columns = [
    ...(isStudent ? [{
      title: <input type="checkbox" aria-label="এই পাতার সব শিক্ষার্থী নির্বাচন করুন" checked={allVisibleSelected} onChange={toggleVisibleStudents} disabled={!visibleStudentIds.length} className="size-4 accent-clay" />,
      render: (row) => <input type="checkbox" aria-label={`${row.UserName || row.UserCode || row.UserID} নির্বাচন করুন`} checked={selectedStudentIds.has(row.UserID)} onChange={() => toggleStudent(row.UserID)} className="size-4 accent-clay" />,
    }] : []),
    { title: 'Code', render: (row) => row.UserCode ? convertBijoyToBengali(row.UserCode) : '—' },
    { title: 'Name', render: (row) => row.UserName || '—' },
    { title: 'Father', render: (row) => row.FatherName || '—' },
    { title: 'Mother', render: (row) => row.MotherName || '—' },
    { title: 'Mobile 1', render: (row) => row.Mobile1 || '—' },
    { title: 'Mobile 2', render: (row) => row.Mobile2 || '—' },
    ...(isStudent ? [
      { title: 'Session', render: (row) => sessionNames.get(String(row.SessionID)) || '—' },
      { title: 'Class', render: (row) => classNames.get(String(row.ClassID)) || '—' },
    ] : []),
    {
      title: ' ',
      render: (row) => (
        <button
          type="button"
          onClick={() => navigate(isStudent
            ? `/dashboard/academic/user_edit/${row.UserID}`
            : `/dashboard/${sectionPath}/edit/${row.UserID}`)}
          aria-label={`Edit ${row.UserName || row.UserCode}`}
          title="Edit user"
          className="inline-flex size-9 items-center justify-center rounded-md border border-border text-foreground hover:bg-surface-secondary"
        >
          <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" /></svg>
        </button>
      ),
    },
  ];

  return (
    <main className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-4 flex min-w-0 items-center gap-2 text-sm text-muted">
        <a href="/dashboard" className="shrink-0 hover:text-foreground">Home</a>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="truncate font-medium text-foreground">{label}</span>
      </nav>

      <section className="overflow-hidden rounded-md border border-border bg-surface">
        <header className="flex flex-col gap-4 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand-icon-bg text-brand-600">
              <SvgIcon name="UserList" size={22} />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold text-foreground">{isStudent ? 'শিক্ষার্থীর তথ্য' : `${label} তালিকা`}</h1>
              {/* <p className="text-sm text-muted">{users.length} টি তথ্য পাওয়া গেছে</p> */}
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate(isStudent ? '/dashboard/academic/classlist' : `/dashboard/${sectionPath}/new`)}
            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
          >
            <SvgIcon name="TbPlus" size={18} />
            নতুন নিবন্ধন
          </button>
        </header>

        <div className="space-y-4 p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <label className="relative block sm:col-span-2 xl:col-span-2">
              <span className="sr-only">Search users</span>
              <svg aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="নাম, পিতা, মাতা, মোবাইল বা কোড দিয়ে অনুসন্ধান করুন"
                className={`${selectClassName} pl-9`}
              />
            </label>
            {isStudent && <label>
              <span className="sr-only">শ্রেণি নির্বাচন করুন</span>
              <select value={classId} onChange={(event) => { setClassId(event.target.value); setPage(1); }} className={selectClassName}>
                <option value="">শ্রেণি নির্বাচন করুন</option>
                {classList.map((item) => (
                  <option key={item.ClassID} value={item.ClassID}>{item.ClassName || item.EnglishClass || item.ClassID}</option>
                ))}
              </select>
            </label>}
            {isStudent && <label>
              <span className="sr-only">সেশন নির্বাচন করুন</span>
              <select value={sessionId} onChange={(event) => { setSessionId(event.target.value); setPage(1); }} className={selectClassName}>
                <option value="">সেশন নির্বাচন করুন</option>
                {sessionList.map((item) => (
                  <option key={item.SessionID} value={item.SessionID}>{item.SessionName || item.SessionEngName || item.SessionID}</option>
                ))}
              </select>
            </label>}
          </div>

          <div className="flex min-h-9 items-center justify-between gap-3 text-sm text-muted">
            <span aria-live="polite">{isFetching && !isLoading ? 'Updating results…' : `${users.length} records`}</span>
            <div className="flex items-center gap-3">
              <button type="button" onClick={resetFilters} className="hover:text-foreground">Clear filters</button>
              <button type="button" onClick={() => refetch()} aria-label="Refresh users" title="Refresh users" className="inline-flex size-9 items-center justify-center rounded-md border border-border text-foreground hover:bg-surface-secondary">
                <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7v5h-5" /><path d="M4 17v-5h5" /><path d="M5.6 9a7 7 0 0 1 11.6-2L20 12M4 12l2.8 5a7 7 0 0 0 11.6-2" /></svg>
              </button>
            </div>
          </div>

          {isStudent && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface-secondary px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-clay/10 text-sm font-bold text-clay" aria-hidden="true">{selectedStudentIds.size}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{selectedStudentIds.size} জন শিক্ষার্থী নির্বাচিত</p>
                  <p className="text-xs text-muted">পাতা বা ফিল্টার পরিবর্তন করলেও নির্বাচন থাকবে।</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <button type="button" onClick={openPromotion} disabled={!selectedStudentIds.size || selectedStudentIds.size > 2000} className="inline-flex h-10 items-center justify-center rounded-md bg-clay px-4 font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">প্রমোট শিক্ষার্থী</button>
              </div>
            </div>
          )}

          {isLoading || (isFetching && !data) ? (
            <div className="rounded-md border border-border px-3 py-10 text-center text-sm text-muted">Loading users…</div>
          ) : isError ? (
            <div className="rounded-md border border-border px-3 py-10 text-center text-sm text-danger">Could not load users. Check the connection and try again.</div>
          ) : visibleUsers.length === 0 ? (
            <div className="rounded-md border border-border px-3 py-10 text-center text-sm text-muted">No users match these filters.</div>
          ) : (
            <SortableTable columns={columns} data={visibleUsers} isFilterColumn={false} />
          )}

          <footer className="flex flex-col gap-3 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
            <p>Showing {firstRecord}–{lastRecord} of {users.length}</p>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <label className="flex items-center gap-2 whitespace-nowrap">প্রতি পাতায়
                <select value={rowsPerPage} onChange={(event) => { setRowsPerPage(event.target.value); setPage(1); }} className="h-9 rounded-md border border-border bg-surface px-2 text-foreground">
                  {[10, 25, 50, 100].map((count) => <option key={count} value={count}>{count}</option>)}
                  <option value="all">সব</option>
                </select>
              </label>
              <span className="mr-2 whitespace-nowrap">Page {currentPage} of {pageCount}</span>
              <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={currentPage === 1} aria-label="Previous page" className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-surface text-foreground hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-40">
                <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              </button>
              <button type="button" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={currentPage === pageCount} aria-label="Next page" className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-surface text-foreground hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-40">
                <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
              </button>
            </div>
          </footer>
        </div>
      </section>
    </main>
  );
}
