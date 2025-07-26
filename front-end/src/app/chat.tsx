import { SidebarTrigger } from "@/components/ui/sidebar";
import { FileText, Loader2 } from "lucide-react";
import ThemeToggle from "./theme-toggle";
import { Input } from "@/components/ui/input";
import NavbarNew from "./navbar-new";
import InputField from "./input-field";
import { useState, useEffect } from "react";
import { Message } from "./chat-sidebar";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useUser } from "@auth0/nextjs-auth0";
import { Leapfrog } from "ldrs/react";
import "ldrs/react/Leapfrog.css";
import ReactMarkdown from "react-markdown";
import formatAgentResponse from "./format-response";
import { useRef } from "react";

export default function Chat({ chatMessages }: { chatMessages: Message[] }) {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>(chatMessages);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const messageEndRef = useRef<HTMLLIElement>(null);

  // Update internal state when prop changes
  useEffect(() => {
    setMessages(chatMessages);
  }, [chatMessages]);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  return (
    <div className="flex flex-col h-screen w-full">
      <NavbarNew />
      <div className="flex flex-1 flex-col p-4 mt-12 overflow-hidden">
        {/* Messages area - grows with content */}
        <div className="flex-1 overflow-y-auto pb-20 sm:p-4 md:p-10 lg:p-24">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <Image
                src={logoSrc}
                alt="Fetch Logo"
                width={200}
                height={200}
                className="mx-auto mb-4"
              />
              {/* <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" /> */}
              <h2 className="text-xl font-semibold mb-2">
                {user
                  ? "Welcome back, " + user.given_name + "!"
                  : "Welcome to Fetch AI"}
              </h2>
              <p className="text-muted-foreground">
                Upload a file and ask a question to get started.
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {cleanMessages(messages).map((message, index) => (
                <li
                  key={index}
                  className={`p-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-blue-200/50 dark:bg-blue-900/50 ml-auto w-fit max-w-xs md:max-w-lg"
                      : "bg-gray-200/50 dark:bg-gray-900/50 mr-auto w-fit max-w-xs md:max-w-lg"
                  }`}
                  ref={messageEndRef}
                >
                  {/* {message.content} */}
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                  {/* {formatAgentResponse(message.content)} */}
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
          )}
        </div>

        {/* Input area - fixed at bottom */}
        <div className="flex-shrink-0 p-4 bg-background border-t">
          <InputField
            setMessagesHandler={setMessages}
            chatMessages={chatMessages}
            setIsThinking={setIsThinking}
          />
        </div>
      </div>
    </div>
  );
}
