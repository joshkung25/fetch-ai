import { SidebarTrigger } from "@/components/ui/sidebar";
import { FileText, LogOut, User } from "lucide-react";
import ThemeToggle from "./theme-toggle";
import { useUser } from "@auth0/nextjs-auth0";
import { Button } from "@/components/ui/button";

export default function NavbarNew() {
  const { user } = useUser();

  // console.log(user);

  return (
    <>
      <header className="flex h-16 w-full shrink-0 items-center gap-2 px-4 justify-between bg-transparent z-10 border-b">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="-ml-1" />
          <FileText className="h-5 w-5" />
          <h1 className="font-semibold">Fetch AI</h1>
        </div>
        <div className="flex items-center gap-8 pr-8">
          <ThemeToggle />
          {user ? (
            <a href="/auth/logout">
              <Button variant="outline" className="hover:cursor-pointer">
                <LogOut className="h-5 w-5" />
                Logout
              </Button>
            </a>
          ) : (
            <a href="/auth/login">
              <Button variant="outline" className="hover:cursor-pointer">
                <User className="h-5 w-5" />
                Sign in
              </Button>
            </a>
          )}
        </div>
      </header>
    </>
  );
}
