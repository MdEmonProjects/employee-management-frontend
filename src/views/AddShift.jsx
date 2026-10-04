
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { closeModal } from '../features/modal/modalSlice';
import { toast } from 'react-toastify';
import { useCreateShiftMutation } from '../features/shift/shiftQuerySlice';
export default function AddShift() {
  const dispatch = useDispatch();

  const [createShift, { isLoading, error }] =
    useCreateShiftMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      ShiftNameBangla: '',
      ShiftNameEnglish: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      await createShift({
        ShiftNameBangla: data.ShiftNameBangla.trim(),
        ShiftNameEnglish: data.ShiftNameEnglish.trim() || null,
      }).unwrap();
      toast.success('শিফট তৈরি হয়েছে।');

      dispatch(closeModal());
    } catch (error) {
      toast.error(
        error?.data?.message || 'শিফট তৈরি করা যায়নি।'
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* বাংলা নাম */}
      <label className="block text-sm font-medium text-gray-700">
        শিফটের বাংলা নাম
        <input
          {...register('ShiftNameBangla', {
            required: 'শিফটের বাংলা নাম আবশ্যক',
          })}
          className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-clay"
          placeholder="যেমন: সকাল শিফট"
          autoFocus
        />
        {errors.ShiftNameBangla && (
          <p className="mt-1 text-sm text-red-600">
            {errors.ShiftNameBangla.message}
          </p>
        )}
      </label>

      {/* English name */}
      <label className="block text-sm font-medium text-gray-700">
        শিফটের ইংরেজি নাম (ঐচ্ছিক)
        <input
          {...register('ShiftNameEnglish')}
          className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-clay"
          placeholder="e.g. Morning Shift"
        />
      </label>

      {error && (
        <p className="text-sm text-red-600">
          শিফট তৈরি করা যায়নি।
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-clay px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {isLoading ? 'তৈরি হচ্ছে…' : 'শিফট তৈরি করুন'}
      </button>
    </form>
  );
}

