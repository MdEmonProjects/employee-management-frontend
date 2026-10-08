import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { closeModal } from '../features/modal/modalSlice';
import {
  useGetSingleClassQuery,
  useUpdateClassMutation,
} from '../features/class/classQuerySlice';

export default function UpdateClass({ id }) {
  const dispatch = useDispatch();
  const { data: response, isLoading: isLoadingClass, isError } =
    useGetSingleClassQuery(id, { skip: !id });
  const [updateClass, { isLoading }] = useUpdateClassMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (!response?.data) return;
    reset({
      ClassName: response.data.ClassName || '',
      EnglishClass: response.data.EnglishClass || '',
      ArabicClass: response.data.ArabicClass || '',
    });
  }, [reset, response]);

  const onSubmit = async (values) => {
    try {
      await updateClass({
        id,
        data: {
          ClassName: values.ClassName.trim(),
          EnglishClass: values.EnglishClass.trim() || null,
          ArabicClass: values.ArabicClass.trim() || null,
        },
      }).unwrap();
      toast.success('ক্লাস গ্রুপের তথ্য আপডেট হয়েছে।');
      dispatch(closeModal());
    } catch (error) {
      toast.error(error?.data?.message || error?.data?.error || 'ক্লাস গ্রুপ আপডেট করা যায়নি।');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {isLoadingClass && <p className="text-sm text-muted">তথ্য লোড হচ্ছে...</p>}
      {isError && <p className="text-sm text-red-600">ক্লাস গ্রুপের তথ্য আনা যায়নি।</p>}
      <label className="block text-sm font-medium text-gray-700">
        ক্লাস গ্রুপের নাম
        <input
          {...register('ClassName', { required: 'ক্লাস গ্রুপের নাম আবশ্যক' })}
          className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-clay"
          autoFocus
        />
        {errors.ClassName && <p className="mt-1 text-sm text-red-600">{errors.ClassName.message}</p>}
      </label>
      <label className="block text-sm font-medium text-gray-700">
        ইংরেজি নাম
        <input {...register('EnglishClass')} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-clay" />
      </label>
      <label className="block text-sm font-medium text-gray-700">
        আরবি নাম
        <input {...register('ArabicClass')} dir="rtl" className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-right outline-none focus:border-clay" />
      </label>
      <button
        type="submit"
        disabled={isLoading || isLoadingClass || isError || !id}
        className="w-full rounded-lg bg-clay px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {isLoading ? 'আপডেট হচ্ছে...' : 'আপডেট করুন'}
      </button>
    </form>
  );
}
