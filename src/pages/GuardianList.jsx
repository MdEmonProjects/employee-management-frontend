import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useGetGuardiansQuery, useRemoveGuardianLinkMutation } from '../features/guardian/guardianQuerySlice';

export default function GuardianList() {
  const [search, setSearch] = useState('');
  const { data: guardians = [], isLoading, isError } = useGetGuardiansQuery();
  const [removeLink, { isLoading: isRemoving }] = useRemoveGuardianLinkMutation();
  const filtered = useMemo(() => guardians.filter((guardian) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return [guardian.UserName, guardian.UserCode, guardian.Mobile1,
      ...guardian.Students.flatMap((student) => [student.StudentName, student.StudentCode])]
      .some((value) => String(value ?? '').toLowerCase().includes(term));
  }), [guardians, search]);

  const onRemove = async (link) => {
    if (!window.confirm(`${link.StudentName || link.StudentCode} এর অভিভাবক সংযোগ মুছবেন?`)) return;
    try {
      await removeLink(link.ID).unwrap();
      toast.success('সংযোগ মুছে ফেলা হয়েছে।');
    } catch (error) {
      toast.error(error?.data?.message || 'সংযোগ মুছতে পারেনি।');
    }
  };

  return (
    <main className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
      <nav className="mb-4 text-sm text-muted"><Link to="/dashboard">হোম</Link> / অভিভাবক সংক্রান্ত</nav>
      <section className="rounded-md border border-border bg-surface">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4 sm:p-6">
          <div>
            <h1 className="text-lg font-semibold text-foreground">অভিভাবক ও শিক্ষার্থী সংযোগ</h1>
            <p className="text-sm text-muted">শুধু Guardian_Info-তে সংযুক্ত অভিভাবকদের দেখানো হচ্ছে।</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/dashboard/guardians/link" className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-secondary">বিদ্যমান অভিভাবক/শিক্ষক যুক্ত করুন</Link>
            <Link to="/dashboard/guardians/new" className="rounded-lg bg-clay px-4 py-2 text-sm font-semibold text-white">নতুন অভিভাবক</Link>
          </div>
        </header>
        <div className="space-y-4 p-4 sm:p-6">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="অভিভাবক বা শিক্ষার্থী খুঁজুন" className="h-10 w-full max-w-md rounded-md border border-border px-3 text-sm" />
          {isLoading ? <p className="py-8 text-center text-muted">তালিকা লোড হচ্ছে…</p>
            : isError ? <p className="py-8 text-center text-red-600">তালিকা আনা যায়নি।</p>
              : filtered.length === 0 ? <p className="py-8 text-center text-muted">কোনো সংযুক্ত অভিভাবক পাওয়া যায়নি।</p>
                : filtered.map((guardian) => (
                  <article key={guardian.GuardianUserID} className="rounded-md border border-border">
                    <div className="flex flex-wrap items-center justify-between gap-2 bg-table-header-bg px-4 py-3">
                      <div>
                        <h2 className="font-semibold text-foreground">{guardian.UserName || `#${guardian.UserCode || guardian.GuardianUserID}`}
                          {guardian.UserTypeID === 2 && <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">শিক্ষক/স্টাফ</span>}
                        </h2>
                        <p className="text-xs text-muted">কোড: {guardian.UserCode ?? '—'} · মোবাইল: {guardian.Mobile1 || '—'} · {guardian.Students.length} জন শিক্ষার্থী</p>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/dashboard/guardians/${guardian.GuardianUserID}/students`} className="rounded-md border border-border px-3 py-2 text-sm">শিক্ষার্থী যুক্ত/সম্পাদনা</Link>
                        <Link to={`/dashboard/guardians/edit/${guardian.GuardianUserID}`} className="rounded-md border border-border px-3 py-2 text-sm">তথ্য সম্পাদনা</Link>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[550px] text-left text-sm">
                        <thead><tr className="text-muted"><th className="px-4 py-2">শিক্ষার্থী</th><th className="px-4 py-2">সম্পর্ক</th><th className="px-4 py-2">অভিভাবকের কার্ড</th><th className="px-4 py-2" /></tr></thead>
                        <tbody>{guardian.Students.map((student) => (
                          <tr key={student.ID} className="border-t border-border">
                            <td className="px-4 py-3">{student.StudentName || '—'} ({student.StudentCode ?? student.StudentUserID})</td>
                            <td className="px-4 py-3">{student.RelationName || '—'}</td>
                            <td className="px-4 py-3">{student.CardNumber || '—'}</td>
                            <td className="px-4 py-3 text-right"><button type="button" disabled={isRemoving} onClick={() => onRemove(student)} className="text-red-600 disabled:opacity-50">মুছুন</button></td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  </article>
                ))}
        </div>
      </section>
    </main>
  );
}
