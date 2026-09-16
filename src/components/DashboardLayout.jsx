import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useLocation } from 'react-router-dom';
import { closeMobileSidebar, openMobileSidebar } from '../features/ui/uiSlice';
import Sidebar from './Sidebar/Sidebar';
import DefaultModal from './DefaultModal';

export default function DashboardLayout() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { mobileSidebarOpen } = useSelector((state) => state.ui);
  const pageTitle = location.pathname.split('/').pop();

  return (
    <div className="flex h-screen overflow-hidden bg-[#fcfcfb]">
      {mobileSidebarOpen && ( <div className="fixed inset-0 z-20 bg-black/30 md:hidden" onClick={() => dispatch(closeMobileSidebar())}/>)}
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col bg-[#fcfcfb]">
        <div className="flex items-center gap-3 border-b border-gray-200 p-3 md:hidden">
          <button
            onClick={() => dispatch(openMobileSidebar())}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
            title="Open sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path d="M2 3h12M2 8h12M2 13h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
          <span className="truncate text-sm font-medium capitalize text-gray-800">{pageTitle}</span>
        </div>
        <div className="p-3">
          <Outlet />
        </div>
      </main>
      <DefaultModal />
    </div>
  );
}
