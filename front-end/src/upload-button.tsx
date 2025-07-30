import { Upload } from "lucide-react";
import { Button } from "./components/ui/button";
import UploadSuggestionsModal from "./app/upload-suggestion-modal";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { uploadFiles } from "@/lib/utils";
import { useRandomId } from "@/context";
import { useUser } from "@auth0/nextjs-auth0";

export default function UploadButton() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const { randomId } = useRandomId();
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileUpload}
        accept="image/*,text/*,.pdf,.doc,.docx"
      />
      <Button onClick={handleAttachment} className="gap-2" variant="outline">
        <Upload className="h-4 w-4" />
        <span className="hidden sm:inline">Upload</span>
      </Button>
    </>
  );
}
