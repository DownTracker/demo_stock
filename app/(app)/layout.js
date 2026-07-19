import RequireAuth from "@/components/RequireAuth";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";

export default function AppShellLayout({ children }) {
  return (
    <RequireAuth>
      <div className="min-h-screen md:flex">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen md:max-w-none max-w-md mx-auto md:mx-0 w-full">
          <AppHeader />
          <div className="flex-1 w-full">
            <div className="md:max-w-6xl md:mx-auto md:px-8 md:py-8">
              {children}
            </div>
          </div>
          <BottomNav />
        </div>
      </div>
    </RequireAuth>
  );
}
