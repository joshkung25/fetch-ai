"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, X } from "lucide-react";
import { useRef, useState } from "react";

interface Message {
  role: string;
  content: string;
}

interface ChatbotInputProps {
  placeholder?: string;
  disabled?: boolean;
  setMessagesHandler?: (messages: Message[]) => void;
}

export default function ChatbotInput({
  placeholder = "Type your message...",
  disabled = false,
  setMessagesHandler,
}: ChatbotInputProps) {
  const [userInput, setUserInput] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const handleAttachment = () => {
    // Trigger the file input click to open file picker
    fileInputRef.current?.click();
  };
  const handleUserInput = async () => {
    console.log("User input to send:", userInput);
    try {
      const response = await fetch("http://localhost:8001/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_input: userInput,
          message_history: messages,
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

    const formData = new FormData();
    formData.append("file", files[0]);
    formData.append("title", files[0].name);

    try {
      const response = await fetch("http://localhost:8001/add", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to upload file");
      }
      console.log("File uploaded successfully:", response);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };
  const handleAllInput = async () => {
    setMessagesHandler?.([...messages, { role: "user", content: userInput }]);
    await handleFileUpload();
    await handleUserInput();
  };
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* File preview - you can conditionally show this */}
      <div className="mb-2 p-2 bg-muted rounded-md flex items-center justify-between hidden">
        <span className="text-sm text-muted-foreground truncate">
          Selected files will appear here
        </span>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <X className="h-3 w-3" />
        </Button>
      </div>

      {/* Input area */}
      <div className="flex items-end gap-2 p-2 border rounded-lg bg-background shadow-sm">
        <div className="flex-1">
          <Input
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
            <Send className="h-4 w-4" />
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
