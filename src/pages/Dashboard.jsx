import { useMemo, useState } from 'react';
import { useGetLiveAttendanceQuery } from '../features/attendance/attendanceQuerySlice';

const todayText = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

const formatPunchTime = (value) => {
  if (!value) return '—';
  const [hoursText, minutes] = value.split(':');
  const hours = Number(hoursText);
  if (!Number.isFinite(hours)) return value;
  return `${hours % 12 || 12}:${minutes} ${hours >= 12 ? 'PM' : 'AM'}`;
};

const formatUpdatedTime = (value) => {
  if (!value) return 'Waiting for update';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Updated just now';
  return `Updated ${date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  })}`;
};

function StatCard({ label, value, tone, icon }) {
  const tones = {
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
    blue: 'bg-blue-50 text-blue-700 ring-blue-100',
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">{value}</p>
        </div>
        <span className={`grid size-11 place-items-center rounded-xl ring-1 ${tones[tone]}`}>
          {icon}
        </span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(todayText);
  const [search, setSearch] = useState('');
  const isToday = selectedDate === todayText();
  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetLiveAttendanceQuery(
    { date: selectedDate, limit: 500 },
    {
      pollingInterval: isToday ? 3000 : 0,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    },
  );

  const records = data?.records;
  const filteredRecords = useMemo(() => {
    const attendanceRecords = records ?? [];
    const query = search.trim().toLowerCase();
    if (!query) return attendanceRecords;
    return attendanceRecords.filter((record) =>
      [
        record.userName,
        record.userCode,
        record.userId,
        record.cardNumber,
        record.deviceName,
        record.checkType,
      ].some((value) => String(value ?? '').toLowerCase().includes(query)),
    );
  }, [records, search]);

  const summary = data?.summary ?? { total: 0, onTime: 0, late: 0 };

  return (
    <div className="mx-auto w-full max-w-[1500px] p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Live attendance
            </h1>
            {isToday && (
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-70" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-600" />
                </span>
                LIVE
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted">
            Card punches appear automatically within a few seconds.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className={`size-2 rounded-full ${isError ? 'bg-red-500' : 'bg-emerald-500'}`} />
          {isError ? 'Connection problem' : formatUpdatedTime(data?.updatedAt)}
        </div>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Punches"
          value={summary.total}
          tone="blue"
          icon={<span className="text-xl" aria-hidden="true">▣</span>}
        />
        <StatCard
          label="On time"
          value={summary.onTime}
          tone="green"
          icon={<span className="text-xl" aria-hidden="true">✓</span>}
        />
        <StatCard
          label="Late"
          value={summary.late}
          tone="amber"
          icon={<span className="text-xl" aria-hidden="true">◷</span>}
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-semibold text-foreground">Recent card punches</h2>
            <p className="text-xs text-muted">
              {filteredRecords.length} {filteredRecords.length === 1 ? 'record' : 'records'} shown
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative min-w-0 sm:w-72">
              <span className="sr-only">Search attendance</span>
              <svg className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, ID, card or device"
                className="h-10 w-full rounded-xl border border-border bg-white pl-9 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
            <input
              type="date"
              value={selectedDate}
              max={todayText()}
              onChange={(event) => setSelectedDate(event.target.value || todayText())}
              className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-foreground outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              aria-label="Attendance date"
            />
            <button
              type="button"
              onClick={refetch}
              disabled={isFetching}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-medium text-foreground transition hover:bg-surface-secondary disabled:cursor-wait disabled:opacity-60"
            >
              <svg className={`size-4 ${isFetching ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M20 6v5h-5" />
                <path d="M4 18v-5h5" />
                <path d="M18.4 9A7 7 0 0 0 6.1 6.1L4 8M20 16l-2.1 1.9A7 7 0 0 1 5.6 15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {isError ? (
          <div className="p-10 text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-red-50 text-xl text-red-600">!</div>
            <h3 className="mt-3 font-semibold text-foreground">Could not load attendance</h3>
            <p className="mt-1 text-sm text-muted">Check the server connection and try again.</p>
            <button type="button" onClick={refetch} className="mt-4 rounded-lg bg-clay px-4 py-2 text-sm font-medium text-white hover:bg-clay-dark">
              Try again
            </button>
          </div>
        ) : isLoading ? (
          <div className="space-y-3 p-5" aria-label="Loading attendance">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-14 animate-pulse rounded-xl bg-surface-secondary" />
            ))}
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-50 text-2xl text-emerald-700">▣</div>
            <h3 className="mt-4 font-semibold text-foreground">
              {search ? 'No matching attendance' : 'No card punches yet'}
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
              {search
                ? 'Try a different name, ID, card number or device.'
                : isToday
                  ? 'New punches will appear here automatically.'
                  : 'There are no attendance records for this date.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-table-header-bg text-xs font-semibold uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3">Employee / student</th>
                  <th className="px-5 py-3">Punch time</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Shift</th>
                  <th className="px-5 py-3">Device</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRecords.map((record, index) => (
                  <tr key={record.id} className={`transition hover:bg-table-row-hover ${index === 0 && isToday ? 'bg-emerald-50/40' : ''}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-emerald-100 font-semibold text-emerald-700">
                          {(record.userName || '?').charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground">{record.userName}</p>
                          <p className="text-xs text-muted">
                            ID: {record.userCode ?? record.userId ?? '—'}
                            {record.cardNumber ? ` · Card: ${record.cardNumber}` : ''}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold tabular-nums text-foreground">
                      {formatPunchTime(record.punchTime)}
                    </td>
                    <td className="px-5 py-4 text-foreground">{record.checkType}</td>
                    <td className="px-5 py-4 text-muted">{record.shiftName || '—'}</td>
                    <td className="px-5 py-4 text-muted">{record.deviceName || `Device ${record.deviceId ?? '—'}`}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${record.status === 'late' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {record.status === 'late' ? 'Late' : 'On time'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
