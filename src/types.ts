export type ChatMode = 'instant' | 'planning';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  mode: ChatMode;
  isStreaming?: boolean;
  planningProgress?: number;
  chips?: string[];
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  mode: ChatMode;
  createdAt: number;
  updatedAt: number;
}

export interface Attachment {
  id: string;
  type: 'image' | 'document' | 'audio';
  name: string;
  data?: string;
  size?: number;
}
