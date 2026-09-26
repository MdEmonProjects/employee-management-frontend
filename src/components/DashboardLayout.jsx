import { useDispatch, useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import { closeMobileSidebar, openMobileSidebar } from '../features/ui/uiSlice';
import Sidebar from './Sidebar/Sidebar';
import DefaultModal from './DefaultModal';

export default function DashboardLayout() {
  const dispatch = useDispatch();
  const { mobileSidebarOpen } = useSelector((state) => state.ui);
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {mobileSidebarOpen && (<div className="fixed inset-0 z-20 bg-black/30 md:hidden" onClick={() => dispatch(closeMobileSidebar())} />)}
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-background">
        <div className="flex min-h-0 flex-1 flex-col min-w-0 overflow-y-auto">
          <div className="sticky top-0 z-30 shrink-0">
            <header className="flex min-h-16 w-full shrink-0 items-center justify-between gap-2 border-b border-border/50 bg-surface px-3 py-2 sm:gap-3 sm:px-4 lg:h-20 lg:gap-4 lg:px-6 lg:py-0">
              <div className="flex min-w-0 flex-1 items-center gap-3 lg:gap-4">
                {/* <button
                  type="button"
                  aria-label="Open menu"
                  onClick={() => dispatch(openMobileSidebar())}
                  className="shrink-0 text-muted hover:text-foreground transition-colors lg:hidden"
                >
                  <svg
                    stroke="currentColor"
                    fill="none"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    height={22}
                    width={22}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button> */}
                <div className="min-w-0 flex-1 lg:hidden" aria-label="মাদরাসার তথ্য">
                  <p className="text-xs font-semibold leading-tight text-brand-600 whitespace-normal wrap-break-word font-bengali">
                    ইক্বরা বালিকা মাদরাসা (অনাবাসিক), ৩৩, প্রধান সড়ক, কল্যাণপুর, মিরপুর,
                    ঢাকা-১২০৭, মিরপুর, ঢাকা (মহানগর)
                  </p>
                  <p className="truncate text-[11px] leading-tight text-muted">
                    কোড B00015153
                  </p>
                  <p className="text-[11px] leading-snug whitespace-normal wrap-break-word font-bengali">
                    <span className="font-normal text-muted">মারকায </span>
                    <span className="font-semibold text-foreground">
                      দরসিয়াত — উম্মুল মুমেনীন হযরত আয়েশা সিদ্দিকা (রাঃ) বালিকা মাদরাসা
                    </span>
                  </p>
                </div>
                <div
                  className="hidden lg:flex flex-1 grow min-w-0 flex-col justify-center items-center gap-1.5"
                  aria-label="মাদরাসার তথ্য"
                >
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 leading-snug">
                    <p className="text-xl font-semibold leading-snug text-brand-600 whitespace-normal wrap-break-word font-bengali">
                      ইক্বরা বালিকা মাদরাসা (অনাবাসিক), ৩৩, প্রধান সড়ক, কল্যাণপুর, মিরপুর,
                      ঢাকা-১২০৭, মিরপুর, ঢাকা (মহানগর)
                    </p>
                    <span className="inline-flex items-center gap-1.5 whitespace-normal">
                      <span className="shrink-0 text-sm text-muted">ইলহাক</span>
                      <span className="text-sm font-semibold wrap-break-word text-brand-600">
                        ম-3/5116
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 whitespace-normal">
                      <span className="shrink-0 text-sm text-muted">কোড</span>
                      <span className="text-sm font-semibold wrap-break-word text-brand-600">
                        B00015153
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 whitespace-normal">
                      <span className="shrink-0 text-sm text-muted">
                        সর্বোচ্চ মারহালা
                      </span>
                      <span className="text-sm font-semibold wrap-break-word text-brand-600 font-bengali">
                        সানাবিয়া উলিয়া
                      </span>
                    </span>
                  </div>
                  <div className="flex text-sm font-semibold flex-wrap items-center gap-x-4 gap-y-1 leading-snug">
                    <span className="inline-flex items-center gap-1.5 whitespace-normal">
                      <span className="shrink-0 text-sm text-muted">মারকায</span>
                      <span className="text-sm font-semibold wrap-break-word font-bengali">
                        দরসিয়াত — উম্মুল মুমেনীন হযরত আয়েশা সিদ্দিকা (রাঃ) বালিকা মাদরাসা
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
                <button
                  data-slot="button"
                  className="button button--sm button--ghost w-9 h-9 bg-surface-secondary text-foreground"
                  data-rac=""
                  type="button"
                  tabIndex={0}
                  data-react-aria-pressable="true"
                  aria-label="Notifications"
                  id="react-aria9614000272-_r_8_"
                >
                  <svg
                    stroke="currentColor"
                    fill="none"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    height={17}
                    width={17}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </button>
                <button
                  data-slot="button"
                  className="button button--sm button--ghost w-9 h-9 bg-surface-secondary text-foreground"
                  data-rac=""
                  type="button"
                  tabIndex={0}
                  data-react-aria-pressable="true"
                  aria-label="ডার্ক মোডে যান"
                  id="react-aria9614000272-_r_a_"
                >
                  <svg
                    stroke="currentColor"
                    fill="none"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    height={17}
                    width={17}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                </button>
                <div
                  className="hidden sm:flex popover__trigger ps-2 items-center gap-2.5 cursor-pointer rounded-lg transition-opacity hover:opacity-90 outline-none"
                  data-slot="popover-trigger"
                  role="button"
                  aria-label="ব্যবহারকারী মেনু"
                  aria-expanded="false"
                  id="react-aria9614000272-_r_d_"
                  data-react-aria-pressable="true"
                  tabIndex={0}
                >
                  <div className="w-9 h-9 text-sm rounded-full bg-brand-600 text-white flex items-center justify-center font-semibold shrink-0 font-bengali">
                    <img
                      alt=""
                      className="w-full h-full rounded-full object-cover"
                      src="https://api.bems.befaqbd.org/media/users/profile_pictures/WhatsApp_Image_2026-08-23_at_3.06.59_PM.jpg?token=InVzZXJzL3Byb2ZpbGVfcGljdHVyZXMvV2hhdHNBcHBfSW1hZ2VfMjAyNi0wOC0yM19hdF8zLjA2LjU5X1BNLmpwZyI:1xAPts:Y8GEbm3oyIUOTxJpTUcd5OFzeBPDjcUUuF1nML8o4U8"
                    />
                  </div>
                </div>
              </div>
            </header>
            {/* <div className="overflow-hidden border-b border-border/50 bg-section-header px-3 py-1.5 text-xs text-muted sm:px-6">
              <p className="truncate font-bengali">জরুরি বিজ্ঞপ্তি: পরীক্ষার্থী নিবন্ধন কার্যক্রম চলমান রয়েছে। নির্ধারিত সময়ের মধ্যে তথ্য যাচাই করুন।</p>
            </div> */}
          </div>

          <main className="min-h-0 flex-1 bg-dashboard-workspace">
            <Outlet />
          </main>
        </div>
      </div>
      <DefaultModal />
    </div>
  );
}
