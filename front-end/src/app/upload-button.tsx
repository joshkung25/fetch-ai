import { Upload } from "lucide-react";
import { Button } from "../components/ui/button";
import UploadSuggestionsModal from "./upload-suggestion-modal";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { uploadFiles } from "@/lib/utils";
import { useRandomId } from "@/context";
import { useUser, getAccessToken } from "@auth0/nextjs-auth0";
import UploadMetadataModal from "./upload-metadata-modal";
import { DocumentInfoInput } from "./upload-metadata-modal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { useDocuments } from "@/context/DocumentsContext";

export default function UploadButton({
  text,
  variant,
}: {
  text: string;
  variant: "default" | "outline";
}) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const { randomId } = useRandomId();
  const { user } = useUser();
  const { documents, fetchDocuments } = useDocuments();
  const [isMetadataModalOpen, setIsMetadataModalOpen] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [pendingMetadata, setPendingMetadata] = useState<DocumentInfoInput | undefined>(undefined);
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

  // Check for duplicate before upload
  const handleFileUpload = async (metadata?: DocumentInfoInput) => {
    if (!file) return;
    if (!apiUrl) {
      toast.error("API URL is not defined");
      return;
    }

    const duplicate = documents.find(doc => doc.name === file.name);
    if (duplicate) {
      setPendingMetadata(metadata);
      setShowReplaceModal(true);
      return;
    }

    await uploadFiles([file], apiUrl, user, randomId, metadata?.tags);
    await fetchDocuments();
    setFile(null);
    setIsMetadataModalOpen(false);
  };

  // Handle replace
  const handleReplaceDocument = async () => {
    if (!file || !apiUrl) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "request",
      JSON.stringify({
        title: file.name,
        tags: pendingMetadata?.tags || [],
      })
    );

    // Get a fresh Auth0 token
    const accessToken = await getAccessToken();
    const res = await fetch(`${apiUrl}/replace`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    });

    if (res.ok) {
      await fetchDocuments();
      toast.success("Document replaced successfully");
    } else {
      let errorMsg = "Unknown error";
      try {
        const error = await res.json();
        if (typeof error === "string") {
          errorMsg = error;
        } else if (error.detail) {
          errorMsg = error.detail;
        } else {
          errorMsg = JSON.stringify(error);
        }
      } catch (e) {
        errorMsg = "Unknown error";
      }
      toast.error("Failed to replace document: " + errorMsg);
    }

    setShowReplaceModal(false);
    setFile(null);
    setIsMetadataModalOpen(false);
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={async (e) => {
          const selectedFile = e.target.files?.[0];
          if (!selectedFile) return;

          // Always refresh documents before checking for duplicates
          await fetchDocuments();

          setFile(selectedFile);

          const duplicate = documents.find(doc => doc.name === selectedFile.name);
          if (duplicate) {
            setIsMetadataModalOpen(false);
            setShowReplaceModal(true);
            return;
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
          fileInputRef.current!.value = "";
        }}
        fileName={file?.name || ""}
        onSave={handleFileUpload}
      />
      <Button onClick={handleAttachment} className="gap-2" variant={variant}>
        <Upload className="h-4 w-4" />
        <span className="hidden sm:inline">{text}</span>
      </Button>

      <Dialog open={showReplaceModal} onOpenChange={setShowReplaceModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Replace Document
            </DialogTitle>
          </DialogHeader>
          <p>
            A document named <b>{file?.name}</b> already exists. Do you want to replace it?
          </p>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleReplaceDocument}>Yes, Replace</Button>
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setShowReplaceModal(false)}>Cancel</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
