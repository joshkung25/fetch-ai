export interface Chat {
  chatId: string;
  title: string;
  chatHistory: Message[];
}

export interface ChatSidebar {
  chatId: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  isActive: boolean;
}

export interface Message {
  content: string;
  role: "user" | "assistant";
  source_document?: string;
}

export function generateRandomChatId(){
  return Math.random().toString(36).substring(2, 15);
}