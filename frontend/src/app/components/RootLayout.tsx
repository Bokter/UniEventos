import { Outlet } from "react-router";
import { Toaster } from "./ui/sonner";
import { SiteFooter } from "./visual/SiteFooter";

export function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--page-bg,#F4F9FF)]">
      <Outlet />
      <SiteFooter />
      <Toaster />
    </div>
  );
}
