
import { closeModal } from '../features/modal/modalSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useRef } from 'react';
import AddDepartment from '../views/AddDepartment';
import ClickOutside from './ClickOutside';

const DefaultModal = () => {
  const { isOpen, title, modalType, id, meta } = useSelector((state) => state.modal);
  const dispatch = useDispatch();
  const scrollRef = useRef(null);
  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 bg-[#0006] bg-opacity-50 flex justify-center items-center z-50 px-4">
      <ClickOutside
        className="max-w-full md:max-w-[520px] w-full overflow-hidden"
          onClick={() => {
            if (meta?.closeOnOutSide !== false) {
              dispatch(closeModal());
            }
          }}
      >
        {/* Tailwind animation */}
        <div
          className={`w-full transform transition-all duration-300 ease-out
            ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
        >
          <div className="bg-white rounded-lg shadow-lg relative w-full max-h-[90vh] overflow-y-auto" ref={scrollRef}>
            <div className="header pl-3 pr-2 pt-3 pb-2 border-0 border-slate-100 flex items-center justify-between">
              {title && (
                <h2 className="text-[18px] font-bold">{title}</h2>
              )}
              <button
                onClick={() => dispatch(closeModal())}
                className="text-xl"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M18 6l-12 12" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </div>

            {modalType && (
              <div className="body p-3">
                {modalType === 'ADD_DEPARTMENTS' && <AddDepartment userId={id} />}
              </div>
            )}
          </div>
        </div>
      </ClickOutside>
    </div>
  );
};


export default DefaultModal;
