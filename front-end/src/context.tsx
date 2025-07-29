"use client";

import { createContext, useContext, useEffect, useState } from "react";

const RandomIdContext = createContext<{
  randomId: string;
  setRandomId: (id: string) => void;
} | null>(null);

const ApiUrlContext = createContext<{
  apiUrl: string;
  setApiUrl: (url: string) => void;
} | null>(null);

export const ContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [randomId, setRandomId] = useState<string>("");
  const [apiUrl, setApiUrl] = useState<string>("");

  useEffect(() => {
    const newRandomId = Math.random().toString(36).substring(2, 15);
    setRandomId(newRandomId);
    setApiUrl(process.env.NEXT_PUBLIC_API_URL || "");
  }, []);

  return (
    <RandomIdContext.Provider value={{ randomId, setRandomId }}>
      <ApiUrlContext.Provider value={{ apiUrl, setApiUrl }}>
        {children}
      </ApiUrlContext.Provider>
    </RandomIdContext.Provider>
  );
};

export const useRandomId = () => {
  const ctx = useContext(RandomIdContext);
  if (!ctx) throw new Error("useRandomId must be used within provider");
  return ctx;
};

export const useApiUrl = () => {
  const ctx = useContext(ApiUrlContext);
  if (!ctx) throw new Error("useApiUrl must be used within provider");
  return ctx;
};
