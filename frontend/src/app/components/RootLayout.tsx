import { Outlet } from "react-router";
import { Toaster } from "./ui/sonner";

export function RootLayout() {
  return (
    <div className="min-h-screen bg-white">
      <Outlet />
      <Toaster />
    </div>
  );
}