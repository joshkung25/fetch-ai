import { SidebarTrigger } from "@/components/ui/sidebar";
import { FileText, LogOut, Upload, Settings, User } from "lucide-react";
import ThemeToggle from "./theme-toggle";
import { useUser } from "@auth0/nextjs-auth0";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import UploadSuggestionsModal from "./upload-suggestion-modal";
import { toast } from "sonner";
import { uploadFiles } from "@/lib/utils";
import { useRandomId } from "@/context";

export default function NavbarNew({ nav_header }: { nav_header: string }) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const { randomId } = useRandomId();
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // console.log(user);

  useEffect(() => {
    if (user) {
      setOpen(false);
    }
  }, [user]);

  const handleAttachment = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!apiUrl) {
      toast.error("API URL is not defined");
      return;
    }

    await uploadFiles([file], apiUrl, user, randomId);
    toast.success("File uploaded successfully");
  };

  return (
    <>
      <header className="flex h-16 w-full shrink-0 items-center gap-2 px-4 justify-between bg-transparent z-10 border-b">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileUpload}
          accept="image/*,text/*,.pdf,.doc,.docx"
        />
        <div className="flex items-center gap-3">
          <SidebarTrigger className="-ml-1" />
          <FileText className="h-5 w-5" />
          <h1 className="font-semibold">{nav_header}</h1>
        </div>
        <div className="flex items-center gap-4 pr-8">
          <UploadSuggestionsModal open={open} setOpen={setOpen} />
          <Button onClick={handleAttachment} className="gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </Button>
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
    </>
  );
}
