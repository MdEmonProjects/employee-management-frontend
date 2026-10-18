import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  useAddInstitutionMutation,
  useGetInstitutionsQuery,
  useUpdateInstitutionMutation,
  useUploadInstitutionLogoMutation,
} from '../features/institution/institutionQuerySlice';

const API_URL = (import.meta.env.VITE_SERVER_URL || 'http://localhost:3000').replace(
  /\/$/,
  '',
);

const sections = [
  {
    title: 'প্রতিষ্ঠানের সাধারণ তথ্য',
    fields: [
      ['InstitutionName', 'প্রতিষ্ঠানের নাম', 'text', true],
      ['Address', 'ঠিকানা', 'textarea'],
      ['ContactNumber', 'যোগাযোগ নম্বর'],
      ['InstitutionCode', 'প্রতিষ্ঠান কোড', 'number'],
      ['Email', 'ইমেইল', 'email'],
      ['SMSMobile', 'এসএমএস মোবাইল', 'tel'],
      ['Elhaq', 'ইলহাক'],
    ],
  },
  {
    title: 'ইংরেজি তথ্য',
    fields: [
      ['EngInstitutionName', 'Institution name'],
      ['EngAddress', 'Address', 'textarea'],
    ],
  },
  {
    title: 'আরবি তথ্য',
    fields: [
      ['AraInstitutionName', 'প্রতিষ্ঠানের আরবি নাম'],
      ['AraAddress', 'আরবি ঠিকানা', 'textarea'],
      ['AraContactNumber', 'আরবি যোগাযোগ নম্বর'],
    ],
  },
  {
    title: 'ঠিকানার বিস্তারিত',
    fields: [
      ['Village', 'গ্রাম/এলাকা'],
      ['PostOffice', 'ডাকঘর'],
      ['PoliceStation', 'থানা'],
      ['District', 'জেলা'],
      ['AraVillage', 'গ্রাম/এলাকা (আরবি)'],
      ['AraPostOffice', 'ডাকঘর (আরবি)'],
      ['AraPoliceStation', 'থানা (আরবি)'],
      ['AraDistrict', 'জেলা (আরবি)'],
    ],
  },
  {
    title: 'দায়িত্বপ্রাপ্ত ব্যক্তি',
    fields: [
      ['PrincipalName', 'প্রধানের নাম'],
      ['NajemName', 'নাজেমের নাম'],
      ['AccountantName', 'হিসাবরক্ষকের নাম'],
    ],
  },
  {
    title: 'ওয়েব ও সামাজিক যোগাযোগ',
    fields: [
      ['Website', 'ওয়েবসাইট', 'url'],
      ['Facebook', 'ফেসবুক', 'url'],
      ['Youtube', 'ইউটিউব', 'url'],
      ['WhatsApp', 'হোয়াটসঅ্যাপ'],
      ['Telegram', 'টেলিগ্রাম'],
    ],
  },
  {
    title: 'রিপোর্ট সেটিংস',
    fields: [
      ['ActiveReportHeader', 'সক্রিয় রিপোর্ট হেডার'],
      ['ActiveReportTemplate', 'সক্রিয় রিপোর্ট টেমপ্লেট'],
      ['ReportHeaderImg', 'রিপোর্ট হেডার ইমেজ'],
    ],
  },
];

const fieldNames = sections.flatMap(({ fields }) => fields.map(([name]) => name));
const emptyForm = Object.fromEntries(fieldNames.map((name) => [name, '']));

function errorMessage(error) {
  return (
    error?.data?.message ||
    error?.data?.error ||
    error?.error ||
    'তথ্য সংরক্ষণ করা যায়নি'
  );
}

function logoUrl(value) {
  if (!value) return '';
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  const path = value.includes('/') ? value : `/public/${value}`;
  return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

export default function InstituteInfo() {
  const { data: institutions, isLoading, isError, error } = useGetInstitutionsQuery();
  const institution = institutions?.[0];

  if (isLoading) {
    return <div className="p-6 text-center text-muted">তথ্য লোড হচ্ছে…</div>;
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-xl p-6 text-center">
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {errorMessage(error)}
        </p>
        <Link className="mt-4 inline-block text-brand-700 underline" to="/dashboard/settings">
          সেটিংসে ফিরে যান
        </Link>
      </div>
    );
  }

  return <InstituteInfoForm key={institution?.ID ?? 'new'} institution={institution} />;
}

function InstituteInfoForm({ institution }) {
  const [form, setForm] = useState(() =>
    institution
      ? Object.fromEntries(
          fieldNames.map((name) => [name, institution[name] ?? '']),
        )
      : emptyForm,
  );
  const [admissionType, setAdmissionType] = useState(() =>
    institution?.AdmissionType == null ? '' : String(institution.AdmissionType),
  );
  const [logoFile, setLogoFile] = useState(null);
  const [addInstitution, { isLoading: isCreating }] = useAddInstitutionMutation();
  const [updateInstitution, { isLoading: isUpdating }] = useUpdateInstitutionMutation();
  const [uploadLogo, { isLoading: isUploading }] = useUploadInstitutionLogoMutation();

  const localLogoUrl = useMemo(
    () => (logoFile ? URL.createObjectURL(logoFile) : ''),
    [logoFile],
  );

  useEffect(
    () => () => {
      if (localLogoUrl) URL.revokeObjectURL(localLogoUrl);
    },
    [localLogoUrl],
  );

  const onFieldChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const onLogoChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (file && file.size > 2 * 1024 * 1024) {
      toast.error('লোগোর আকার সর্বোচ্চ ২ এমবি হতে পারবে');
      event.target.value = '';
      return;
    }
    setLogoFile(file);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [
        key,
        typeof value === 'string' ? value.trim() || null : value,
      ]),
    );
    payload.InstitutionCode = form.InstitutionCode
      ? Number(form.InstitutionCode)
      : null;
    payload.AdmissionType = admissionType === '' ? null : admissionType === 'true';

    try {
      const saved = institution
        ? await updateInstitution({ id: institution.ID, data: payload }).unwrap()
        : await addInstitution(payload).unwrap();

      if (logoFile) {
        await uploadLogo({ id: saved.ID, file: logoFile }).unwrap();
        setLogoFile(null);
      }
      toast.success('প্রতিষ্ঠানের তথ্য সংরক্ষণ হয়েছে');
    } catch (saveError) {
      toast.error(errorMessage(saveError));
    }
  };

  const saving = isCreating || isUpdating || isUploading;
  const preview = localLogoUrl || logoUrl(institution?.Logo);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">প্রতিষ্ঠানের তথ্য</h1>
          <p className="mt-1 text-sm text-muted">প্রতিষ্ঠানের পরিচিতি ও লোগো পরিবর্তন করুন</p>
        </div>
        <Link
          to="/dashboard/settings"
          className="rounded-lg border border-border bg-white px-4 py-2 text-sm text-foreground hover:bg-surface-secondary"
        >
          সেটিংসে ফিরে যান
        </Link>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <section className="rounded-xl border border-border bg-white p-4 shadow-sm sm:p-6">
          <h2 className="mb-4 text-lg font-semibold">প্রতিষ্ঠানের লোগো</h2>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50">
              {preview ? (
                <img src={preview} alt="প্রতিষ্ঠানের লোগো" className="h-full w-full object-contain p-2" />
              ) : (
                <span className="px-2 text-center text-xs text-muted">কোনো লোগো নেই</span>
              )}
            </div>
            <div>
              <input
                id="institution-logo"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={onLogoChange}
                className="block max-w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-600 file:px-4 file:py-2 file:text-white hover:file:bg-brand-700"
              />
              <p className="mt-2 text-xs text-muted">PNG, JPEG অথবা WebP; সর্বোচ্চ ২ এমবি</p>
            </div>
          </div>
        </section>

        {sections.map(({ title, fields }) => (
          <section key={title} className="rounded-xl border border-border bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-4 text-lg font-semibold">{title}</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {fields.map(([name, label, type = 'text', required = false]) => (
                <label key={name} className={type === 'textarea' ? 'md:col-span-2' : ''}>
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">
                    {label}{required && <span className="text-red-500"> *</span>}
                  </span>
                  {type === 'textarea' ? (
                    <textarea
                      name={name}
                      value={form[name]}
                      onChange={onFieldChange}
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    />
                  ) : (
                    <input
                      name={name}
                      type={type}
                      value={form[name]}
                      onChange={onFieldChange}
                      required={required}
                      className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    />
                  )}
                </label>
              ))}
            </div>
          </section>
        ))}

        <section className="rounded-xl border border-border bg-white p-4 shadow-sm sm:p-6">
          <label className="block max-w-md">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">ভর্তির ধরন সক্রিয়</span>
            <select
              value={admissionType}
              onChange={(event) => setAdmissionType(event.target.value)}
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            >
              <option value="">নির্ধারিত নয়</option>
              <option value="true">হ্যাঁ</option>
              <option value="false">না</option>
            </select>
          </label>
        </section>

        <div className="sticky bottom-0 flex justify-end border-t border-border bg-background/95 py-4 backdrop-blur">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-brand-600 px-6 py-2.5 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'সংরক্ষণ হচ্ছে…' : institution ? 'পরিবর্তন সংরক্ষণ করুন' : 'তথ্য তৈরি করুন'}
          </button>
        </div>
      </form>
    </div>
  );
}
