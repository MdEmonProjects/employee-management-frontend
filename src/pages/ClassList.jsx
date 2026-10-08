import { useMemo, useState } from 'react';
import SvgIcon from '../components/icons/SvgIcon';
import SortableTable from '../components/SortableTable';
import { NavLink } from 'react-router-dom';
import { useGetClassListQuery } from '../features/class/classQuerySlice';
import { showModal } from '../utils/ModalControlar';
export default function ClassList() {
  const [search, setSearch] = useState('');
  const {
    data: classList,
    isLoading: isClassLoading,
    isError: isClassError,
  } = useGetClassListQuery();
  const filteredClasses = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return classList || [];
    return (classList || []).filter((item) =>
      [item.ClassName, item.EnglishClass, item.ArabicClass].some((value) =>
        String(value || '').toLowerCase().includes(term)
      )
    );
  }, [classList, search]);

  const openClassEntryModal = () => {
    showModal("Add Class", "CLASS_ENTRY")

  }

  const openClassEditModal = (id) => {
    showModal('ক্লাস গ্রুপ সম্পাদনা', 'CLASS_EDIT', id);
  };

  const columnsMadrasah = [
    {
      title: "SL",
      hozAlign: 'center',
      width: 80,
      render: (row, index) => <p className="text-sm">{index + 1}</p>,
    },
    {
      title: "মারহালা",
      field: 'ClassName',
      hozAlign: 'center',
    },
    {
      title: "মারহালা ইংরেজি",
      field: 'EnglishClass'
    },
    {
      title: "অ্যাকশন",
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => openClassEditModal(row.ClassID)}
            className="rounded-full border border-clay px-4 py-2 text-[15px] font-medium text-clay hover:bg-brand-50"
          >
            সম্পাদনা
          </button>
          <NavLink to={`/dashboard/academic/user_entry/${row.ClassID}`} className="button--primary rounded-full bg-clay border-border px-5 py-2 text-[17px] font-medium text-white cursor-pointer">
            নিবন্ধন
          </NavLink>
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
          <button type="button" className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-cta px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-cta-hover cursor-pointer" onClick={openClassEntryModal}>
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
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ক্লাস গ্রুপের নাম অনুসন্ধান করুন" className="h-10 w-full rounded-md border border-border bg-surface px-3 pl-9 text-sm text-foreground outline-none focus:border-accent" />
            </label>

          </div>


          {isClassLoading ? <p className="py-8 text-center text-sm text-muted">তালিকা লোড হচ্ছে...</p>
            : isClassError ? <p className="py-8 text-center text-sm text-red-600">ক্লাস গ্রুপের তালিকা আনা যায়নি।</p>
            : filteredClasses.length > 0 ? <SortableTable columns={columnsMadrasah} data={filteredClasses} isFilterColumn={false} />
            : <p className="py-8 text-center text-sm text-muted">কোনো ক্লাস গ্রুপ পাওয়া যায়নি।</p>}


        </div>
      </section>
    </div>
  );
}
