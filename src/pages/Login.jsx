import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { loginSuccess } from '../features/auth/authSlice';
import { useLoginMutation } from '../features/auth/authQuerySlice';

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: 'onTouched' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const authError = useSelector((state) => state.auth.error);
  const [login, { isLoading }] = useLoginMutation();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const from = location.state?.from?.pathname || '/dashboard';

  const onSubmit = async (data) => {
    try {
      const result = await login(data).unwrap();
      localStorage.setItem('token', result.token);
      dispatch(
        loginSuccess({
          ...result.user,
          name: result.user.username,
        }),
      );
      navigate(from, { replace: true });
    } catch (error) {
      dispatch({
        type: 'auth/loginFailure',
        payload: error?.data?.message || error.message,
      });
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-white p-3 sm:p-6">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-9">
        <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-clay text-white text-lg">
          ✦
        </div>
        <h1 className="font-serif text-2xl font-semibold text-gray-900">Sign in</h1>
        <p className="mt-1.5 mb-7 text-sm leading-relaxed text-gray-500">
          Sign in with your administrator account.
        </p>

        {authError && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {authError}
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            <span>Madrasha Code</span>
            <input
              type="text"
              autoComplete="school_id"
              placeholder="1234"
              className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-clay"
              {...register('school_id', {
                required: 'Email is required',
              })}
            />
            {errors.school_id && (
              <span className="mt-1 block text-xs font-normal text-clay-dark">
                {errors.school_id.message}
              </span>
            )}
          </label>
          <label className="block text-sm font-medium text-gray-700">
            <span>Username</span>
            <input
              type="text"
              autoComplete="username"
              placeholder="username"
              className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-clay"
              {...register('username', {
                required: 'Username is required',
              })}
            />
            {errors.username && (
              <span className="mt-1 block text-xs font-normal text-clay-dark">
                {errors.username.message}
              </span>
            )}
          </label>

          <label className="block text-sm font-medium text-gray-700">
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-clay"
              {...register('password', {
                required: 'Password is required',
              })}
            />
            {errors.password && (
              <span className="mt-1 block text-xs font-normal text-clay-dark">
                {errors.password.message}
              </span>
            )}
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full rounded-lg bg-clay py-2.5 text-sm font-semibold text-white transition-colors hover:bg-clay-dark disabled:opacity-60"
          >
            {isLoading ? 'Signing in…' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
