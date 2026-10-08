import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import {
  deleteConversation,
  newConversation,
  selectConversation,
} from '../../features/chat/chatSlice';
import {
  closeMobileSidebar as closeUiMobileSidebar,
  resetSidebarWidth as resetUiSidebarWidth,
  setResizingSidebar as setUiResizingSidebar,
  setSidebarWidth as setUiSidebarWidth,
  toggleSidebarCollapsed as toggleUiSidebarCollapsed,
} from '../../features/ui/uiSlice';
import SvgIcon from '../icons/SvgIcon';
import { menuData } from './data';

export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const { conversations, activeConversationId } = useSelector((state) => state.chat);
  const { mobileSidebarOpen, sidebarCollapsed, sidebarWidth, isResizingSidebar } = useSelector(
    (state) => state.ui
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [openSubmenuId, setOpenSubmenuId] = useState(() => {
    const activeParent = menuData.find((item) =>
      Array.isArray(item.subMenu) &&
      item.subMenu.some((subItem) => location.pathname === `/dashboard/${item.route}/${subItem.route}`)
    );
    return activeParent?.id ?? null;
  });
  const asideRef = useRef(null);

  const handleResizeMove = useCallback(
    (event) => {
      const left = asideRef.current?.getBoundingClientRect().left ?? 0;
      dispatch(setUiSidebarWidth(event.clientX - left));
    },
    [dispatch]
  );

  const handleResizeEnd = useCallback(() => {
    dispatch(setUiResizingSidebar(false));
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    window.removeEventListener('mousemove', handleResizeMove);
  }, [dispatch, handleResizeMove]);

  const handleResizeStart = (event) => {
    if (sidebarCollapsed) return;
    event.preventDefault();
    dispatch(setUiResizingSidebar(true));
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', handleResizeMove);
    window.addEventListener('mouseup', handleResizeEnd, { once: true });
  };

  useEffect(() => () => {
    window.removeEventListener('mousemove', handleResizeMove);
    window.removeEventListener('mouseup', handleResizeEnd);
  }, [handleResizeMove, handleResizeEnd]);

  const handleSelectConversation = (id) => {
    dispatch(selectConversation(id));
    dispatch(closeUiMobileSidebar());
    navigate('/dashboard');
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const initial = (user?.name || user?.email || '?').charAt(0).toUpperCase();

  return (
    <aside
      ref={asideRef}
      style={{ '--sidebar-width': `${sidebarCollapsed ? 64 : sidebarWidth}px` }}
      className={`
        app-sidebar fixed inset-y-0 left-0 z-50 flex max-w-full flex-col border-r border-gray-200 bg-gray-50
        md:static md:translate-x-0
        ${isResizingSidebar ? '' : 'transition-[transform,width] duration-200 ease-out'}
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${sidebarCollapsed ? 'md:w-16' : ''}
      `}
    >

      <div className="flex items-center gap-2 p-3">
        <div className={`flex flex-1 items-center gap-2 ${sidebarCollapsed ? 'md:justify-center' : ''}`}>
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-clay text-sm font-bold text-white">D</div>
          <span className={`text-[20px] font-semibold text-gray-900 ${sidebarCollapsed ? 'md:hidden' : ''}`}>সাইডবার</span>
        </div>
        {/* <button
          onClick={() => dispatch(toggleUiSidebarCollapsed())}
          className="hidden h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 md:flex ml-[14px]"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
            <rect x="3" y="4" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
            <path d="M8 4v12" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button> */}
      </div>
      <button
        type="button"
        aria-label={mobileSidebarOpen ? 'সাইডবার বন্ধ করুন' : sidebarCollapsed ? 'সাইডবার প্রসারিত করুন' : 'সাইডবার সংকুচিত করুন'}
        aria-expanded={mobileSidebarOpen || !sidebarCollapsed}
        onClick={() => {
          if (window.matchMedia('(min-width: 768px)').matches) {
            dispatch(toggleUiSidebarCollapsed());
          } else {
            dispatch(closeUiMobileSidebar());
          }
        }}
        className="absolute inset-e-0 top-8 z-[100] inline-flex size-7 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-clay text-white shadow-md ring-2 ring-surface transition-colors hover:bg-brand-700 lg:top-10 rtl:-translate-x-1/2"
      >
        <svg
          stroke="currentColor"
          fill="none"
          strokeWidth={2}
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-300 ${sidebarCollapsed ? 'md:rotate-180' : ''}`}
          aria-hidden="true"
          height={16}
          width={16}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>

      {/* <div className="px-2 pb-1">
        <button
          onClick={() => dispatch(newConversation())}
          className={`flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:border-clay ${sidebarCollapsed ? 'md:justify-center md:px-0' : ''}`}
          title="New chat"
        >
          <span className="text-base font-bold text-clay">+</span>
          <span className={sidebarCollapsed ? 'md:hidden' : ''}>New chat</span>
        </button>
      </div> */}

      <nav className="mt-1 min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2 pb-2">
        {menuData.map((item) => {
          const hasSubmenu = Array.isArray(item.subMenu) && item.subMenu.length > 0;
          const isSubmenuOpen = openSubmenuId === item.id;
          const hasActiveChild = Array.isArray(item.subMenu) && item.subMenu.some(
            (subItem) => location.pathname === `/dashboard/${item.route}/${subItem.route}`
          );
          const rowClassName = `flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-[18px] ${hasActiveChild ? 'bg-white font-medium text-gray-900' : 'text-gray-600 hover:bg-gray-100'} ${sidebarCollapsed ? 'md:justify-center' : ''}`;

          return (
            <div key={item.id}>
              {hasSubmenu ? (
                <button
                  type="button"
                  aria-expanded={isSubmenuOpen}
                  onClick={() => setOpenSubmenuId(isSubmenuOpen ? null : item.id)}
                  className={rowClassName}
                  title={item.name}
                >
                  <SvgIcon name={item.icon} />
                  <span className={`flex-1 ${sidebarCollapsed ? 'md:hidden' : ''}`}>{item.name}</span>
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className={`h-4 w-4 transition-transform ${isSubmenuOpen ? 'rotate-180' : ''} ${sidebarCollapsed ? 'md:hidden' : ''}`}
                    aria-hidden="true"
                  >
                    <path d="m5 7.5 5 5 5-5" />
                  </svg>
                </button>
              ) : (
                <NavLink
                  to={`/dashboard/${item.route}`}
                  end
                  onClick={() => dispatch(closeUiMobileSidebar())}
                  className={({ isActive }) => `flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-[18px] ${isActive ? 'bg-white font-medium text-gray-900' : 'text-gray-600 hover:bg-gray-100'} ${sidebarCollapsed ? 'md:justify-center' : ''}`}
                  title={item.name}
                >
                  <SvgIcon name={item.icon} />
                  <span className={sidebarCollapsed ? 'md:hidden' : ''}>{item.name}</span>
                </NavLink>
              )}
              {hasSubmenu && isSubmenuOpen && (
                <div className={`mt-0.5 space-y-0.5 pl-5 ${sidebarCollapsed ? 'md:hidden' : ''}`}>
                  {item.subMenu.map((subItem) => (
                    <NavLink
                      key={subItem.id}
                      to={`/dashboard/${item.route}/${subItem.route}`}
                      onClick={() => dispatch(closeUiMobileSidebar())}
                      className={({ isActive }) => `flex items-center gap-3 rounded-lg px-2.5 py-2 text-[18px] ${isActive ? 'bg-white font-medium text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <SvgIcon name={subItem.icon} />
                      <span>{subItem.name}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* <div className={`mt-3 px-4 text-xs font-medium text-gray-400 ${sidebarCollapsed ? 'md:hidden' : ''}`}>Recents</div> */}
      <nav className="hidden">
        {/* {conversations.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => handleSelectConversation(conversation.id)}
            className={`group flex cursor-pointer items-center justify-between gap-1 rounded-lg px-2.5 py-2 text-sm ${conversation.id === activeConversationId ? 'bg-white font-medium text-gray-900' : 'text-gray-600 hover:bg-gray-100'} ${sidebarCollapsed ? 'md:justify-center' : ''}`}
          >
            <span className={`truncate ${sidebarCollapsed ? 'md:hidden' : ''}`}>{conversation.title}</span>
            <button
              onClick={(event) => {
                event.stopPropagation();
                dispatch(deleteConversation(conversation.id));
              }}
              className={`flex-shrink-0 rounded px-1 text-base leading-none text-gray-400 opacity-0 group-hover:opacity-100 hover:text-clay-dark ${sidebarCollapsed ? 'md:hidden' : ''}`}
              title="Delete"
            >
              ×
            </button>
          </div>
        ))} */}
      </nav>

      <div className="relative m-2 mt-0">
        <div
          onClick={() => setMenuOpen((value) => !value)}
          className={`flex cursor-pointer items-center gap-2.5 rounded-lg p-2 hover:bg-gray-100 ${sidebarCollapsed ? 'md:justify-center' : ''}`}
        >
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-clay text-xs font-semibold text-white">{initial}</div>
          <div className={`min-w-0 flex-1 ${sidebarCollapsed ? 'md:hidden' : ''}`}>
            <p className="truncate text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="truncate text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
        {menuOpen && (
          <div className="absolute bottom-full left-0 mb-1 w-full min-w-[160px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
            <button onClick={handleLogout} className="w-full px-3.5 py-2.5 text-left text-sm text-gray-800 hover:bg-gray-50">Log out</button>
          </div>
        )}
      </div>

      {!sidebarCollapsed && (
        <div
          onMouseDown={handleResizeStart}
          onDoubleClick={() => dispatch(resetUiSidebarWidth())}
          title="Drag to resize · double-click to reset"
          className="group absolute inset-y-0 -right-0.5 z-40 hidden w-1.5 cursor-col-resize md:block"
        >
          <div className="h-full w-px bg-transparent group-hover:bg-clay/50 group-active:bg-clay" />
        </div>
      )}
    </aside>
  );
}
