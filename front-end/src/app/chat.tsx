import { SidebarTrigger } from "@/components/ui/sidebar";
import { FileText } from "lucide-react";
import ThemeToggle from "./theme-toggle";
import { Input } from "@/components/ui/input";
import NavbarNew from "./navbar-new";
import InputField from "./input-field";

export default function Chat() {
  return (
    <>
      <NavbarNew />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-16 overflow-y-auto">
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
        <InputField />
      </div>
    </>
  );
}
