import { SidebarTrigger } from "@/components/ui/sidebar";
import { FileText } from "lucide-react";
import ThemeToggle from "./theme-toggle";

export default function NavbarNew() {
  return (
    <>
      <header className="fixed top-0 z-50 flex h-16 w-full shrink-0 items-center gap-2 px-4 justify-between">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <FileText className="h-5 w-5" />
          <h1 className="font-semibold">Fetch AI</h1>
        </div>
        <ThemeToggle />
      </header>
    </>
  );
}
