import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  useCreateGuardianRelationMutation,
  useGetGuardianRelationsQuery,
  useGetGuardiansQuery,
  useSearchGuardianStudentsQuery,
  useSaveGuardianLinksMutation,
  useRemoveGuardianLinkMutation,
} from '../features/guardian/guardianQuerySlice';
import { useGetUserBySearchQuery } from '../features/user/userQuerySlice';
import { useGetClassListQuery } from '../features/class/classQuerySlice';
import { useGetSessionsQuery } from '../features/session/sessionQuerySlice';

const fieldClass = 'h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground';

export default function GuardianLinks() {
  const { guardianId } = useParams();
  const navigate = useNavigate();
  const [guardianUserId, setGuardianUserId] = useState(guardianId || '');
  const [rows, setRows] = useState([{ studentUserId: '', relationId: '' }]);
  const [relationName, setRelationName] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [debouncedStudentSearch, setDebouncedStudentSearch] = useState('');
  const [classId, setClassId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const { data: guardians = [] } = useGetGuardiansQuery();
  const { data: relations = [] } = useGetGuardianRelationsQuery();
  const { data: classes = [] } = useGetClassListQuery();
  const { data: sessions = [] } = useGetSessionsQuery();
  const hasStudentCriteria = Boolean(debouncedStudentSearch || classId || sessionId);
  const { currentData: studentResults, isFetching: studentsLoading, isError: studentsError } =
    useSearchGuardianStudentsQuery(
      { search: debouncedStudentSearch, ClassID: classId, SessionID: sessionId },
      { skip: !hasStudentCriteria },
    );
  const searchReady = studentSearch.trim() === debouncedStudentSearch;
  const students = searchReady && hasStudentCriteria ? studentResults?.items ?? [] : [];
  const isSearchingStudents = Boolean(studentSearch.trim() || classId || sessionId) && (!searchReady || studentsLoading);
  const { data: teachers = [] } = useGetUserBySearchQuery({ UserTypeID: 2 });
  const { data: people = [] } = useGetUserBySearchQuery({ UserTypeID: 3 });
  const [saveLinks, { isLoading: isSaving }] = useSaveGuardianLinksMutation();
  const [removeLink] = useRemoveGuardianLinkMutation();
  const [createRelation, { isLoading: isCreatingRelation }] = useCreateGuardianRelationMutation();

  const candidates = useMemo(() => [...people, ...teachers].sort((a, b) =>
    String(a.UserName || '').localeCompare(String(b.UserName || ''))), [people, teachers]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedStudentSearch(studentSearch.trim()), 300);
    return () => clearTimeout(timer);
  }, [studentSearch]);

  useEffect(() => {
    if (!guardianId || !guardians.length) return;
    const existing = guardians.find((item) => String(item.GuardianUserID) === String(guardianId));
    if (existing?.Students.length) {
      setRows(existing.Students.map((student) => ({
        linkId: student.ID,
        studentUserId: String(student.StudentUserID),
        studentName: student.StudentName,
        studentCode: student.StudentCode,
        relationId: String(student.RelationID || ''),
      })));
    }
  }, [guardianId, guardians]);

  const changeRow = (index, key, value) => setRows((current) => current.map((row, rowIndex) =>
    rowIndex === index ? { ...row, [key]: value } : row));

  const changeStudent = (index, value) => {
    const student = students.find((item) => String(item.UserID) === value);
    setRows((current) => current.map((row, rowIndex) => rowIndex === index
      ? {
          ...row,
          studentUserId: value,
          studentName: student?.UserName ?? '',
          studentCode: student?.UserCode ?? '',
        }
      : row));
  };

  const removeRow = async (index) => {
    const row = rows[index];
    if (row.linkId) {
      if (!window.confirm('এই শিক্ষার্থীর অভিভাবক সংযোগ মুছবেন?')) return;
      try {
        await removeLink(row.linkId).unwrap();
        toast.success('সংযোগ মুছে ফেলা হয়েছে।');
      } catch (error) {
        toast.error(error?.data?.message || 'সংযোগ মুছতে পারেনি।');
        return;
      }
    }
    setRows((current) => current.filter((_, rowIndex) => rowIndex !== index));
  };

  const addRelation = async () => {
    if (!relationName.trim()) return;
    try {
      await createRelation(relationName.trim()).unwrap();
      setRelationName('');
      toast.success('সম্পর্ক যোগ হয়েছে।');
    } catch (error) {
      toast.error(error?.data?.message || 'সম্পর্ক যোগ করা যায়নি।');
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!guardianUserId || !rows.length || rows.some((row) => !row.studentUserId || !row.relationId)) {
      toast.error('অভিভাবক, শিক্ষার্থী ও সম্পর্ক নির্বাচন করুন।');
      return;
    }
    try {
      await saveLinks({
        guardianUserId: Number(guardianUserId),
        links: rows.map((row) => ({
          studentUserId: Number(row.studentUserId),
          relationId: Number(row.relationId),
        })),
      }).unwrap();
      toast.success('শিক্ষার্থীদের অভিভাবকের সাথে যুক্ত করা হয়েছে।');
      navigate('/dashboard/guardians/list');
    } catch (error) {
      toast.error(error?.data?.message || 'সংযোগ সংরক্ষণ করা যায়নি।');
    }
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
      <nav className="mb-4 text-sm text-muted"><Link to="/dashboard/guardians/list">অভিভাবক সংক্রান্ত</Link> / শিক্ষার্থী যুক্ত করুন</nav>
      <section className="rounded-md border border-border bg-surface">
        <header className="border-b border-border p-4 sm:p-6">
          <h1 className="text-lg font-semibold text-foreground">অভিভাবকের শিক্ষার্থী যুক্ত করুন</h1>
          <p className="text-sm text-muted">এক অভিভাবকের একাধিক শিক্ষার্থী এবং এক শিক্ষার্থীর একাধিক অভিভাবক থাকতে পারে। প্রতিটি সংযোগের জন্য আলাদা সম্পর্ক ও অভিভাবক কার্ড/ফিঙ্গার এনরোলমেন্ট থাকবে।</p>
        </header>
        <form onSubmit={onSubmit} className="space-y-5 p-4 sm:p-6">
          <div>
            <label htmlFor="guardianUserId" className="mb-1 block text-sm font-semibold">অভিভাবক বা শিক্ষক/স্টাফ</label>
            <select id="guardianUserId" value={guardianUserId} disabled={Boolean(guardianId)} onChange={(event) => setGuardianUserId(event.target.value)} className={fieldClass}>
              <option value="">নির্বাচন করুন</option>
              {candidates.map((person) => <option key={person.UserID} value={person.UserID}>{person.UserName || 'নাম নেই'} · {person.UserCode ?? person.UserID} · {person.UserTypeID === 2 ? 'শিক্ষক/স্টাফ' : 'অভিভাবক'}</option>)}
            </select>
            <p className="mt-1 text-xs text-muted">নতুন অভিভাবক প্রয়োজন হলে <Link to="/dashboard/guardians/new" className="text-clay underline">নিবন্ধন করুন</Link>।</p>
          </div>
          <div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
              <label htmlFor="studentSearch" className="block text-sm font-semibold">শিক্ষার্থী খুঁজুন
                <input id="studentSearch" value={studentSearch} onChange={(event) => setStudentSearch(event.target.value)} placeholder="নাম, কোড বা মোবাইল লিখুন" className={`${fieldClass} mt-1`} />
              </label>
              <label htmlFor="studentClass" className="block text-sm font-semibold">শ্রেণি
                <select id="studentClass" value={classId} onChange={(event) => setClassId(event.target.value)} className={`${fieldClass} mt-1`}>
                  <option value="">সব শ্রেণি</option>
                  {classes.map((item) => <option key={item.ClassID} value={item.ClassID}>{item.ClassName || item.EnglishClass || item.ClassID}</option>)}
                </select>
              </label>
              <label htmlFor="studentSession" className="block text-sm font-semibold">সেশন
                <select id="studentSession" value={sessionId} onChange={(event) => setSessionId(event.target.value)} className={`${fieldClass} mt-1`}>
                  <option value="">সব সেশন</option>
                  {sessions.map((item) => <option key={item.SessionID} value={item.SessionID}>{item.SessionName || item.SessionEngName || item.SessionID}</option>)}
                </select>
              </label>
            </div>
            <p className="mt-1 text-xs text-muted" aria-live="polite">
              {!studentSearch.trim() && !classId && !sessionId ? 'নাম, কোড বা মোবাইল লিখুন, অথবা শ্রেণি বা সেশন নির্বাচন করুন।'
                : isSearchingStudents ? 'শিক্ষার্থী খোঁজা হচ্ছে…'
                  : studentsError ? 'শিক্ষার্থী খোঁজা যায়নি। আবার চেষ্টা করুন।'
                    : studentResults?.hasMore ? 'অনেক শিক্ষার্থী মিলেছে। আরও নির্দিষ্ট নাম, কোড, শ্রেণি বা সেশন দিন।'
                      : `${students.length} জন শিক্ষার্থী পাওয়া গেছে।`}
            </p>
          </div>
          <div className="space-y-3">
            {rows.map((row, index) => (
              <div key={index} className="grid gap-3 rounded-md border border-border p-3 sm:grid-cols-[1fr_1fr_auto]">
                <label className="text-sm">শিক্ষার্থী
                  <select value={row.studentUserId} disabled={Boolean(row.linkId)} onChange={(event) => changeStudent(index, event.target.value)} className={`${fieldClass} mt-1 disabled:bg-surface-secondary`}>
                    <option value="">{isSearchingStudents ? 'খোঁজা হচ্ছে…' : 'শিক্ষার্থী নির্বাচন করুন'}</option>
                    {row.studentUserId && !students.some((student) => String(student.UserID) === row.studentUserId) && (
                      <option value={row.studentUserId}>{row.studentName || 'নাম নেই'} · {row.studentCode || row.studentUserId}</option>
                    )}
                    {students.map((student) => <option key={student.UserID} value={student.UserID}>{student.UserName || 'নাম নেই'} · {student.UserCode ?? student.UserID} · {student.Mobile1 || 'মোবাইল নেই'}</option>)}
                  </select>
                </label>
                <label className="text-sm">সম্পর্ক
                  <select value={row.relationId} onChange={(event) => changeRow(index, 'relationId', event.target.value)} className={`${fieldClass} mt-1`}>
                    <option value="">সম্পর্ক নির্বাচন করুন</option>
                    {relations.map((relation) => <option key={relation.RelationID} value={relation.RelationID}>{relation.RelationName || relation.RelationID}</option>)}
                  </select>
                </label>
                <button type="button" onClick={() => removeRow(index)} disabled={rows.length === 1 && !row.linkId} className="self-end rounded-md border border-border px-3 py-2.5 text-sm text-red-600 disabled:opacity-40">সরান</button>
              </div>
            ))}
            <button type="button" onClick={() => setRows((current) => [...current, { studentUserId: '', relationId: '' }])} className="text-sm font-semibold text-clay">+ আরেক শিক্ষার্থী</button>
          </div>
          <div className="flex flex-wrap items-end gap-2 rounded-md bg-surface-secondary p-3">
            <label className="min-w-[200px] flex-1 text-sm">নতুন সম্পর্ক
              <input value={relationName} onChange={(event) => setRelationName(event.target.value)} placeholder="যেমন: পিতা, মাতা" maxLength={50} className={`${fieldClass} mt-1`} />
            </label>
            <button type="button" onClick={addRelation} disabled={isCreatingRelation || !relationName.trim()} className="rounded-md border border-border px-4 py-2.5 text-sm disabled:opacity-50">সম্পর্ক যোগ করুন</button>
          </div>
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Link to="/dashboard/guardians/list" className="rounded-md border border-border px-4 py-2.5 text-sm">বাতিল</Link>
            <button type="submit" disabled={isSaving} className="rounded-md bg-clay px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{isSaving ? 'সংরক্ষণ হচ্ছে…' : 'সংযোগ সংরক্ষণ করুন'}</button>
          </div>
        </form>
      </section>
    </main>
  );
}
