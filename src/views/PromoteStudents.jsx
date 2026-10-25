import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { useGetClassListQuery } from '../features/class/classQuerySlice';
import { closeModal } from '../features/modal/modalSlice';
import { useGetSessionsQuery } from '../features/session/sessionQuerySlice';
import { usePromoteStudentsMutation } from '../features/user/userQuerySlice';

const selectClassName = 'mt-2 h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-accent';

export default function PromoteStudents({ userIds = [] }) {
  const dispatch = useDispatch();
  const [classId, setClassId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { data: classes = [], isLoading: classesLoading, isError: classesError } = useGetClassListQuery();
  const { data: sessions = [], isLoading: sessionsLoading, isError: sessionsError } = useGetSessionsQuery();
  const [promoteStudents, { isLoading: isPromoting }] = usePromoteStudentsMutation();
  const count = Array.isArray(userIds) ? userIds.length : 0;

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!count || !classId || !sessionId) {
      setErrorMessage('নতুন শ্রেণি ও সেশন নির্বাচন করুন।');
      return;
    }
    setErrorMessage('');
    try {
      const result = await promoteStudents({
        userIds,
        ClassID: Number(classId),
        SessionID: Number(sessionId),
      }).unwrap();
      window.dispatchEvent(new CustomEvent('student-promotion-complete', { detail: { userIds } }));
      dispatch(closeModal());
      toast.success(`${result.updated} জন শিক্ষার্থীর শ্রেণি ও সেশন পরিবর্তন হয়েছে।`);
    } catch (error) {
      setErrorMessage(error?.status === 409
        ? 'নির্বাচিত শিক্ষার্থীদের তথ্য বদলেছে। তালিকা রিফ্রেশ করে আবার নির্বাচন করুন।'
        : error?.status === 403
          ? 'এই কাজ করার অনুমতি নেই।'
          : 'শিক্ষার্থীদের প্রমোট করা যায়নি। আবার চেষ্টা করুন।');
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="rounded-lg bg-surface-secondary px-4 py-3 text-sm text-foreground">
        <span className="font-semibold">{count} জন শিক্ষার্থী নির্বাচিত।</span>{' '}
        নতুন শ্রেণি ও সেশন নির্বাচন করুন।
      </p>

      <label htmlFor="promotion-class" className="block text-sm font-semibold text-foreground">
        নতুন শ্রেণি <span className="text-red-600">*</span>
        <select id="promotion-class" value={classId} onChange={(event) => { setClassId(event.target.value); setErrorMessage(''); }} disabled={isPromoting || classesLoading || classesError} required autoFocus className={selectClassName}>
          <option value="">{classesLoading ? 'শ্রেণি লোড হচ্ছে…' : 'শ্রেণি নির্বাচন করুন'}</option>
          {classes.map((item) => <option key={item.ClassID} value={item.ClassID}>{item.ClassName || item.EnglishClass || item.ClassID}</option>)}
        </select>
      </label>

      <label htmlFor="promotion-session" className="block text-sm font-semibold text-foreground">
        নতুন সেশন <span className="text-red-600">*</span>
        <select id="promotion-session" value={sessionId} onChange={(event) => { setSessionId(event.target.value); setErrorMessage(''); }} disabled={isPromoting || sessionsLoading || sessionsError} required className={selectClassName}>
          <option value="">{sessionsLoading ? 'সেশন লোড হচ্ছে…' : 'সেশন নির্বাচন করুন'}</option>
          {sessions.map((item) => <option key={item.SessionID} value={item.SessionID}>{item.SessionName || item.SessionEngName || item.SessionID}</option>)}
        </select>
      </label>

      {(classesError || sessionsError) && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">শ্রেণি বা সেশনের তালিকা আনা যায়নি। পৃষ্ঠা রিফ্রেশ করে আবার চেষ্টা করুন।</p>}
      {errorMessage && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>}

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <button type="button" onClick={() => dispatch(closeModal())} disabled={isPromoting} className="h-10 rounded-md border border-border bg-surface px-4 text-sm font-medium text-foreground hover:bg-surface-secondary disabled:opacity-50">বাতিল</button>
        <button type="submit" disabled={!count || !classId || !sessionId || isPromoting || classesError || sessionsError} className="h-10 rounded-md bg-clay px-5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">{isPromoting ? 'প্রমোট হচ্ছে…' : `${count} জনকে প্রমোট করুন`}</button>
      </div>
    </form>
  );
}
