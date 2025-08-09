"use client";
import Chat from "./chat";
import { Chat as ChatType, generateRandomChatId } from "./types/chat";

export default function Home() {
  const chat: ChatType = {
    chat_id: generateRandomChatId(),
    name: "Test Chat",
    chat_history: [],
  };
  return <Chat chat={chat} />;
}
