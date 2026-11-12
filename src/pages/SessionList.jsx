import { useMemo, useState } from 'react';
import SortableTable from '../components/SortableTable';
import SvgIcon from '../components/icons/SvgIcon';
import { useGetSessionsQuery, useStatusUpdateSessionMutation } from '../features/session/sessionQuerySlice';
import { showModal } from '../utils/ModalControlar';
import convertBijoyToBengali from '../utils/uniconveter';
import { toast } from 'react-toastify';

const isActiveSession = (session) =>
  Number(session.SessionStatus) === 1 && Number(session.SessionAction) === 1;

const sessionLabel = (session) => session.SessionName || session.SessionEngName || `#${session.SessionID}`;

export default function SessionList() {
  const [search, setSearch] = useState('');
  const [activatingId, setActivatingId] = useState(null);
  const { data: sessions = [], isLoading, isError } = useGetSessionsQuery(
    undefined,
    { refetchOnMountOrArgChange: true },
  );
  const [updateSessionStatus, { isLoading: isUpdatingStatus }] = useStatusUpdateSessionMutation();
  const activeSession = sessions.find(isActiveSession);

  const onActivate = async (session) => {
    const name = sessionLabel(session);
    const message = activeSession
      ? `“${name}”-কে চলতি শিক্ষাবর্ষ করবেন? এখন চলতি আছে “${sessionLabel(activeSession)}”। পুরনো শিক্ষাবর্ষের তথ্য আগের মতোই ব্যবহার করা যাবে।`
      : `“${name}”-কে চলতি শিক্ষাবর্ষ করবেন?`;
    if (!window.confirm(message)) return;

    setActivatingId(session.SessionID);
    try {
      await updateSessionStatus({ id: session.SessionID, SessionStatus: 1 }).unwrap();
      toast.success('চলতি শিক্ষাবর্ষ পরিবর্তন করা হয়েছে।');
    } catch (error) {
      toast.error(error?.data?.message || error?.data?.error || 'চলতি শিক্ষাবর্ষ পরিবর্তন করা যায়নি।');
    } finally {
      setActivatingId(null);
    }
  };
  const filteredSessions = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return sessions;
    return sessions.filter((session) =>
      [session.SessionName, session.SessionEngName, session.SessionAraName].some((value) =>
        String(value || '').toLowerCase().includes(term)
      )
    );
  }, [search, sessions]);

  const columns = [
    {
      title: 'ক্রমিক',
      width: 80,
      render: (_row, index) => convertBijoyToBengali(index + 1),
    },
    { title: 'শিক্ষাবর্ষ', field: 'SessionName' },
    { title: 'ইংরেজি নাম', field: 'SessionEngName' },
    { title: 'আরবি নাম', field: 'SessionAraName' },
    {
      title: 'চলতি শিক্ষাবর্ষ',
      render: (row) => (isActiveSession(row) ? (
        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">চলতি</span>
      ) : (
        <span className="text-xs text-muted">—</span>
      )),
    },
    {
      title: 'অ্যাকশন',
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => showModal('শিক্ষাবর্ষ সম্পাদনা', 'SESSION_EDIT', row.SessionID)}
            className="rounded-full border border-clay px-4 py-2 text-sm font-medium text-clay hover:bg-brand-50"
          >
            সম্পাদনা
          </button>
          {!isActiveSession(row) && (
            <button
              type="button"
              onClick={() => onActivate(row)}
              disabled={isUpdatingStatus}
              className="rounded-full bg-clay px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {activatingId === row.SessionID ? 'পরিবর্তন হচ্ছে...' : 'চলতি শিক্ষাবর্ষ করুন'}
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <main className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-4 flex min-w-0 items-center gap-2 text-sm text-muted">
        <a href="/dashboard" className="shrink-0 hover:text-foreground">হোম</a>
        <span aria-hidden="true">/</span>
        <span className="truncate font-medium text-foreground">শিক্ষাবর্ষ</span>
      </nav>

      <section className="overflow-hidden rounded-md border border-border bg-surface">
        <header className="flex flex-col gap-4 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-icon-bg text-clay">
              <SvgIcon name="UserList" size={22} />
            </span>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-foreground">শিক্ষাবর্ষ ব্যবস্থাপনা</h1>
              <p className="text-sm text-muted">শিক্ষাবর্ষ তৈরি, সম্পাদনা ও চলতি শিক্ষাবর্ষ নির্ধারণ করুন</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => showModal('নতুন শিক্ষাবর্ষ', 'SESSION_ENTRY')}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-cta px-4 py-2 text-sm font-medium text-white hover:bg-cta-hover"
          >
            <SvgIcon name="TbPlus" size={18} />
            নতুন শিক্ষাবর্ষ
          </button>
        </header>

        <div className="space-y-4 p-4 sm:p-6">
          <p className="rounded-md bg-brand-50 px-3 py-2 text-sm text-foreground">
            {activeSession
              ? <>চলতি শিক্ষাবর্ষ: <strong>{sessionLabel(activeSession)}</strong>। </>
              : 'কোনো চলতি শিক্ষাবর্ষ নির্ধারণ করা নেই। '}
            নতুন শিক্ষার্থী নিবন্ধনে চলতি শিক্ষাবর্ষ আগে থেকে বাছাই থাকে। যেকোনো শিক্ষাবর্ষে কাজ করা যায়।
          </p>
          <label className="relative block w-full sm:max-w-sm">
            <span className="sr-only">শিক্ষাবর্ষ অনুসন্ধান</span>
            <svg aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="শিক্ষাবর্ষ অনুসন্ধান করুন" className="h-10 w-full rounded-md border border-border bg-surface px-3 pl-9 text-sm outline-none focus:border-accent" />
          </label>

          {isLoading ? <p className="py-8 text-center text-sm text-muted">তালিকা লোড হচ্ছে...</p>
            : isError ? <p className="py-8 text-center text-sm text-red-600">শিক্ষাবর্ষের তালিকা আনা যায়নি।</p>
            : filteredSessions.length ? <SortableTable columns={columns} data={filteredSessions} isFilterColumn={false} />
            : <p className="py-8 text-center text-sm text-muted">কোনো শিক্ষাবর্ষ পাওয়া যায়নি।</p>}
        </div>
      </section>
    </main>
  );
}
