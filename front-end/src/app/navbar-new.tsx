import { SidebarTrigger } from "@/components/ui/sidebar";
import { FileText } from "lucide-react";
import ThemeToggle from "./theme-toggle";

export default function NavbarNew() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 justify-between">
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
