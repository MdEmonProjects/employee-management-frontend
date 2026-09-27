
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { closeModal } from '../features/modal/modalSlice';
import { useCreateDepartmentMutation } from '../features/department/departmentQuerySlice';

export default function AddClass() {
  const dispatch = useDispatch();

  const [createDepartment, { isLoading, error }] =
    useCreateDepartmentMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      ClassName: '',
      EnglishClass: '',
      ArabicClass: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      await createDepartment({
        ClassName: data.ClassName.trim(),
        EnglishClass: data.EnglishClass.trim() || null,
        ArabicClass: data.ArabicClass.trim() || null,
      }).unwrap();

      dispatch(closeModal());
    } catch {
      // API error is rendered below.
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* বাংলা নাম */}
      <label className="block text-sm font-medium text-gray-700">
        শ্রেণির নাম
        <input
          {...register('ClassName', {
            required: 'শ্রেণির নাম আবশ্যক',
          })}
          className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-clay"
          placeholder="যেমন: প্রথম শ্রেণি"
          autoFocus
        />
        {errors.ClassName && (
          <p className="mt-1 text-sm text-red-600">
            {errors.ClassName.message}
          </p>
        )}
      </label>

      {/* English name */}
      <label className="block text-sm font-medium text-gray-700">
        ইংরেজি নাম
        <input
          {...register('EnglishClass')}
          className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-clay"
          placeholder="e.g. Class One"
        />
      </label>

      {/* Arabic name */}
      <label className="block text-sm font-medium text-gray-700">
        আরবি নাম
        <input
          {...register('ArabicClass')}
          dir="rtl"
          className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-right outline-none focus:border-clay"
          placeholder="مثلاً: الصف الأول"
        />
      </label>

      {error && (
        <p className="text-sm text-red-600">
          শ্রেণি তৈরি করা যায়নি।
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-clay px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {isLoading ? 'তৈরি হচ্ছে…' : 'শ্রেণি তৈরি করুন'}
      </button>
    </form>
  );
}

