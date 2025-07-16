import { SidebarTrigger } from "@/components/ui/sidebar";
import { FileText } from "lucide-react";
import ThemeToggle from "./theme-toggle";

export default function Chat() {
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
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="grid auto-rows-min gap-4 md:grid-cols-1">
          <div className="aspect-video rounded-xl bg-muted/50 flex items-center justify-center">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">
                Welcome to Fetch AI Assistant
              </h2>
              <p className="text-muted-foreground">
                Start a new conversation or select an existing chat from the
                sidebar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
