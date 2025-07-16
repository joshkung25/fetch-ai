"use client";

import * as React from "react";
import Link from "next/link";
import { IoMdHome } from "react-icons/io";
import { FaLinkedin, FaEnvelope } from "react-icons/fa";

import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  // NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import ThemeToggle from "@/app/theme-toggle";

export default function Navbar() {
  //   {
  //   collapsed,
  //   setCollapsed,
  // }: {
  //   collapsed: boolean;
  //   setCollapsed: (collapsed: boolean) => void;
  // }
  return (
    <div className="sticky top-0 z-50 flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-800">
      <NavigationMenu className="max-w-full w-full flex justify-between">
        <IoMdHome
          className="size-10 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full p-1"
          onClick={() => (window.location.href = "/home")}
          // onClick={() => setCollapsed(!collapsed)}
        />
        <NavigationMenuList className="pl-4 hidden sm:flex">
          <NavigationMenuItem>
            {/* <NavigationMenuTrigger>Getting started</NavigationMenuTrigger> */}
            <NavigationMenuContent>
              <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                <li className="row-span-3">
                  <NavigationMenuLink asChild>
                    <a
                      className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                      href="/"
                    >
                      {/* <Icons.logo className="h-6 w-6" /> */}
                      <div className="mb-2 mt-4 text-lg font-medium">
                        shadcn/ui
                      </div>
                      <p className="text-sm leading-tight text-muted-foreground">
                        Beautifully designed components built with Radix UI and
                        Tailwind CSS.
                      </p>
                    </a>
                  </NavigationMenuLink>
                </li>
                <ListItem href="/docs" title="Introduction">
                  Re-usable components built using Radix UI and Tailwind CSS.
                </ListItem>
                <ListItem href="/docs/installation" title="Installation">
                  How to install dependencies and structure your app.
                </ListItem>
                <ListItem href="/docs/primitives/typography" title="Typography">
                  Styles for headings, paragraphs, lists...etc
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          {/* <NavigationMenuItem>
            <NavigationMenuTrigger>Components</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                {components.map((component) => (
                  <ListItem
                    key={component.title}
                    title={component.title}
                    href={component.href}
                  >
                    {component.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem> */}
          {/* <NavigationMenuItem>
            <Link href="/projects" className={navigationMenuTriggerStyle()}>
              Projects
            </Link>
          </NavigationMenuItem> */}
        </NavigationMenuList>
        <NavigationMenuList>
          <ThemeToggle />
          <Link
            href="mailto:joshuahkung@gmail.com"
            className={`ml-4 ${navigationMenuTriggerStyle()}`}
          >
            <FaEnvelope className="size-5" />
          </Link>
          <Link
            href="https://www.linkedin.com/in/josh-kung"
            className={`hover:text-blue-400 ${navigationMenuTriggerStyle()}`}
          >
            <FaLinkedin className="size-5" />
          </Link>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
