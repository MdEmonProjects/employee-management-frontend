import { FormProvider, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import DefaultInput from '../components/DefaultInput';
import DefaultSelect from '../components/DefaultSelect';
import PhoneNumberInput from '../components/PhoneNumberInput';
import SvgIcon from '../components/icons/SvgIcon';
import { useCreateUserMutation } from '../features/user/userQuerySlice';

export default function StaffEntry({ userType = 2 }) {
  const isGuardian = userType === 3;
  const label = isGuardian ? 'অভিভাবক' : 'শিক্ষক/স্টাফ';
  const listPath = isGuardian ? '/dashboard/guardians/list' : '/dashboard/staff/list';
  const navigate = useNavigate();
  const methods = useForm({
    defaultValues: {
      UserName: '', GenderID: '', FatherName: '', MotherName: '', Mobile1: '', Mobile2: '',
    },
  });
  const [createUser, { isLoading }] = useCreateUserMutation();

  const onSubmit = async (values) => {
    try {
      const created = await createUser({ ...values, UserTypeID: userType }).unwrap();
      toast.success(`${label} সফলভাবে নিবন্ধিত হয়েছে।`);
      navigate(isGuardian ? `/dashboard/guardians/${created.insertedUserID}/students` : listPath);
    } catch (error) {
      toast.error(error?.data?.message || `${label} নিবন্ধন করা যায়নি।`);
    }
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-sm text-muted">
        <Link to="/dashboard" className="hover:text-foreground">হোম</Link>
        <span aria-hidden="true">/</span>
        <Link to={listPath} className="hover:text-foreground">{label} সংক্রান্ত</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="font-medium text-foreground">নতুন নিবন্ধন</span>
      </nav>

      <section className="overflow-hidden rounded-md border border-border bg-surface">
        <header className="flex items-center gap-3 border-b border-border px-4 py-4 sm:px-6">
          <span className="flex size-10 items-center justify-center rounded-md bg-brand-icon-bg text-brand-600">
            <SvgIcon name="UserPlus" size={22} />
          </span>
          <div>
            <h1 className="text-lg font-semibold text-foreground">{label} নিবন্ধন</h1>
            <p className="text-sm text-muted">ব্যক্তিগত তথ্য</p>
          </div>
        </header>

        <div className="p-4 sm:p-6">
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                <DefaultInput label="নাম" placeholder="নাম" registerKey="UserName" />
                <DefaultSelect
                  label="লিঙ্গ"
                  options={[{ id: 1, value: 'পুরুষ' }, { id: 2, value: 'মহিলা' }]}
                  registerKey="GenderID"
                  nameField="value"
                  valueField="id"
                  defaultValue="লিঙ্গ নির্বাচন করুন"
                />
                <DefaultInput label="পিতার নাম" placeholder="পিতার নাম" registerKey="FatherName" />
                <DefaultInput label="মাতার নাম" placeholder="মাতার নাম" registerKey="MotherName" />
                <PhoneNumberInput label="মোবাইল ১" registerKey="Mobile1" />
                <PhoneNumberInput label="মোবাইল ২" registerKey="Mobile2" />
              </div>
              <div className="mt-6 flex justify-end gap-3 border-t border-border pt-4">
                <Link to={listPath} className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-surface-secondary">বাতিল</Link>
                <button type="submit" disabled={isLoading} className="rounded-lg bg-clay px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                  {isLoading ? 'তৈরি হচ্ছে…' : 'নিবন্ধন করুন'}
                </button>
              </div>
            </form>
          </FormProvider>
        </div>
      </section>
    </main>
  );
}
