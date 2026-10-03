import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SvgIcon from '../components/icons/SvgIcon';
import { useGetClassListQuery } from '../features/class/classQuerySlice';
import { useGetSessionsQuery } from '../features/session/sessionQuerySlice';
import { useGetUserBySearchQuery } from '../features/user/userQuerySlice';
import convertBijoyToBengali from '../utils/uniconveter';

const pageSize = 10;
const selectClassName = 'h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-accent';

export default function UserList() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [classId, setClassId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, isError, refetch } =
    useGetUserBySearchQuery({ search, ClassID: classId, SessionID: sessionId });
  const { data: classList = [] } = useGetClassListQuery();
  const { data: sessionList = [] } = useGetSessionsQuery();
  const users = Array.isArray(data) ? data : [];

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => setPage(1), [search, classId, sessionId]);

  const classNames = useMemo(
    () => new Map(classList.map((item) => [String(item.ClassID), item.ClassName || item.EnglishClass])),
    [classList],
  );
  const sessionNames = useMemo(
    () => new Map(sessionList.map((item) => [String(item.SessionID), item.SessionName || item.SessionEngName])),
    [sessionList],
  );
  const pageCount = Math.max(1, Math.ceil(users.length / pageSize));
  const visibleUsers = users.slice((page - 1) * pageSize, page * pageSize);
  const firstRecord = users.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastRecord = Math.min(page * pageSize, users.length);

  const resetFilters = () => {
    setSearchInput('');
    setSearch('');
    setClassId('');
    setSessionId('');
  };

  return (
    <main className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-4 flex min-w-0 items-center gap-2 text-sm text-muted">
        <a href="/dashboard" className="shrink-0 hover:text-foreground">Home</a>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="truncate font-medium text-foreground">Users</span>
      </nav>

      <section className="overflow-hidden rounded-md border border-border bg-surface">
        <header className="flex flex-col gap-4 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand-icon-bg text-brand-600">
              <SvgIcon name="UserList" size={22} />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold text-foreground">ব্যবহারকারীর তথ্য</h1>
              {/* <p className="text-sm text-muted">{users.length} টি তথ্য পাওয়া গেছে</p> */}
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/dashboard/academic/classlist')}
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
            <label>
              <span className="sr-only">শ্রেণি নির্বাচন করুন</span>
              <select value={classId} onChange={(event) => setClassId(event.target.value)} className={selectClassName}>
                <option value="">শ্রেণি নির্বাচন করুন</option>
                {classList.map((item) => (
                  <option key={item.ClassID} value={item.ClassID}>{item.ClassName || item.EnglishClass || item.ClassID}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="sr-only">শ্রেণি নির্বাচন করুন</span>
              <select value={sessionId} onChange={(event) => setSessionId(event.target.value)} className={selectClassName}>
                <option value="">শ্রেণি নির্বাচন করুন</option>
                {sessionList.map((item) => (
                  <option key={item.SessionID} value={item.SessionID}>{item.SessionName || item.SessionEngName || item.SessionID}</option>
                ))}
              </select>
            </label>
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

          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead className="bg-table-header-bg text-xs font-semibold text-muted">
                <tr>
                  {['Code', 'Name', 'Father', 'Mother', 'Mobile 1', 'Mobile 2', 'Session', 'Class', ''].map((label) => (
                    <th key={label || 'action'} scope="col" className="whitespace-nowrap px-3 py-3">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={9} className="px-3 py-10 text-center text-muted">Loading users…</td></tr>
                ) : isError ? (
                  <tr><td colSpan={9} className="px-3 py-10 text-center text-danger">Could not load users. Check the connection and try again.</td></tr>
                ) : visibleUsers.length === 0 ? (
                  <tr><td colSpan={9} className="px-3 py-10 text-center text-muted">No users match these filters.</td></tr>
                ) : visibleUsers.map((user) => (
                  <tr key={user.UserID} className="border-t border-border text-foreground even:bg-table-stripe">
                    <td className="whitespace-nowrap px-3 py-3">{user.UserCode ? convertBijoyToBengali(user.UserCode) : '—'}</td>
                    <td className="whitespace-nowrap px-3 py-3 font-medium">{user.UserName || '—'}</td>
                    <td className="whitespace-nowrap px-3 py-3">{user.FatherName || '—'}</td>
                    <td className="whitespace-nowrap px-3 py-3">{user.MotherName || '—'}</td>
                    <td className="whitespace-nowrap px-3 py-3">{user.Mobile1 || '—'}</td>
                    <td className="whitespace-nowrap px-3 py-3">{user.Mobile2 || '—'}</td>
                    <td className="whitespace-nowrap px-3 py-3">{sessionNames.get(String(user.SessionID)) || '—'}</td>
                    <td className="whitespace-nowrap px-3 py-3">{classNames.get(String(user.ClassID)) || '—'}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => navigate(`/dashboard/academic/user_edit/${user.UserID}`)}
                        aria-label={`Edit ${user.UserName || user.UserCode}`}
                        title="Edit user"
                        className="inline-flex size-9 items-center justify-center rounded-md border border-border text-foreground hover:bg-surface-secondary"
                      >
                        <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <footer className="flex flex-col gap-3 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
            <p>Showing {firstRecord}–{lastRecord} of {users.length}</p>
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
    </main>
  );
}
