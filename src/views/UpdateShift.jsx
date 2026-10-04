
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { closeModal } from '../features/modal/modalSlice';
import { toast } from 'react-toastify';
import {
  useGetSingleShiftQuery,
  useUpdateShiftMutation,
} from '../features/shift/shiftQuerySlice';

export default function UpdateShift({ id }) {
  const dispatch = useDispatch();
  const { data: response, isLoading: isLoadingShift, isError } =
    useGetSingleShiftQuery(id, { skip: !id });
  const [updateShift, { isLoading }] = useUpdateShiftMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      ShiftNameBangla: '',
      ShiftNameEnglish: '',
    },
  });

  useEffect(() => {
    if (response?.data) {
      reset({
        ShiftNameBangla: response.data.ShiftNameBangla || '',
        ShiftNameEnglish: response.data.ShiftNameEnglish || '',
      });
    }
  }, [response, reset]);

  const onSubmit = async (data) => {
    try {
      await updateShift({
        id,
        ShiftNameBangla: data.ShiftNameBangla || null,
        ShiftNameEnglish: data.ShiftNameEnglish || null,
      }).unwrap();
      toast.success('শিফটের তথ্য হালনাগাদ হয়েছে।');

      dispatch(closeModal());
    } catch (error) {
      toast.error(
        error?.data?.message || 'শিফটের তথ্য হালনাগাদ করা যায়নি।'
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {isLoadingShift && <p className="text-sm text-gray-600">শিফটের তথ্য আনা হচ্ছে…</p>}
      {isError && <p className="text-sm text-red-600">শিফটের তথ্য আনা যায়নি।</p>}
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

      <label className="block text-sm font-medium text-gray-700">
        শিফটের ইংরেজি নাম (ঐচ্ছিক)
        <input
          {...register('ShiftNameEnglish')}
          className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-clay"
          placeholder="e.g. Morning Shift"
        />
      </label>

      <button
        type="submit"
        disabled={isLoading || isLoadingShift || isError || !id}
        className="w-full rounded-lg bg-clay px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {isLoading ? 'হালনাগাদ হচ্ছে…' : 'শিফট হালনাগাদ করুন'}
      </button>
    </form>
  );
}

