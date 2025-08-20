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
import { useEffect, useRef } from "react";
import { getAccessToken, useUser } from "@auth0/nextjs-auth0";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { uploadFiles } from "@/lib/utils";
import { useRandomId } from "@/context";
import Image from "next/image";
import type { ChatSidebar } from "./types/chat";
import UploadMetadataModal from "./upload-metadata-modal";
import { DocumentInfoInput } from "./upload-metadata-modal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { useDocuments } from "@/context/DocumentsContext";

// Mock data for existing chats
const mockChats = [
  {
    id: "ezfliif7mrw_google-oauth2112897530008069583936",
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
  source_document?: string;
}

export default function ChatSidebar() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState<SortOption>("recent");
  const [chats, setChats] = React.useState<ChatSidebar[]>([]);
  const [chatMessages, setChatMessages] = React.useState<Message[]>([]);
  const [isMetadataModalOpen, setIsMetadataModalOpen] = React.useState(false);
  const [showReplaceModal, setShowReplaceModal] = React.useState(false);
  const [pendingMetadata, setPendingMetadata] = React.useState<DocumentInfoInput | undefined>(undefined);
  const [file, setFile] = React.useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useUser();
  const { randomId } = useRandomId();
  const { documents, fetchDocuments } = useDocuments();

  const router = useRouter();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Filter chats based on search query
  const filteredChats = React.useMemo(() => {
    return chats.filter(
      (chat) => chat.title.toLowerCase().includes(searchQuery.toLowerCase())
      // || chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleDeleteChat = async (chatId: string) => {
    setChats((prev) => prev.filter((chat) => chat.chatId !== chatId));
    let accessToken = null;
    if (user) {
      accessToken = await getAccessToken();
    }
    const response = await fetch(`${apiUrl}/delete-chat`, {
      method: "POST",
      body: JSON.stringify({ chat_id: chatId }),
      headers: user
        ? {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          }
        : { "Content-Type": "application/json" },
    });
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
    await fetchDocuments(); // <-- Ensure this finishes before closing modal
    setFile(null);
    setIsMetadataModalOpen(false);
    fileInputRef.current!.value = "";
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

    const accessToken = await getAccessToken();
    const res = await fetch(`${apiUrl}/replace`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    });

    if (res.ok) {
      await fetchDocuments(); // <-- Ensure this finishes before closing modal
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
    fileInputRef.current!.value = "";
  };

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
  }, [user]);

  const handleChatClick = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  useEffect(() => {
    const fetchChatList = async () => {
      if (user) {
        const accessToken = await getAccessToken();
        const response = await fetch(`${apiUrl}/chat-list`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const data = await response.json();
        setChats(
          data.map((chat: any) => ({
            chatId: chat.chat_id,
            title: chat.chat_name,
            lastMessage:
              chat.chat_history[chat.chat_history.length - 1].content,
            timestamp: new Date(chat.created_at),
            isActive: false,
          }))
        );
      }
    };
    fetchChatList();
  }, [user]);

  const handleAttachment = async () => {
    fileInputRef.current?.click();
  };

  return (
    <Sidebar className="border-r">
      <div className="flex pt-5 pl-4 items-center gap-2">
        <div className="flex items-center gap-2">
          <Image
            src="/docs_ai_logo_3.png"
            alt="Fetch AI"
            width={35}
            height={35}
            priority={true}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Powered by <span className="font-bold">Fetch</span>
        </p>
      </div>
      {/* <div className="flex pt-5 pl-4">
        <Image src="/klerk_icon.png" alt="Fetch AI" width={30} height={30} />
      </div> */}

      <SidebarHeader className="border-b p-2 pt-4">
        <Button
          variant="ghost"
          onClick={handleNewChat}
          className="w-full justify-start gap-2 h-10 hover:cursor-pointer"
          size="sm"
        >
          <MessageSquarePlus className="h-4 w-4" />
          New Chat
        </Button>
        {/* <Button
          variant="ghost"
          onClick={handleAttachment}
          className="w-full justify-start gap-2 h-10 hover:cursor-pointer"
          size="sm"
        >
          <FileUp className="h-4 w-4" />
          Upload a Document
        </Button> */}
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
                <SidebarMenuItem key={chat.chatId}>
                  <SidebarMenuButton
                    asChild
                    // isActive={chat.isActive}
                    className="h-auto p-3 flex-col items-start gap-1"
                    onClick={() => handleChatClick(chat.chatId)}
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
                          onClick={() => handleRenameChat(chat.chatId)}
                        >
                          <Edit3 className="h-4 w-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteChat(chat.chatId)}
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
                    : user
                    ? "Start a new conversation"
                    : "Log in to view your chats"}
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
        className="hidden"
        accept="image/*,text/*,.pdf,.doc,.docx"
        onChange={async (e) => {
          const selectedFile = e.target.files?.[0];
          if (!selectedFile) return;

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
    </Sidebar>
  );
}
