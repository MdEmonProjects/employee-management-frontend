import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import Brand from '../../components/Brand';
import {
  SUPER_ADMIN_TOKEN_KEY,
  useSuperAdminLoginMutation,
} from '../../features/superAdmin/superAdminQuerySlice';

const inputClass =
  'mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-clay';

export default function SuperAdminLogin() {
  const navigate = useNavigate();
  const [login, { isLoading }] = useSuperAdminLoginMutation();
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: 'onTouched' });

  const onSubmit = async (data) => {
    setError('');
    try {
      const result = await login(data).unwrap();
      localStorage.setItem(SUPER_ADMIN_TOKEN_KEY, result.token);
      navigate('/super-admin', { replace: true });
    } catch (err) {
      setError(err?.data?.message || 'লগইন করা যায়নি। আবার চেষ্টা করুন।');
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-white p-3 sm:p-6">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-9">
        <Brand className="mb-5 max-w-60" />
        <h1 className="text-2xl font-semibold text-gray-900">সুপার অ্যাডমিন লগইন</h1>
        <p className="mt-1.5 mb-7 text-sm leading-relaxed text-gray-500">
          সব প্রতিষ্ঠান দেখতে ও নতুন প্রতিষ্ঠান খুলতে লগইন করুন।
        </p>

        {error && (
          <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            <span>ইউজারনেম</span>
            <input
              type="text"
              autoComplete="username"
              className={inputClass}
              {...register('username', { required: 'ইউজারনেম দিন' })}
            />
            {errors.username && (
              <span className="mt-1 block text-xs font-normal text-red-600">{errors.username.message}</span>
            )}
          </label>

          <label className="block text-sm font-medium text-gray-700">
            <span>পাসওয়ার্ড</span>
            <input
              type="password"
              autoComplete="current-password"
              className={inputClass}
              {...register('password', { required: 'পাসওয়ার্ড দিন' })}
            />
            {errors.password && (
              <span className="mt-1 block text-xs font-normal text-red-600">{errors.password.message}</span>
            )}
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full rounded-lg bg-clay py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-60"
          >
            {isLoading ? 'লগইন হচ্ছে…' : 'লগইন'}
          </button>
        </form>

        <Link to="/login" className="mt-6 block text-center text-sm text-gray-500 hover:text-gray-900">
          ← প্রতিষ্ঠানের লগইনে ফিরে যান
        </Link>
      </div>
    </div>
  );
}
