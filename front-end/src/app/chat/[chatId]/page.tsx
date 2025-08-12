"use client";
import { getAccessToken, useUser } from "@auth0/nextjs-auth0";
import { use, useEffect, useState } from "react";
import Chat from "../../chat";
import { Chat as ChatType } from "../../types/chat";
import { Loader2 } from "lucide-react";

interface ChatPageProps {
  params: Promise<{
    chatId: string;
  }>;
}

export default function ChatPage({ params }: ChatPageProps) {
  const { chatId } = use(params);
  const { user } = useUser();
  const [chat, setChat] = useState<ChatType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the chat data based on chatId
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchChat = async () => {
      try {
        setLoading(true);
        setError(null);

        let accessToken = null;
        if (user) {
          accessToken = await getAccessToken();
        }

        const response = await fetch(`${apiUrl}/chat/${chatId}`, {
          method: "GET",
          headers: user
            ? {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              }
            : {
                "Content-Type": "application/json",
              },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch chat: ${response.status}`);
        }

        const data = await response.json();
        setChat({
          chatId: data.chat_id,
          title: data.chat_name,
          chatHistory: data.chat_history,
        });
      } catch (error) {
        console.error("Error fetching chat:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch chat"
        );

        // Fallback to empty chat if fetch fails
        const fallbackChat: ChatType = {
          chatId: chatId,
          title: `Chat ${chatId}`,
          chatHistory: [],
        };
        setChat(fallbackChat);
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, [chatId, user, apiUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (error && !chat) {
    console.log("error", error);
    return <div>Error: {error}</div>;
  }

  return chat ? <Chat chat={chat} /> : <div>No chat found</div>;
}
