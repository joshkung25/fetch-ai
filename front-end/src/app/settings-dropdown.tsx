"use client";

import * as React from "react";
import { Settings, Sun, Moon, Monitor, MoreHorizontal } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/context";
import { useUser } from "@auth0/nextjs-auth0";

export default function SettingsDropdown() {
  const { setTheme, theme } = useTheme();
  const { includeSource, setIncludeSource } = useSettings();
  const { user } = useUser();
  const handleAdditionalMenu = () => {
    // This function can be used to open another menu/dialog
    console.log("Opening additional menu...");
    // You can implement your additional menu logic here
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Open settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Settings</DropdownMenuLabel>

        {/* Include source toggle */}
        {user && (
          <>
            <DropdownMenuSeparator />
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-sm">Source in responses</span>
              <Switch
                checked={includeSource}
                onCheckedChange={setIncludeSource}
                aria-label="Toggle include source in response"
              />
            </div>
          </>
        )}
        <DropdownMenuSeparator />

        {/* Theme submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <div className="flex items-center">
              {theme === "light" && <Sun className="mr-2 h-4 w-4" />}
              {theme === "dark" && <Moon className="mr-2 h-4 w-4" />}
              {theme === "system" && <Monitor className="mr-2 h-4 w-4" />}
              <span>Theme</span>
            </div>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="mr-2 h-4 w-4" />
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="mr-2 h-4 w-4" />
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <Monitor className="mr-2 h-4 w-4" />
              System
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Additional menu option */}
        <DropdownMenuItem onClick={handleAdditionalMenu}>
          <MoreHorizontal className="mr-2 h-4 w-4" />
          More options
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
