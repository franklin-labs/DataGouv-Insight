import { useState, useEffect } from "react";
import { getSecureItem, setSecureItem } from "./security";

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  id: string;
  timestamp: number;
}

export interface ChatSession {
  messages: Message[];
  model: string;
}

const STORAGE_KEYS = {
  API_KEY: "groq_chat_api_key",
  MCP_API_KEY: "mcp_api_key",
  MODEL: "groq_chat_model",
  MESSAGES: "groq_chat_messages",
};

export const MODELS = [
  { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B (Versatile)" },
  { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B (Instant)" },
  { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B" },
  { id: "gemma2-9b-it", name: "Gemma 2 9B" },
];

export function useChatStore() {
  const [apiKey, setApiKey] = useState<string>("");
  const [mcpApiKey, setMcpApiKey] = useState<string>("");
  const [model, setModel] = useState<string>(MODELS[0].id);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedKey = getSecureItem(STORAGE_KEYS.API_KEY) || "";
    const savedMcpKey = getSecureItem(STORAGE_KEYS.MCP_API_KEY) || "";
    const savedModel = localStorage.getItem(STORAGE_KEYS.MODEL) || MODELS[0].id;
    const savedMessages = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || "[]");

    setApiKey(savedKey);
    setMcpApiKey(savedMcpKey);
    setModel(savedModel);
    setMessages(savedMessages);
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (!isLoaded) return;
    setSecureItem(STORAGE_KEYS.API_KEY, apiKey);
    setSecureItem(STORAGE_KEYS.MCP_API_KEY, mcpApiKey);
    localStorage.setItem(STORAGE_KEYS.MODEL, model);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  }, [apiKey, mcpApiKey, model, messages, isLoaded]);

  const addMessage = (role: Message["role"], content: string) => {
    const newMessage: Message = {
      id: crypto.randomUUID(),
      role,
      content,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  };

  const clearChat = () => {
    setMessages([]);
  };

  const clearAllData = () => {
    setApiKey("");
    setMcpApiKey("");
    setModel(MODELS[0].id);
    setMessages([]);
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
    localStorage.removeItem(STORAGE_KEYS.MCP_API_KEY);
    localStorage.removeItem(STORAGE_KEYS.MODEL);
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
  };

  return {
    apiKey,
    setApiKey,
    mcpApiKey,
    setMcpApiKey,
    model,
    setModel,
    messages,
    addMessage,
    clearChat,
    clearAllData,
    isLoaded,
  };
}
