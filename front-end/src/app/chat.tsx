"use client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { FileText, Loader2 } from "lucide-react";
import ThemeToggle from "./theme-toggle";
import { Input } from "@/components/ui/input";
import NavbarNew from "./navbar-new";
import InputField from "./input-field";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { getAccessToken, useUser } from "@auth0/nextjs-auth0";
import { Leapfrog } from "ldrs/react";
import "ldrs/react/Leapfrog.css";
import ReactMarkdown from "react-markdown";
import formatAgentResponse from "./format-response";
import { useRef } from "react";
import UploadSuggestionsModal from "./upload-suggestion-modal";
import type { Chat, Message } from "./types/chat";

export default function Chat({ chat }: { chat: Chat }) {
  // console.log("chat component received chat:", chat);
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>(chat.chatHistory);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const messageEndRef = useRef<HTMLLIElement>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [openModal, setOpenModal] = useState(false);

  // Update internal state when prop changes
  useEffect(() => {
    setMessages(chat.chatHistory);
  }, [chat]);

  useEffect(() => {
    const fetchDocCount = async () => {
      setMounted(true);
      if (user) {
        const accessToken = await getAccessToken();
        const response = await fetch(`${apiUrl}/list`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await response.json();
        if (data.status === "error") {
          setOpenModal(true);
        }
      }
    };
    fetchDocCount();
  }, [user]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!mounted) return null;

  // console.log("Messages:", messages);
  const cleanMessages = (messages: Message[]) => {
    return messages.map((message) =>
      message.role === "user"
        ? {
            role: message.role,
            content: message.content.replace(
              /[\s\S]*This was the user's input: /,
              ""
            ),
          }
        : message
    );
  };

  const logoSrc =
    theme === "dark" ? "/fetchai_logo_dark.png" : "/fetchai_logo.png";

  const handlePreview = async (source_document_title: string) => {
    const accessToken = await getAccessToken();
    const pdfBlob = await fetch(
      `${apiUrl}/preview?title=${encodeURIComponent(source_document_title)}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    ).then((res) => res.blob());
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, "_blank");
    window.focus();
  };

  return (
    <div className="flex flex-col h-screen w-full">
      <NavbarNew nav_header="Fetch AI" />
      <UploadSuggestionsModal open={openModal} setOpen={setOpenModal} />

      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Messages area - grows with content */}
        <div className="flex-1 overflow-y-auto pb-40 pt-16 px-4 md:px-10 lg:px-24 xl:px-48">
          {messages.length === 0 ? (
            <div className="text-center py-32">
              {/* <Image
                src="/docs_ai_logo3.png"
                alt="Fetch AI"
                width={100}
                height={100}
                className="mx-auto mb-4 opacity-25"
                priority={true}
              /> */}
              {/* <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" /> */}
              <h2 className="text-3xl font-semibold mb-2">
                {user
                  ? "Welcome back, " + user.given_name + "!"
                  : "Welcome to Fetch AI"}
              </h2>
              <p className="text-muted-foreground">
                Upload a file and ask a question to get started.
              </p>
              <div className="flex justify-center p-4 pt-10 max-w-3xl mx-auto">
                <InputField
                  setMessagesHandler={setMessages}
                  chatMessages={messages}
                  setIsThinking={setIsThinking}
                  chatId={chat.chatId}
                />
              </div>
            </div>
          ) : (
            <div>
              <ul className="space-y-6 mx-auto max-w-4xl">
                {cleanMessages(messages).map((message, index) => (
                  <li
                    key={index}
                    className={`p-3 rounded-xl ${
                      message.role === "user"
                        ? "bg-blue-200/50 dark:bg-blue-900/50 ml-auto w-fit max-w-xs md:max-w-lg"
                        : "mr-auto w-fit max-w-xs md:max-w-screen-lg"
                    }`}
                    ref={messageEndRef}
                  >
                    {/* {message.content} */}
                    {/* <ReactMarkdown>{message.content}</ReactMarkdown> */}
                    {message.role === "assistant"
                      ? formatAgentResponse(message.content)
                      : message.content}

                    {message.source_document && (
                      <div className="mt-2 flex items-center">
                        <FileText className="inline h-4 w-4 mr-1 text-muted-foreground" />
                        <p
                          className="text-sm text-muted-foreground cursor-pointer"
                          onClick={() => {
                            if (message.source_document) {
                              handlePreview(message.source_document);
                            }
                          }}
                        >
                          {message.source_document}
                        </p>
                      </div>
                    )}
                  </li>
                ))}
                {isThinking && (
                  <li className="pl-6">
                    <Leapfrog
                      size="20"
                      speed="3"
                      color={theme === "dark" ? "white" : "black"}
                    />
                  </li>
                )}
              </ul>
              {/* Input area - fixed on top of other components */}
              <div
                className={`absolute bottom-0 left-0 right-0 z-50 pb-5 max-w-3xl mx-auto`}
              >
                {/* <div className="w-full max-w-4xl mx-auto bg-white/10 dark:bg-black/10 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/10 p-4"> */}
                <InputField
                  setMessagesHandler={setMessages}
                  chatMessages={messages}
                  setIsThinking={setIsThinking}
                  chatId={chat.chatId}
                />
                {/* </div> */}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
