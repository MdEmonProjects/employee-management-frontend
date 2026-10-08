
import { closeModal } from '../features/modal/modalSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import AddDepartment from '../views/AddDepartment';
import AddClass from '../views/AddClass';
import AddShift from '../views/AddShift';
import UpdateShift from '../views/UpdateShift';
import AddTimeCheck from '../views/AddTimeCheck';
import UpdateTimeCheck from '../views/UpdateTimeCheck';
import SessionForm from '../views/SessionForm';
import UpdateClass from '../views/UpdateClass';

const DefaultModal = () => {
  const { isOpen, title, modalType, id, meta } = useSelector((state) => state.modal);
  const dispatch = useDispatch();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && meta?.closeOnEscape !== false) {
        dispatch(closeModal());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dispatch, isOpen, meta?.closeOnEscape]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && meta?.closeOnOutSide !== false) {
              dispatch(closeModal());
            }
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title || 'Dialog'}
            className="flex max-h-[92dvh] w-full min-w-0 max-w-[520px] flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[90dvh] sm:rounded-2xl"
            initial={{ opacity: 0, y: 36, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 360, damping: 32 }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="header flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 py-3 pl-4 pr-2">
              {title && (<h2 className="text-[18px] font-bold">{title}</h2>)}
              <button
                type="button"
                aria-label="Close dialog"
                onClick={() => dispatch(closeModal())}
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-xl transition-colors hover:bg-slate-100"
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

            <div ref={scrollRef} className="min-h-0 overflow-x-hidden overflow-y-auto overscroll-contain">
              {modalType && (
                <div className="body min-w-0 p-3 sm:p-4">
                  {modalType === 'ADD_DEPARTMENTS' && <AddDepartment userId={id} />}
                  {modalType === 'CLASS_ENTRY' && <AddClass />}
                  {modalType === 'CLASS_EDIT' && <UpdateClass id={id} />}
                  {modalType === 'SESSION_ENTRY' && <SessionForm />}
                  {modalType === 'SESSION_EDIT' && <SessionForm id={id} />}
                  {modalType === 'SHIFT_ENTRY' && <AddShift />}
                  {modalType === 'SHIFT_EDIT' && <UpdateShift id={id} />}
                  {modalType === 'TIME_CHECK_ENTRY' && <AddTimeCheck />}
                  {modalType === 'TIME_CHECK_EDIT' && <UpdateTimeCheck id={id} />}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


export default DefaultModal;
