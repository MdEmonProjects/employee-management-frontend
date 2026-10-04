
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { closeModal } from '../features/modal/modalSlice';
import { toast } from 'react-toastify';
import {
  useGetSingleTimeCheckQuery,
  useUpdateTimeCheckMutation,
} from '../features/shift/shiftQuerySlice';

export default function UpdateTimeCheck({ id }) {
  const dispatch = useDispatch();
  const { data: response, isLoading: isLoadingRecord, isError } =
    useGetSingleTimeCheckQuery(id, { skip: !id });
  const [updateTimeCheck, { isLoading }] = useUpdateTimeCheckMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      TypeNameBangla: '',
      TypeNameEnglish: '',
    },
  });

  useEffect(() => {
    if (response?.data) {
      reset({
        TypeNameBangla: response.data.TypeNameBangla || '',
        TypeNameEnglish: response.data.TypeNameEnglish || '',
      });
    }
  }, [response, reset]);

  const onSubmit = async (data) => {
    try {
      await updateTimeCheck({
        id,
        TypeNameBangla: data.TypeNameBangla.trim(),
        TypeNameEnglish: data.TypeNameEnglish.trim() || null,
      }).unwrap();
      toast.success('সময় যাচাইয়ের ধরন হালনাগাদ হয়েছে।');
      dispatch(closeModal());
    } catch (error) {
      toast.error(error?.data?.message || 'তথ্য হালনাগাদ করা যায়নি।');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {isLoadingRecord && <p className="text-sm text-gray-600">তথ্য আনা হচ্ছে…</p>}
      {isError && <p className="text-sm text-red-600">তথ্য আনা যায়নি।</p>}
      <label className="block text-sm font-medium text-gray-700">
        সময় যাচাইয়ের ধরনের বাংলা নাম
        <input
          {...register('TypeNameBangla', { required: 'বাংলা নাম আবশ্যক' })}
          className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-clay"
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
        disabled={isLoading || isLoadingRecord || isError || !id}
        className="w-full rounded-lg bg-clay px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {isLoading ? 'হালনাগাদ হচ্ছে…' : 'তথ্য হালনাগাদ করুন'}
      </button>
    </form>
  );
}

