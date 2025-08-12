"use client";
import Chat from "./chat";
import { Chat as ChatType, generateRandomChatId } from "./types/chat";

export default function Home() {
  const chat: ChatType = {
    chatId: generateRandomChatId(),
    title: "Test Chat",
    chatHistory: [],
  };
  return <Chat chat={chat} />;
}
