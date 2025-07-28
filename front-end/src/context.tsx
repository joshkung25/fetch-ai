"use client";

import { createContext, useContext, useEffect, useState } from "react";

const RandomIdContext = createContext<{
  randomId: string;
  setRandomId: (id: string) => void;
} | null>(null);

export const RandomIdProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [randomId, setRandomId] = useState<string>("");

  useEffect(() => {
    const newRandomId = Math.random().toString(36).substring(2, 15);
    setRandomId(newRandomId);
  }, []);

  return (
    <RandomIdContext.Provider value={{ randomId, setRandomId }}>
      {children}
    </RandomIdContext.Provider>
  );
};

export const useRandomId = () => {
  const ctx = useContext(RandomIdContext);
  if (!ctx) throw new Error("useRandomId must be used within provider");
  return ctx;
};
