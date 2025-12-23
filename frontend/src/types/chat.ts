// src/types/chat.ts

/**
 * Chat message type definition
 * Used to describe single message between user and AI
 */
export interface Message {
  /** Message unique identifier (recommended to use timestamp + random number) */
  id: string;
  /** Message content */
  content: string;
  /** Sender type (user or AI) */
  sender: "user" | "ai";
  /** Message send time (format: localized time string, e.g. "10:05") */
  time: string;
}

/**
 * Streaming chat request parameter type
 * Contains all parameters needed for LLM interaction, supports extension
 */
export interface ChatStreamParams {
  messages: Message[];
  model?: string;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
  [key: string]: any;
  thinkingMode?: boolean;
}

/**
 * Streaming response data block type
 * Describes single block of LLM streaming output
 */
export interface StreamChunk {
  content: string;
  finished: boolean;
  [key: string]: any;
}

/**
 * Streaming request callback function type definition
 */
export interface StreamCallbacks {
  onChunk: (chunk: string) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}
