export interface Chat {
  id: string;
  name: string;
  chat_history: Message[];
}

export interface Message {
  content: string;
  role: "user" | "assistant";
  source_document?: string;
}

export function generateRandomChatId(){
  return Math.random().toString(36).substring(2, 15);
}