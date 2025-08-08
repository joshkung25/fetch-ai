"use client";
import Chat from "./chat";
import { Chat as ChatType } from "./types/chat";

export default function Home() {
  const chat: ChatType = {
    id: "1",
    name: "Test Chat",
    chat_history: [],
  };
  return <Chat chat={chat} />;
}
