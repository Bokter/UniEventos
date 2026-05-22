import { Toaster } from "./ui/sonner";
import { SiteFooter } from "./visual/SiteFooter";
import { PageTransition } from "./visual/PageTransition";

export function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-base)" }}>
      <PageTransition />
      <SiteFooter />
      <Toaster />
    </div>
  );
}
