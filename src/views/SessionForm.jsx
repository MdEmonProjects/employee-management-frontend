import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { closeModal } from '../features/modal/modalSlice';
import {
  useAddSessionMutation,
  useGetSessionQuery,
  useUpdateSessionMutation,
} from '../features/session/sessionQuerySlice';

export default function SessionForm({ id }) {
  const dispatch = useDispatch();
  const editing = Boolean(id);
  const { data: session, isLoading: isLoadingSession, isError } =
    useGetSessionQuery(id, { skip: !editing });
  const [addSession, addState] = useAddSessionMutation();
  const [updateSession, updateState] = useUpdateSessionMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { SessionName: '', SessionEngName: '', SessionAraName: '' },
  });

  useEffect(() => {
    if (!session) return;
    reset({
      SessionName: session.SessionName || '',
      SessionEngName: session.SessionEngName || '',
      SessionAraName: session.SessionAraName || '',
    });
  }, [reset, session]);

  const onSubmit = async (values) => {
    const data = {
      SessionName: values.SessionName.trim(),
      SessionEngName: values.SessionEngName.trim() || null,
      SessionAraName: values.SessionAraName.trim() || null,
    };

    try {
      if (editing) await updateSession({ id, data }).unwrap();
      else await addSession(data).unwrap();
      toast.success(editing ? 'শিক্ষাবর্ষ আপডেট হয়েছে।' : 'নতুন শিক্ষাবর্ষ তৈরি হয়েছে।');
      dispatch(closeModal());
    } catch (error) {
      toast.error(error?.data?.message || error?.data?.error || 'শিক্ষাবর্ষ সংরক্ষণ করা যায়নি।');
    }
  };

  const isSaving = addState.isLoading || updateState.isLoading;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {isLoadingSession && <p className="text-sm text-muted">তথ্য লোড হচ্ছে...</p>}
      {isError && <p className="text-sm text-red-600">শিক্ষাবর্ষের তথ্য আনা যায়নি।</p>}
      <label className="block text-sm font-medium text-gray-700">
        শিক্ষাবর্ষের নাম
        <input
          {...register('SessionName', { required: 'শিক্ষাবর্ষের নাম আবশ্যক' })}
          className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-clay"
          placeholder="যেমন: ২০২৬ শিক্ষাবর্ষ"
          autoFocus
        />
        {errors.SessionName && <p className="mt-1 text-sm text-red-600">{errors.SessionName.message}</p>}
      </label>
      <label className="block text-sm font-medium text-gray-700">
        ইংরেজি নাম
        <input {...register('SessionEngName')} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-clay" placeholder="e.g. Academic Year 2026" />
      </label>
      <label className="block text-sm font-medium text-gray-700">
        আরবি নাম
        <input {...register('SessionAraName')} dir="rtl" className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-right outline-none focus:border-clay" />
      </label>
      <button
        type="submit"
        disabled={isSaving || isLoadingSession || isError}
        className="w-full rounded-lg bg-clay px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {isSaving ? 'সংরক্ষণ হচ্ছে...' : editing ? 'শিক্ষাবর্ষ আপডেট করুন' : 'শিক্ষাবর্ষ তৈরি করুন'}
      </button>
    </form>
  );
}
