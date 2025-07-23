"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, X, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Message } from "./chat-sidebar";
import { useUser } from "@auth0/nextjs-auth0";
import { toast } from "sonner";

interface ChatbotInputProps {
  placeholder?: string;
  disabled?: boolean;
  setMessagesHandler?: (messages: Message[]) => void;
  chatMessages?: Message[];
}

export default function ChatbotInput({
  placeholder = "Type your message...",
  disabled = false,
  setMessagesHandler,
  chatMessages,
}: ChatbotInputProps) {
  const [userInput, setUserInput] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<Message[]>(chatMessages || []);
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useUser();
  useEffect(() => {
    setMessages(chatMessages || []);
  }, [chatMessages]);
  const clean_id = user?.sub?.replace("|", "") || "guest";

  const handleAttachment = () => {
    // Trigger the file input click to open file picker
    fileInputRef.current?.click();
  };
  const handleUserInput = async () => {
    console.log("User input to send:", userInput);
    try {
      // http://localhost:8001/chat
      //http://18.225.92.118:8001/chat
      //https://api.fetchfileai.com/chat
      const response = await fetch("https://api.fetchfileai.com/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_input: userInput,
          message_history: messages,
          user_id: clean_id,
        }),
      });
      const data = await response.json();

      // Console
      console.log(data[0]);
      console.log(data[1]);
      setMessages(data[1]);
      // Update UI
      setMessagesHandler?.(data[1]);
    } catch (error) {
      console.error("Error sending user input:", error);
    }
  };
  const handleFileUpload = async () => {
    if (files.length === 0) {
      console.log("No files selected");
      return;
    }
    console.log("Selected file:", files[0].name);

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", file.name);
      formData.append("user_id", clean_id);

      try {
        // http://localhost:8001/add
        // http://18.225.92.118:8001/add
        // https://api.fetchfileai.com/add
        const response = await fetch("https://api.fetchfileai.com/add", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) {
          throw new Error("Failed to upload file");
        }
        console.log("File uploaded successfully:", response);
        toast.success("File uploaded successfully");
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
    // setFiles([]);
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
      setFiles([]);
    }
  };
  return (
    <div className="w-full max-w-4xl mx-auto">
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
      <div className="flex items-end gap-2 p-2 border rounded-lg bg-background shadow-sm">
        <div className="flex-1">
          <Input
            value={userInput}
            placeholder={placeholder}
            disabled={disabled}
            className="border-0 shadow-none focus-visible:ring-0 resize-none"
            onChange={(e) => {
              setUserInput(e.target.value);
            }}
          />
        </div>

        <div className="flex items-center gap-1">
          {/* File attachment button */}
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            className="h-8 w-8 p-0 hover:cursor-pointer"
            onClick={handleAttachment}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          {/* Send button */}
          <Button
            disabled={disabled}
            size="sm"
            className="h-8 w-8 p-0 hover:cursor-pointer"
            // onClick={handleFileUpload}
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
