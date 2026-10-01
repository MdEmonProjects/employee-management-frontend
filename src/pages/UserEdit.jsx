import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import DefaultInput from '../components/DefaultInput';
import DefaultSelect from '../components/DefaultSelect';
import PhoneNumberInput from '../components/PhoneNumberInput';
import { useGetClassListQuery } from '../features/class/classQuerySlice';
import { useGetSessionsQuery } from '../features/session/sessionQuerySlice';
import {
  useGetSingleUserQuery,
  useUpdateUserMutation,
} from '../features/user/userQuerySlice';

const EMPTY_OPTIONS = [];

export default function UserEdit() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { data: user, isLoading, isError } = useGetSingleUserQuery(userId);
  const { data: classList = EMPTY_OPTIONS, isLoading: isClassLoading } = useGetClassListQuery();
  const { data: sessionList = EMPTY_OPTIONS, isLoading: isSessionLoading } = useGetSessionsQuery();
  const [updateUser, { isLoading: isSaving }] = useUpdateUserMutation();
  const methods = useForm({
    defaultValues: {
      UserName: '',
      FatherName: '',
      MotherName: '',
      Mobile1: '',
      Mobile2: '',
      GenderID: '',
      SessionID: '',
      ClassID: '',
    },
  });
  const { handleSubmit, reset } = methods;

  useEffect(() => {
    if (!user || isClassLoading || isSessionLoading) return;
    reset({
      UserName: user.UserName ?? '',
      FatherName: user.FatherName ?? '',
      MotherName: user.MotherName ?? '',
      Mobile1: user.Mobile1 ?? '',
      Mobile2: user.Mobile2 ?? '',
      GenderID: user.GenderID == null ? '' : String(user.GenderID),
      SessionID: user.SessionID == null ? '' : String(user.SessionID),
      ClassID: user.ClassID == null ? '' : String(user.ClassID),
    });
  }, [isClassLoading, isSessionLoading, reset, user]);

  const onSubmit = async (formData) => {
    const data = {
      UserName: formData.UserName,
      FatherName: formData.FatherName,
      MotherName: formData.MotherName,
      Mobile1: formData.Mobile1,
      Mobile2: formData.Mobile2,
      ClassID: Number(formData.ClassID),
      ...(formData.GenderID !== '' && { GenderID: Number(formData.GenderID) }),
      ...(formData.SessionID !== '' && { SessionID: Number(formData.SessionID) }),
    };

    try {
      await updateUser({ id: userId, data }).unwrap();
      toast.success('তথ্য সফলভাবে আপডেট হয়েছে।');
      navigate('/dashboard/academic/userlist');
    } catch (error) {
      toast.error(error?.data?.message || 'তথ্য আপডেট করা যায়নি।');
    }
  };

  if (isLoading) {
    return <p className="mx-auto max-w-5xl px-4 py-8 text-sm text-muted">তথ্য লোড হচ্ছে...</p>;
  }

  if (isError || !user) {
    return <p role="alert" className="mx-auto max-w-5xl px-4 py-8 text-sm text-danger">ব্যবহারকারীর তথ্য লোড করা যায়নি।</p>;
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-sm text-muted">
        <button type="button" onClick={() => navigate('/dashboard/academic/userlist')} className="hover:text-foreground">
          হোম
        </button>
        <svg aria-hidden="true" className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6" />
        </svg>
        <span>নিবন্ধন সংক্রান্ত</span>
        <svg aria-hidden="true" className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6" />
        </svg>
        <span aria-current="page" className="truncate font-medium text-foreground">শিক্ষার্থী নিবন্ধন সম্পাদনা</span>
      </nav>

      <section className="overflow-hidden rounded-md border border-border bg-surface">
        <header className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h1 className="text-lg font-semibold text-foreground">শিক্ষার্থী নিবন্ধন ফর্ম সম্পাদনা</h1>
            <p className="mt-1 text-sm text-muted">ব্যক্তিগত তথ্য</p>
          </div>
          <p className="text-sm text-muted">ইউজার কোড: {user.UserCode ?? '—'}</p>
        </header>

        <div className="space-y-4 p-4 sm:p-6">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <DefaultInput label="নাম" placeholder="নাম" registerKey="UserName" />
                <DefaultSelect
                  label="লিঙ্গ"
                  options={[{ id: 1, value: 'ছেলে' }, { id: 2, value: 'মহিলা' }]}
                  registerKey="GenderID"
                  require="লিঙ্গ নির্বাচন করুন"
                  nameField="value"
                  valueField="id"
                  type="number"
                  defaultValue="লিঙ্গ নির্বাচন করুন"
                />
                <DefaultInput label="পিতার নাম" placeholder="পিতার নাম" registerKey="FatherName" />
                <DefaultInput label="মাতার নাম" placeholder="মাতার নাম" registerKey="MotherName" />
                <DefaultSelect
                  label="সেশন"
                  options={sessionList}
                  valueField="SessionID"
                  nameField="SessionName"
                  registerKey="SessionID"
                  type="number"
                  defaultValue="সেশন নির্বাচন করুন"
                />
                <DefaultSelect
                  label="শ্রেণি"
                  options={classList}
                  valueField="ClassID"
                  nameField="ClassName"
                  registerKey="ClassID"
                  type="number"
                  require="শ্রেণি নির্বাচন করুন"
                  defaultValue="শ্রেণি নির্বাচন করুন"
                />
                <PhoneNumberInput
                  label="মোবাইল ১"
                  registerKey="Mobile1"
                  require
                  minLength={11}
                  maxLength={11}
                  allowedPrefixes={['013', '014', '015', '016', '017', '018', '019']}
                />
                <PhoneNumberInput
                  label="মোবাইল ২"
                  registerKey="Mobile2"
                  require={false}
                  minLength={11}
                  maxLength={11}
                />
              </div>

              <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/academic/userlist')}
                  className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-surface-secondary"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-clay px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {isSaving ? 'আপডেট হচ্ছে…' : 'তথ্য আপডেট করুন'}
                </button>
              </div>
            </form>
          </FormProvider>
        </div>
      </section>
    </main>
  );
}
