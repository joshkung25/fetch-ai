import { SidebarTrigger } from "@/components/ui/sidebar";
import { FileText, LogOut, Settings, User } from "lucide-react";
import ThemeToggle from "./theme-toggle";
import { useUser } from "@auth0/nextjs-auth0";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import UploadSuggestionsModal from "./upload-suggestion-modal";
export default function NavbarNew() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  // console.log(user);

  useEffect(() => {
    if (user) {
      setOpen(true);
    }
  }, [user]);
  return (
    <>
      <header className="flex h-16 w-full shrink-0 items-center gap-2 px-4 justify-between bg-transparent z-10 border-b">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="-ml-1" />
          <FileText className="h-5 w-5" />
          <h1 className="font-semibold">Fetch AI</h1>
        </div>
        <div className="flex items-center gap-4 pr-8">
          <ThemeToggle />
          {user && (
            <Button
              variant="ghost"
              className="hover:cursor-pointer"
              onClick={() => {
                setOpen(true);
              }}
            >
              <Settings className="h-5 w-5" />
            </Button>
          )}
          {user ? (
            <a href="/auth/logout">
              <Button variant="ghost" className="hover:cursor-pointer">
                <LogOut className="h-5 w-5" />
              </Button>
            </a>
          ) : (
            <a href="/auth/login">
              <Button variant="ghost" className="hover:cursor-pointer">
                <User className="h-5 w-5" />
              </Button>
            </a>
          )}
        </div>
      </header>
      <UploadSuggestionsModal open={open} setOpen={setOpen} />
    </>
  );
}
