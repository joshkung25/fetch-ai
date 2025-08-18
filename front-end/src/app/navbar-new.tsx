import { SidebarTrigger } from "@/components/ui/sidebar";
import { FileText, LogOut, Settings, User } from "lucide-react";
import ThemeToggle from "./theme-toggle";
import { useUser } from "@auth0/nextjs-auth0";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import UploadSuggestionsModal from "./upload-suggestion-modal";
import UploadButton from "@/app/upload-button";
import Image from "next/image";
import SettingsDropdown from "./settings-dropdown";

export default function NavbarNew({ nav_header }: { nav_header: string }) {
  const { user } = useUser();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setOpen(false);
    }
  }, [user]);

  return (
    <>
      <header className="flex h-16 w-full shrink-0 items-center gap-2 px-4 justify-between bg-transparent z-10">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="-ml-1" />
          {/* <FileText className="h-5 w-5" /> */}
          <h1 className="font-semibold">{nav_header}</h1>
        </div>
        <div className="flex items-center gap-4 pr-8">
          <UploadSuggestionsModal open={open} setOpen={setOpen} />
          <UploadButton text="Upload" variant="outline" />
          {/* <ThemeToggle /> */}
          {/* {user && ( */}
          <>
            <SettingsDropdown />
            {/* <Button
                variant="ghost"
                className="hover:cursor-pointer"
                onClick={() => {
                  setOpen(true);
                }}
              >
                <Settings className="h-5 w-5" />
              </Button> */}
          </>
          {/* )} */}
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
    </>
  );
}
