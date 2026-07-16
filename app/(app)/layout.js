import RequireAuth from "@/components/RequireAuth";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";

export default function AppShellLayout({ children }) {
  return (
    <RequireAuth>
      <div className="min-h-screen flex flex-col max-w-md mx-auto">
        <AppHeader />
        <div className="flex-1">{children}</div>
        <BottomNav />
      </div>
    </RequireAuth>
  );
}
