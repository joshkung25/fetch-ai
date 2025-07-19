import { SidebarTrigger } from "@/components/ui/sidebar";
import { FileText } from "lucide-react";
import ThemeToggle from "./theme-toggle";
import { Input } from "@/components/ui/input";
import NavbarNew from "./navbar-new";
import InputField from "./input-field";
import { useState } from "react";

interface Message {
  role: string;
  content: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);

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

  return (
    <div className="flex flex-col h-screen">
      <NavbarNew />
      <div className="flex flex-1 flex-col p-4 mt-12 overflow-hidden">
        {/* Messages area - grows with content */}
        <div className="flex-1 overflow-y-auto pb-20 sm:p-4 md:p-10 lg:p-24">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">
                Welcome to Fetch AI Assistant
              </h2>
              <p className="text-muted-foreground">
                Start a new conversation or select an existing chat from the
                sidebar.
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
                >
                  {message.content}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Input area - fixed at bottom */}
        <div className="flex-shrink-0 p-4 bg-background border-t">
          <InputField setMessagesHandler={setMessages} />
        </div>
      </div>
    </div>
  );
}
