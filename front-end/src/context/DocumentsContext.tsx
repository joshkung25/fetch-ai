"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import { useUser, getAccessToken } from "@auth0/nextjs-auth0";

export type DocumentMeta = {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: Date;
  tags: string[];
  description: string;
};

type DocumentsContextType = {
  documents: DocumentMeta[];
  fetchDocuments: () => Promise<void>;
};

const DocumentsContext = createContext<DocumentsContextType | undefined>(undefined);

export const useDocuments = () => {
  const ctx = useContext(DocumentsContext);
  if (!ctx) throw new Error("useDocuments must be used within DocumentsProvider");
  return ctx;
};

export const DocumentsProvider = ({ children }: { children: React.ReactNode }) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const { user } = useUser();
  const [documents, setDocuments] = useState<DocumentMeta[]>([]);

  const fetchDocuments = useCallback(async () => {
    if (!user) return;
    const accessToken = await getAccessToken();
    const res = await fetch(`${apiUrl}/list`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    setDocuments(
      data.documents
        ? data.documents.map((meta: any, idx: number) => ({
            id: (meta.title || "doc") + idx,
            name: meta.title || "Untitled",
            type: "pdf",
            size: meta.size || "-",
            uploadDate: meta.uploadDate ? new Date(meta.uploadDate) : new Date(),
            tags: Array.isArray(meta.tags)
              ? meta.tags
              : typeof meta.tags === "string"
              ? meta.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
              : [],
            description: meta.description || "",
          }))
        : []
    );
  }, [user, apiUrl]);

  return (
    <DocumentsContext.Provider value={{ documents, fetchDocuments }}>
      {children}
    </DocumentsContext.Provider>
  );
};