import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Brand from '../../components/Brand';
import SortableTable from '../../components/SortableTable';
import SvgIcon from '../../components/icons/SvgIcon';
import convertBijoyToBengali from '../../utils/uniconveter';
import {
  clearSuperAdminToken,
  superAdminQuerySlice,
  useCreateInstituteMutation,
  useGetInstitutesQuery,
  useGetMasterStatusQuery,
  useSetupMasterMutation,
} from '../../features/superAdmin/superAdminQuerySlice';
import { useDispatch } from 'react-redux';

const inputClass =
  'mt-1.5 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm outline-none focus:border-accent';

const toEnglishDigits = (value) =>
  String(value ?? '').replace(/[০-৯]/g, (digit) => String('০১২৩৪৫৬৭৮৯'.indexOf(digit)));

const formatDate = (value) => (value ? new Date(value).toLocaleDateString('bn-BD') : '—');

function Field({ label, hint, error, children }) {
  return (
    <label className="block text-sm font-medium text-foreground">
      <span>{label}</span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs font-normal text-red-600">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs font-normal text-muted">{hint}</span>
      ) : null}
    </label>
  );
}

function MasterStatusBanner() {
  const { data: status, isLoading, isError, refetch } = useGetMasterStatusQuery();
  const [setupMaster, { isLoading: isSettingUp }] = useSetupMasterMutation();

  if (isLoading || (status?.tablesReady && !isError)) return null;

  const onSetup = async () => {
    try {
      const result = await setupMaster().unwrap();
      toast.success(
        result.createdDatabase
          ? `মাস্টার ডাটাবেস “${result.database}” তৈরি হয়েছে।`
          : `মাস্টার ডাটাবেস “${result.database}” প্রস্তুত।`,
      );
    } catch (error) {
      toast.error(error?.data?.message || 'মাস্টার ডাটাবেস প্রস্তুত করা যায়নি।');
    }
  };

  if (isError) {
    return (
      <div className="mb-4 flex flex-col gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between">
        <span>ডাটাবেস সার্ভারে সংযোগ করা যায়নি। সার্ভারের .env এর DB_ সেটিংস দেখুন।</span>
        <button type="button" onClick={refetch} className="rounded-full border border-red-300 px-4 py-1.5 font-medium hover:bg-red-100">
          আবার চেষ্টা
        </button>
      </div>
    );
  }

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
      <span>
        মাস্টার ডাটাবেস <strong>{status?.database}</strong>{' '}
        {status?.databaseExists ? 'আছে, কিন্তু টেবিল তৈরি হয়নি।' : 'এখনো তৈরি হয়নি।'} প্রথমে এটি প্রস্তুত করুন।
      </span>
      <button
        type="button"
        onClick={onSetup}
        disabled={isSettingUp}
        className="shrink-0 rounded-full bg-cta px-4 py-2 font-medium text-white hover:bg-cta-hover disabled:opacity-60"
      >
        {isSettingUp ? 'প্রস্তুত হচ্ছে…' : 'মাস্টার ডাটাবেস প্রস্তুত করুন'}
      </button>
    </div>
  );
}

function NewInstituteForm({ onDone }) {
  const [createInstitute, { isLoading }] = useCreateInstituteMutation();
  const [serverError, setServerError] = useState('');
  const [databaseNameEdited, setDatabaseNameEdited] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({ mode: 'onTouched' });

  const code = useWatch({ control, name: 'code' });
  useEffect(() => {
    if (databaseNameEdited) return;
    const digits = toEnglishDigits(code).trim();
    setValue('databaseName', /^\d+$/.test(digits) ? `${digits}_` : '');
  }, [code, databaseNameEdited, setValue]);

  const onSubmit = async (form) => {
    setServerError('');
    try {
      const created = await createInstitute({
        code: toEnglishDigits(form.code).trim(),
        databaseName: form.databaseName.trim(),
        instituteName: form.instituteName.trim(),
        adminUsername: form.adminUsername.trim(),
        adminPassword: form.adminPassword,
        mobile: toEnglishDigits(form.mobile).trim(),
      }).unwrap();
      toast.success('নতুন প্রতিষ্ঠান তৈরি হয়েছে।');
      onDone(created);
    } catch (error) {
      setServerError(error?.data?.message || 'প্রতিষ্ঠান তৈরি করা যায়নি।');
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-4 border-b border-border bg-section-header px-4 py-5 sm:px-6"
    >
      <div>
        <h2 className="text-base font-semibold text-foreground">নতুন প্রতিষ্ঠান</h2>
        <p className="text-sm text-muted">
          নতুন ডাটাবেস তৈরি হবে, সব টেবিল বসবে এবং এই অ্যাডমিন দিয়ে প্রতিষ্ঠানের লগইন পেজে ঢোকা যাবে।
        </p>
      </div>

      {serverError && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {serverError}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="প্রতিষ্ঠানের কোড *" hint="লগইনে “Madrasha Code” হিসেবে লাগবে" error={errors.code?.message}>
          <input
            inputMode="numeric"
            className={inputClass}
            {...register('code', {
              required: 'কোড দিন',
              validate: (value) => /^\d+$/.test(toEnglishDigits(value).trim()) || 'শুধু সংখ্যা দিন',
            })}
          />
        </Field>
        <Field
          label="ডাটাবেস নাম *"
          hint="যেমন 101_mirpurkazipara; শুধু ছোট হাতের a-z, 0-9 ও _"
          error={errors.databaseName?.message}
        >
          <input
            spellCheck={false}
            autoCapitalize="off"
            className={`${inputClass} font-mono`}
            {...register('databaseName', {
              required: 'ডাটাবেস নাম দিন',
              pattern: {
                value: /^[a-z0-9][a-z0-9_]{2,62}$/,
                message: 'শুধু ছোট হাতের a-z, 0-9 ও _; _ দিয়ে শুরু নয় (৩–৬৩ অক্ষর)',
              },
              onChange: () => {
                setDatabaseNameEdited(true);
              },
            })}
          />
        </Field>
        <Field label="প্রতিষ্ঠানের নাম *" error={errors.instituteName?.message}>
          <input
            className={inputClass}
            {...register('instituteName', {
              required: 'প্রতিষ্ঠানের নাম দিন',
              maxLength: { value: 100, message: 'সর্বোচ্চ ১০০ অক্ষর' },
            })}
          />
        </Field>
        <Field label="অ্যাডমিন ইউজারনেম *" error={errors.adminUsername?.message}>
          <input
            autoComplete="off"
            className={inputClass}
            {...register('adminUsername', {
              required: 'ইউজারনেম দিন',
              pattern: { value: /^\S{3,25}$/, message: '৩–২৫ অক্ষর, ফাঁকা জায়গা ছাড়া' },
            })}
          />
        </Field>
        <Field label="অ্যাডমিন পাসওয়ার্ড *" error={errors.adminPassword?.message}>
          <input
            type="password"
            autoComplete="new-password"
            className={inputClass}
            {...register('adminPassword', {
              required: 'পাসওয়ার্ড দিন',
              minLength: { value: 6, message: 'কমপক্ষে ৬ অক্ষর' },
            })}
          />
        </Field>
        <Field label="মোবাইল" hint="ঐচ্ছিক, ১১ সংখ্যা" error={errors.mobile?.message}>
          <input
            inputMode="tel"
            className={inputClass}
            {...register('mobile', {
              validate: (value) => {
                const digits = toEnglishDigits(value).trim();
                return !digits || /^\d{11}$/.test(digits) || '১১ সংখ্যার মোবাইল নম্বর দিন';
              },
            })}
          />
        </Field>
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={() => onDone(null)}
          className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-secondary"
        >
          বাতিল
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-full bg-clay px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {isLoading ? 'তৈরি হচ্ছে… (কয়েক সেকেন্ড লাগতে পারে)' : 'প্রতিষ্ঠান তৈরি করুন'}
        </button>
      </div>
    </form>
  );
}

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [lastCreated, setLastCreated] = useState(null);
  const { data: institutes = [], isLoading, isError, error } = useGetInstitutesQuery();

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return institutes;
    return institutes.filter((row) =>
      [row.UserCode, row.InstituteName, row.DatabaseName, row.UserName, row.Mobile].some((value) =>
        String(value ?? '').toLowerCase().includes(term),
      ),
    );
  }, [institutes, search]);

  const logout = () => {
    clearSuperAdminToken();
    dispatch(superAdminQuerySlice.util.resetApiState());
    navigate('/super-admin/login', { replace: true });
  };

  const onFormDone = (created) => {
    setShowForm(false);
    if (created) setLastCreated(created);
  };

  const columns = [
    { title: 'ক্রমিক', width: 70, render: (_row, index) => convertBijoyToBengali(index + 1) },
    { title: 'কোড', field: 'UserCode' },
    { title: 'প্রতিষ্ঠানের নাম', field: 'InstituteName' },
    { title: 'ডাটাবেস', render: (row) => <span className="font-mono text-xs">{row.DatabaseName}</span> },
    { title: 'অ্যাডমিন', field: 'UserName' },
    { title: 'মোবাইল', render: (row) => row.Mobile || '—' },
    {
      title: 'অবস্থা',
      render: (row) =>
        row.Action === 'Inactive' ? (
          <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">নিষ্ক্রিয়</span>
        ) : (
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">সক্রিয়</span>
        ),
    },
    { title: 'তৈরির তারিখ', render: (row) => formatDate(row.EntryDate) },
  ];

  return (
    <div className="min-h-dvh bg-dashboard-workspace">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3 px-3 py-3 sm:px-5 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Brand compact className="h-8" />
            <span className="truncate text-sm font-semibold text-foreground">সুপার অ্যাডমিন</span>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-secondary"
          >
            লগআউট
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
        <MasterStatusBanner />

        {lastCreated && (
          <div
            role="status"
            className="mb-4 flex flex-col gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 sm:flex-row sm:items-center sm:justify-between"
          >
            <span>
              “{lastCreated.InstituteName}” তৈরি হয়েছে। লগইন: কোড <strong>{lastCreated.UserCode}</strong>, ইউজারনেম{' '}
              <strong>{lastCreated.UserName}</strong>, ডাটাবেস <span className="font-mono">{lastCreated.DatabaseName}</span>
            </span>
            <button type="button" onClick={() => setLastCreated(null)} className="self-start text-emerald-800 hover:underline sm:self-auto">
              বন্ধ করুন
            </button>
          </div>
        )}

        <section className="overflow-hidden rounded-md border border-border bg-surface">
          <header className="flex flex-col gap-4 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-icon-bg text-clay">
                <SvgIcon name="FaSchool" size={20} />
              </span>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold text-foreground">সব প্রতিষ্ঠান</h1>
                <p className="text-sm text-muted">
                  মোট {convertBijoyToBengali(institutes.length)}টি প্রতিষ্ঠান
                </p>
              </div>
            </div>
            {!showForm && (
              <button
                type="button"
                onClick={() => {
                  setShowForm(true);
                  setLastCreated(null);
                }}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-cta px-4 py-2 text-sm font-medium text-white hover:bg-cta-hover"
              >
                <SvgIcon name="TbPlus" size={18} />
                নতুন প্রতিষ্ঠান
              </button>
            )}
          </header>

          {showForm && <NewInstituteForm onDone={onFormDone} />}

          <div className="space-y-4 p-4 sm:p-6">
            <label className="relative block w-full sm:max-w-sm">
              <span className="sr-only">প্রতিষ্ঠান অনুসন্ধান</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="কোড, নাম বা ডাটাবেস দিয়ে খুঁজুন"
                className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm outline-none focus:border-accent"
              />
            </label>

            {isLoading ? (
              <p className="py-8 text-center text-sm text-muted">তালিকা লোড হচ্ছে…</p>
            ) : isError ? (
              <p className="py-8 text-center text-sm text-red-600">
                {error?.data?.message || 'প্রতিষ্ঠানের তালিকা আনা যায়নি।'}
              </p>
            ) : filtered.length ? (
              <SortableTable columns={columns} data={filtered} isFilterColumn={false} />
            ) : (
              <p className="py-8 text-center text-sm text-muted">
                {institutes.length ? 'কোনো প্রতিষ্ঠান মেলেনি।' : 'এখনো কোনো প্রতিষ্ঠান নেই। “নতুন প্রতিষ্ঠান” চাপুন।'}
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
