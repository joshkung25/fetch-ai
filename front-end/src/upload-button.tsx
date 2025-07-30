import { Upload } from "lucide-react";
import { Button } from "./components/ui/button";
import UploadSuggestionsModal from "./app/upload-suggestion-modal";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { uploadFiles } from "@/lib/utils";
import { useRandomId } from "@/context";
import { useUser } from "@auth0/nextjs-auth0";
import UploadMetadataModal from "./app/upload-metadata-modal";
import { DocumentInfoInput } from "./app/upload-metadata-modal";

export default function UploadButton() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const { randomId } = useRandomId();
  const { user } = useUser();
  const [isMetadataModalOpen, setIsMetadataModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (user) {
      setIsMetadataModalOpen(false);
    }
  }, [user]);

  const handleAttachment = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (metadata?: DocumentInfoInput) => {
    console.log("file", file);
    if (!file) return;
    if (!apiUrl) {
      toast.error("API URL is not defined");
      return;
    }

    await uploadFiles([file], apiUrl, user, randomId, metadata?.tags);
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            setFile(file);
          }
          setIsMetadataModalOpen(true);
        }}
        accept="image/*,text/*,.pdf,.doc,.docx"
      />
      <UploadMetadataModal
        isOpen={isMetadataModalOpen}
        onClose={() => {
          setIsMetadataModalOpen(false);
          setFile(null);
        }}
        fileName={file?.name || ""}
        onSave={handleFileUpload}
      />
      <Button onClick={handleAttachment} className="gap-2" variant="outline">
        <Upload className="h-4 w-4" />
        <span className="hidden sm:inline">Upload</span>
      </Button>
    </>
  );
}
