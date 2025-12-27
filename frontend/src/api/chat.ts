import type { ChatStreamParams, StreamChunk } from "../types/chat";

// Model configuration interfaces
export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  description: string;
  type: string;
}

export interface ModelsResponse {
  models: ModelConfig[];
  defaultModel: string;
}

/**
 * Get available models list
 */
export async function getModels(): Promise<ModelsResponse> {
  const response = await fetch("/api/chat/models");
  if (!response.ok) {
    throw new Error(`Models Error: ${response.status}`);
  }
  return response.json();
}

/**
 * Core backend streaming request function
 */
export async function getRes(
  options: ChatStreamParams & { signal: AbortSignal }
): Promise<Response> {
  return fetch("/api/chat/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(options),
    signal: options.signal,
  });
}

/**
 * Core streaming request handler
 */
export async function sendChatStream(
  params: ChatStreamParams,
  signal: AbortSignal,
  onChunk: (content: string, finished: boolean) => void,
  onError: (error: Error) => void,
  onComplete: () => void
) {
  try {
    const response = await getRes({ ...params, signal });

    if (!response.ok) throw new Error(`Stream Error: ${response.status}`);
    if (!response.body) throw new Error("Empty response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        if (buffer.trim()) processBufferChunk(buffer, onChunk);
        onComplete();
        break;
      }

      const chunkStr = decoder.decode(value, { stream: true });
      buffer += chunkStr;

      // Split by newlines but keep the split logic robust
      const lines = buffer.split(/\r?\n/);
      // Keep the last partial line in the buffer
      buffer = lines.pop() || "";

      for (const line of lines) {
        processBufferChunk(line, onChunk);
      }
    }
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      onError(new Error("Request cancelled"));
    } else {
      onError(error instanceof Error ? error : new Error("Unknown error"));
    }
  }
}

/**
 * Helper: Process single SSE data line
 */
function processBufferChunk(line: string, onChunk: (content: string, finished: boolean) => void) {
  const trimmedLine = line.trim();
  if (!trimmedLine || !trimmedLine.startsWith("data: ")) return;

  const jsonStr = trimmedLine.slice(6).trim();
  if (!jsonStr || jsonStr === "[DONE]" || jsonStr === "[HEARTBEAT]") return;

  try {
    const chunkData = JSON.parse(jsonStr) as StreamChunk;

    // Pass the raw inner JSON string (which contains type and content) to the component
    // The component's parseChunkData will handle the inner parsing
    const content = chunkData.content || "";
    const finished = !!chunkData.finished;

    onChunk(content, finished);
  } catch (err) {
    console.warn("Invalid chunk:", line);
  }
}