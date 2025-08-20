"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, X, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Message } from "./types/chat";
import { getAccessToken, useUser } from "@auth0/nextjs-auth0";
import { toast } from "sonner";
import { uploadFiles } from "@/lib/utils";
import { useRandomId, useSettings } from "@/context";

interface ChatbotInputProps {
  placeholder?: string;
  disabled?: boolean;
  setMessagesHandler?: (messages: Message[]) => void;
  chatMessages?: Message[];
  setIsThinking?: (isThinking: boolean) => void;
  chatId: string;
}

export default function ChatbotInput({
  placeholder = "What would you like to know?",
  disabled = false,
  setMessagesHandler,
  chatMessages,
  setIsThinking,
  chatId,
}: ChatbotInputProps) {
  const [userInput, setUserInput] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<Message[]>(chatMessages || []);
  const [loading, setLoading] = useState<boolean>(false);
  const { randomId } = useRandomId();
  const { user } = useUser();
  const { includeSource } = useSettings();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    setMessages(chatMessages || []);
  }, [chatMessages]);

  // On mount, if user is not logged in, generate a random id
  useEffect(() => {
    // const newRandomId = Math.random().toString(36).substring(2, 15);
    // setRandomId(newRandomId);
    // Reset input field and files when component mounts
    setUserInput("");
    setFiles([]);
  }, [user]);

  const handleAttachment = () => {
    // Trigger the file input click to open file picker
    fileInputRef.current?.click();
  };

  const handleUserInput = async () => {
    setIsThinking?.(true);
    // console.log("User input to send:", userInput);
    try {
      let accessToken = null;
      if (user) {
        accessToken = await getAccessToken();
      }

      const chatResponse = await fetch(`${apiUrl}/chat`, {
        method: "POST",
        headers: user
          ? {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            }
          : {
              "Content-Type": "application/json",
            },
        body: JSON.stringify({
          user_input: userInput,
          message_history: messages,
          guest_random_id: !user ? randomId : undefined,
          chat_id: chatId,
          include_source: includeSource,
        }),
      });
      const data = await chatResponse.json();

      // Console
      // console.log(data[0]);
      // console.log(data[1]);
      setMessages(data[1]);
      // Update UI
      setMessagesHandler?.(data[1]);
    } catch (error) {
      console.error("Error sending user input:", error);
    } finally {
      setIsThinking?.(false);
    }
  };

  const handleFileUpload = async () => {
    if (files.length === 0) {
      console.log("No files selected");
      return;
    }
    console.log("Selected file:", files[0].name);
    if (!apiUrl) {
      toast.error("API URL is not defined");
      return;
    }

    await uploadFiles(files, apiUrl, user, randomId);
    setFiles([]);
  };
  const handleAllInput = async () => {
    if (!loading && userInput !== "") {
      setUserInput("");
      setLoading(true);
      setMessagesHandler?.([...messages, { role: "user", content: userInput }]);
      await handleFileUpload();
      console.log("Files uploaded successfully");
      await handleUserInput();
      setLoading(false);
    }
  };
  return (
    <div className="w-full mx-auto bg-blue-100/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/10">
      {/* File preview - you can conditionally show this */}
      {files.length > 0 && (
        <div className="mb-2 p-2 bg-muted rounded-md flex items-center justify-between">
          <span className="text-sm text-muted-foreground truncate">
            {files.map((file) => file.name).join(", ")}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setFiles([])}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2 p-2 border rounded-xl bg-transparent shadow-sm">
        {/* <div className="flex-1"> */}
        <Textarea
          value={userInput}
          placeholder={placeholder}
          disabled={disabled}
          className="border-0 shadow-none focus-visible:ring-0 resize-none min-h-[40px] max-h-32 overflow-y-auto"
          style={{ height: "auto" }}
          onChange={(e) => {
            setUserInput(e.target.value);
            // Auto-resize the textarea
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 128) + "px";
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleAllInput();
            }
          }}
        />
        {/* </div> */}

        <div className="flex items-center gap-1">
          {/* File attachment button */}
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            className="h-10 w-10 p-0 hover:cursor-pointer"
            onClick={handleAttachment}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          {/* Send button */}
          <Button
            variant="ghost"
            disabled={disabled}
            size="sm"
            className={`h-9 w-9 p-0 hover:cursor-pointer ${
              loading
                ? "bg-gradient-to-r from-blue-500/50 to-purple-500/50 text-white"
                : "hover:bg-gradient-to-r hover:from-blue-500/50 hover:to-purple-500/70 hover:text-white"
            }`}
            onClick={handleAllInput}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

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
            setFiles([...files, file]);
          }
        }}
      />
    </div>
  );
}
