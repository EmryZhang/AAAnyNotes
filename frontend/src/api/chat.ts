import type { ChatStreamParams, StreamChunk } from "../types/chat";

// Model configuration type
export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  description: string;
  type: string;
}

// Model list response type
export interface ModelsResponse {
  models: ModelConfig[];
  defaultModel: string;
}

/**
 * Get available models list
 */
export async function getModels(): Promise<ModelsResponse> {
  const response = await fetch("/api/chat/models");
  console.log(response);
  if (!response.ok) {
    throw new Error(`Failed to get models list: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

/**
 * Core backend streaming request function (adapted from original getRes logic)
 * @param options Request parameters + cancel signal
 * @returns Streaming Response object
 */
export async function getRes(
  options: ChatStreamParams & { signal: AbortSignal }
): Promise<Response> {
  const response = await fetch("/api/chat/stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(options),
    signal: options.signal, // Associate cancel signal for request-level cancellation
  });
  return response;
}

/**
 * Core streaming request logic (for component calls)
 * @param params Streaming request parameters
 * @param signal Cancel signal (from component AbortController)
 * @param onChunk Callback to receive streaming data
 * @param onError Error callback
 * @param onComplete Completion callback
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

    if (!response.ok)
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    if (!response.body) throw new Error("Backend returned empty streaming response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      if (signal.aborted) throw new DOMException("Request cancelled", "AbortError");

      const { done, value } = await reader.read();
      if (done) {
        if (buffer.trim() !== "") {
          processBufferChunk(buffer, onChunk);
        }
        onComplete();
        return;
      }
      const chunkStr = decoder.decode(value, { stream: true });
      buffer += chunkStr;

      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || "";

      for (const line of lines) {
        processBufferChunk(line, onChunk);
      }
    }
  } catch (error) {
    if ((error as DOMException).name === "AbortError") {
      onError(new Error("Request cancelled"));
    } else {
      onError(error instanceof Error ? error : new Error("Unknown streaming request error"));
    }
  }
}

/**
 * 抽离的辅助函数：处理单段SSE数据，保留原始换行符
 * @param line 单行SSE数据
 * @param onChunk 回调函数
 */
function processBufferChunk(line: string, onChunk: (content: string, finished: boolean) => void) {
  const trimmedLine = line.trim();
  if (!trimmedLine || trimmedLine.startsWith(":")) return;

  try {
    if (trimmedLine.startsWith("data: ")) {
      const jsonStr = trimmedLine.slice(6).trim();
      if (!jsonStr || jsonStr === "[DONE]") return;

      const chunkData = JSON.parse(jsonStr) as StreamChunk;
      let content = chunkData.content || "";

      const finished = !!chunkData.finished;

      if (content || finished) {
        onChunk(content, finished);
      }
    }
  } catch (err) {
    console.warn("Skip invalid streaming chunk:", err, "Raw data:", line);
  }
}