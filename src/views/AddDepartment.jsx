import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { closeModal } from '../features/modal/modalSlice';
import { useCreateDepartmentMutation } from '../features/department/departmentQuerySlice';

export default function AddDepartment() {
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [createDepartment, { isLoading, error }] = useCreateDepartmentMutation();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;

    try {
      await createDepartment({ name: name.trim() }).unwrap();
      dispatch(closeModal());
    } catch {
      // The API error is rendered below.
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Department name
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-clay"
          placeholder="e.g. Human Resources"
          autoFocus
        />
      </label>
      {error && <p className="text-sm text-red-600">Unable to create department.</p>}
      <button
        type="submit"
        disabled={isLoading || !name.trim()}
        className="w-full rounded-lg bg-clay px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {isLoading ? 'Creating…' : 'Create department'}
      </button>
    </form>
  );
}