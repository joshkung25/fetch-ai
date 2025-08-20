import { getAccessToken } from "@auth0/nextjs-auth0";
import { User } from "@auth0/nextjs-auth0/types";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { toast } from "sonner";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export async function uploadFiles(files: File[], apiUrl: string, user: User | null | undefined, randomId: string, tags?: string[]) {
  toast.loading("Uploading...",);
  for (const file of files) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", file.name);
    if (tags) {
      formData.append("tags", tags.join(","));
    }
    if (!user) {
      formData.append("guest_random_id", randomId);
    }

    try {
      let accessToken = null;
      if (user) {
        accessToken = await getAccessToken();
      }

      const response = await fetch(`${apiUrl}/add`, {
        headers: user
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : {},
        method: "POST",
        body: formData,
      });
      toast.dismiss();

      if (!response.ok) {
        if (response.status === 413) {
          toast.error("File size too large");
        } else {
          toast.error("Failed to upload file"); // 500 Internal server error
        }
        return;
      }
      toast.success("File uploaded successfully");
    } catch (error) {
      if (error instanceof Error && error.message.includes("413")) {
        toast.error("File size too large");
      } else {
        toast.error("Failed to upload file");
      }
    }
  }
}