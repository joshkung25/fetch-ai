"use client";

import * as React from "react";
import {
  MessageSquarePlus,
  Search,
  MoreHorizontal,
  Trash2,
  Edit3,
  MessageSquare,
  FileText,
  FileUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Chat from "./chat";
import { useEffect, useRef } from "react";
import { getAccessToken, useUser } from "@auth0/nextjs-auth0";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { uploadFiles } from "@/lib/utils";
import { useRandomId } from "@/context";
import Image from "next/image";
// Mock data for existing chats
const mockChats = [
  {
    id: "placeholder_google-oauth2112897530008069583936",
    title: "React Best Practices",
    lastMessage: "How to optimize React components?",
    timestamp: new Date("2024-01-15T10:30:00"),
    isActive: true,
  },
  {
    id: "2",
    title: "TypeScript Help",
    lastMessage: "Explain generic types in TypeScript",
    timestamp: new Date("2024-01-14T15:45:00"),
    isActive: false,
  },
  {
    id: "3",
    title: "Database Design",
    lastMessage: "Best practices for SQL schema design",
    timestamp: new Date("2024-01-13T09:20:00"),
    isActive: false,
  },
  {
    id: "4",
    title: "API Development",
    lastMessage: "RESTful API design patterns",
    timestamp: new Date("2024-01-12T14:10:00"),
    isActive: false,
  },
  {
    id: "5",
    title: "CSS Grid Layout",
    lastMessage: "How to create responsive layouts",
    timestamp: new Date("2024-01-11T11:30:00"),
    isActive: false,
  },
  {
    id: "6",
    title: "CSS Grid Layout",
    lastMessage: "How to create responsive layouts",
    timestamp: new Date("2024-01-11T11:30:00"),
    isActive: false,
  },
  {
    id: "7",
    title: "CSS Grid Layout",
    lastMessage: "How to create responsive layouts",
    timestamp: new Date("2024-01-11T11:30:00"),
    isActive: false,
  },
  {
    id: "8",
    title: "CSS Grid Layout",
    lastMessage: "How to create responsive layouts",
    timestamp: new Date("2024-01-11T11:30:00"),
    isActive: false,
  },
];

type SortOption = "recent" | "oldest" | "alphabetical";

// TODO delete later
export interface Message {
  role: string;
  content: string;
}
export default function ChatSidebar() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState<SortOption>("recent");
  const [chats, setChats] = React.useState(mockChats);
  const [chatMessages, setChatMessages] = React.useState<Message[]>([]);
  const [file, setFile] = React.useState<File>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useUser();
  const { randomId } = useRandomId();

  const router = useRouter();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  // console.log("apiUrl", apiUrl);
  // console.log("randomId", randomId);

  // Filter chats based on search query
  const filteredChats = React.useMemo(() => {
    return chats.filter(
      (chat) =>
        chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [chats, searchQuery]);

  // Sort chats based on selected option
  const sortedChats = React.useMemo(() => {
    const sorted = [...filteredChats];
    switch (sortBy) {
      case "recent":
        return sorted.sort(
          (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
        );
      case "oldest":
        return sorted.sort(
          (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
        );
      case "alphabetical":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return sorted;
    }
  }, [filteredChats, sortBy]);

  const handleNewChat = () => {
    // Logic to start a new chat
    console.log("Starting new chat...");
    setChatMessages([]);
    router.push("/");
  };

  const handleDeleteChat = (chatId: string) => {
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));
  };

  const handleRenameChat = (chatId: string) => {
    // Logic to rename chat
    console.log("Renaming chat:", chatId);
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInHours =
      (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return timestamp.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 168) {
      // 7 days
      return timestamp.toLocaleDateString([], { weekday: "short" });
    } else {
      return timestamp.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    }
  };

  const handleAttachment = () => {
    console.log("handleAttachment");
    // Trigger the file input click to open file picker
    fileInputRef.current?.click();
  };

  const handleUploadDocument = async () => {
    console.log("handleUploadDocument", file);
    if (file === undefined) {
      console.log("No files selected");
      return;
    }
    if (!apiUrl) {
      toast.error("API URL is not defined");
      return;
    }
    await uploadFiles([file], apiUrl, user, randomId);

    // const accessToken = await getAccessToken();
    // const formData = new FormData();
    // formData.append("file", file);
    // formData.append("title", file.name);
    // // formData.append("user_id", clean_id);
    // try {
    //   const response = await fetch(`${apiUrl}/add`, {
    //     headers: {
    //       Authorization: `Bearer ${accessToken}`,
    //     },
    //     method: "POST",
    //     body: formData,
    //   });
    //   if (!response.ok) {
    //     if (response.status === 413) {
    //       toast.error("File size too large");
    //     } else {
    //       toast.error("Failed to upload file");
    //     }
    //     return;
    //   }
    //   toast.success("File uploaded successfully");
    // } catch (error) {
    //   toast.error("Failed to upload file");
    // }
    setFile(undefined);
  };

  useEffect(() => {
    if (file) {
      handleUploadDocument();
    }
  }, [file]);

  useEffect(() => {
    if (user) {
      fetch(`${apiUrl}/add-user`, {
        method: "POST",
        body: JSON.stringify({
          user_id: user.sub,
          email: user.email,
          name: user.name,
        }),
        headers: { "Content-Type": "application/json" },
      });
    }
    console.log("success");
  }, [user]);

  const handleChatClick = (chatId: string) => {
    console.log("handleChatClick", chatId);
    router.push(`/chat/${chatId}`);
  };

  return (
    <Sidebar className="border-r">
      {/* <div className="flex pt-4 pl-4">
        <Image src="/docs_ai_logo2.png" alt="Fetch AI" width={30} height={30} />
      </div> */}

      <SidebarHeader className="border-b p-2 pt-6">
        <Button
          variant="ghost"
          onClick={handleNewChat}
          className="w-full justify-start gap-2 h-10 hover:cursor-pointer"
          size="sm"
        >
          <MessageSquarePlus className="h-4 w-4" />
          New Chat
        </Button>
        <Button
          variant="ghost"
          onClick={handleAttachment}
          className="w-full justify-start gap-2 h-10 hover:cursor-pointer"
          size="sm"
        >
          <FileUp className="h-4 w-4" />
          Upload a Document
        </Button>
        <Button
          variant="ghost"
          onClick={() => router.push("/docs")}
          className="w-full justify-start gap-2 h-10 hover:cursor-pointer"
          size="sm"
        >
          <FileText className="h-4 w-4" />
          <span>View Documents</span>
        </Button>
      </SidebarHeader>

      <SidebarContent className="p-0">
        <SidebarGroup>
          <SidebarGroupContent>
            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="mb-4">
              <Select
                value={sortBy}
                onValueChange={(value: SortOption) => setSortBy(value)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="alphabetical">Alphabetical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-2 mb-2">
            Chats ({sortedChats.length})
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sortedChats.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={chat.isActive}
                    className="h-auto p-3 flex-col items-start gap-1"
                    onClick={() => handleChatClick(chat.id)}
                  >
                    <div className="w-full cursor-pointer">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="font-medium text-sm truncate">
                            {chat.title}
                          </span>
                        </div>
                        {/* <span className="text-xs text-muted-foreground shrink-0">
                            {formatTimestamp(chat.timestamp)}
                          </span> */}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-1 pl-6">
                        {chat.lastMessage}
                      </p>
                    </div>
                  </SidebarMenuButton>
                  <SidebarMenuAction showOnHover>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <div className="h-6 w-6 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground cursor-pointer">
                          <MoreHorizontal className="h-4 w-4" />
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => handleRenameChat(chat.id)}
                        >
                          <Edit3 className="h-4 w-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteChat(chat.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuAction>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>

            {sortedChats.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {searchQuery ? "No chats found" : "No chats yet"}
                </p>
                <p className="text-xs mt-1">
                  {searchQuery
                    ? "Try a different search term"
                    : "Start a new conversation"}
                </p>
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
      {/* Hidden file input - you can add ref and onChange */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        accept="image/*,text/*,.pdf,.doc,.docx"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            setFile(file);
          }
        }}
      />
    </Sidebar>
  );
}
