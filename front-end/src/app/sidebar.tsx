"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

interface MenuItemProps {
  label: string;
  path: string;
  subitems?: Omit<MenuItemProps, "subitems">[];
}

function MenuItem({ label, path }: MenuItemProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = pathname.startsWith(path);

  return (
    <Button
      variant="ghost"
      className={`h-12 w-full justify-start cursor-pointer ${
        isActive ? "bg-accent text-accent-foreground" : ""
      }`}
      onClick={() => router.push(path)}
    >
      <span className="text-md">{label}</span>
    </Button>
  );
}

export default function Sidebar({ collapsed = true }: { collapsed: boolean }) {
  return (
    <div
      className={`flex flex-col sm:pt-8 sm:p-4 outline outline-1 outline-gray-200 
        transition-all duration-500 ease-in-out ${
          collapsed
            ? "opacity-0 w-0 max-h-0 p-0 md:p-0"
            : "opacity-100 w-full max-h-[1000px] md:w-64"
        }`}
    >
      <MenuItem label="Home" path="/home" />
      <MenuItem label="Data Analysis" path="/data-analysis" />
      <MenuItem label="Projects" path="/projects" />
      <MenuItem label="Contact" path="/contact" />
      <MenuItem label="About" path="/about" />
    </div>
  );
}
