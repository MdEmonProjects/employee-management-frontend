
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { closeModal } from '../features/modal/modalSlice';
import { useCreateTimeCheckMutation } from '../features/shift/shiftQuerySlice';

export default function AddTimeCheck() {
  const dispatch = useDispatch();
  const [createTimeCheck, { isLoading }] = useCreateTimeCheckMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      TypeNameEnglish: '',
      TypeNameBangla: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      await createTimeCheck({
        TypeNameBangla: data.TypeNameBangla.trim(),
        TypeNameEnglish: data.TypeNameEnglish.trim() || null,
      }).unwrap();
      toast.success('সময় যাচাইয়ের ধরন তৈরি হয়েছে।');
      dispatch(closeModal());
    } catch (error) {
      toast.error(error?.data?.message || 'সময় যাচাইয়ের ধরন তৈরি করা যায়নি।');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        সময় যাচাইয়ের ধরনের বাংলা নাম
        <input
          {...register('TypeNameBangla', { required: 'বাংলা নাম আবশ্যক' })}
          className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-clay"
          placeholder="যেমন: উপস্থিতি"
          autoFocus
        />
        {errors.TypeNameBangla && (
          <span className="mt-1 block text-sm text-red-600">
            {errors.TypeNameBangla.message}
          </span>
        )}
      </label>
      <label className="block text-sm font-medium text-gray-700">
        ইংরেজি নাম (ঐচ্ছিক)
        <input
          {...register('TypeNameEnglish')}
          className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-clay"
          placeholder="e.g. Attendance"
        />
      </label>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-clay px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {isLoading ? 'তৈরি হচ্ছে…' : 'ধরন তৈরি করুন'}
      </button>
    </form>
  );
}

