import { useState } from 'react';
import SvgIcon from '../components/icons/SvgIcon';
import SortableTable from '../components/SortableTable';
import { showModal } from '../utils/ModalControlar';
import { useGetTimeCheckListQuery } from '../features/shift/shiftQuerySlice';
export default function TimeCheckList() {
  const [search, setSearch] = useState('');
  const {
    data: timeCheckList,
    isLoading,
    isError,
  } = useGetTimeCheckListQuery();


  const openShiftEntryModal = () => {
    showModal('নতুন সময় যাচাইয়ের ধরন', 'TIME_CHECK_ENTRY');

  }
  const openShiftEditModal = (timeCheck) => {
    showModal('সময় যাচাইয়ের ধরন সম্পাদনা', 'TIME_CHECK_EDIT', timeCheck.ID);

  }

  const filteredTimeChecks = (timeCheckList || []).filter((timeCheck) =>
    `${timeCheck.TypeNameBangla || ''} ${timeCheck.TypeNameEnglish || ''}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );


  const columnsMadrasah = [
    {
      title: "SL",
      hozAlign: 'center',
      width: 80,
      render: (_, index) => <p className="text-sm">{index + 1}</p>,
    },
    {
      title: "নাম (বাংলা)",
      field: 'TypeNameBangla',
      hozAlign: 'center',
    },
    {
      title: "নাম (ইংরেজি)",
      field: 'TypeNameEnglish',
    },
    {
      title: "অ্যাকশন",
      render: (row) => (
        <div className="space-x-2">
          <button type='button' onClick={() => openShiftEditModal(row)} className="button--primary rounded-full bg-clay border-border px-5 py-2 text-[17px] font-medium text-white cursor-pointer">
            সম্পাদনা
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
        <span aria-current="page" className="truncate font-medium text-foreground">সময় যাচাইয়ের ধরন</span>
      </nav>

      <section className="overflow-hidden rounded-md border border-border bg-surface">
        <header className="flex flex-col gap-4 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-icon-bg text-clay">
              <SvgIcon name="UserList" size={22} />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold text-foreground">সময় যাচাইয়ের ধরন</h1>
              <p className="text-sm text-muted">সময় যাচাইয়ের ধরনের তালিকা</p>
            </div>
          </div>
          <button type="button" className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-cta px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-cta-hover cursor-pointer" onClick={openShiftEntryModal}>
            <SvgIcon name="TbPlus" size={18} />
            নতুন ধরন নিবন্ধন
          </button>
        </header>

        <div className="space-y-4 p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <label className="relative block sm:col-span-2 xl:col-span-1">
              <span className="sr-only">সময় যাচাইয়ের ধরন খুঁজুন</span>
              <svg aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ধরনের নাম খুঁজুন" className="h-10 w-full rounded-md border border-border bg-surface px-3 pl-9 text-sm text-foreground outline-none focus:border-accent" />
            </label>

          </div>


          {isLoading && <p className="py-6 text-center text-muted">তালিকা আনা হচ্ছে…</p>}
          {isError && <p className="py-6 text-center text-red-600">তালিকা আনা যায়নি।</p>}
          {!isLoading && !isError && filteredTimeChecks.length > 0 && (
            <SortableTable columns={columnsMadrasah} data={filteredTimeChecks} isFilterColumn={false} />
          )}
          {!isLoading && !isError && filteredTimeChecks.length === 0 && (
            <p className="py-6 text-center text-muted">কোনো ধরন পাওয়া যায়নি।</p>
          )}


        </div>
      </section>
    </div>
  );
}
