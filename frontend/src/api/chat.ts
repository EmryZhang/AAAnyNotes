import type { ChatStreamParams, StreamChunk } from "../types/chat";
/**
 * 发送大模型流式对话请求
 * @param params 请求参数
 * @param onChunk 收到流式数据的回调
 * @param onComplete 流结束的回调
 * @param onError 错误回调
 * @returns 取消请求的函数
 */
export function sendChatStream(
  params: ChatStreamParams,
  onChunk: (chunk: string) => void,
  onComplete?: () => void,
  onError?: (error: Error) => void
): () => void {
  const controller = new AbortController();
  const signal = controller.signal;

  // 后端API地址（Go服务暴露的流式接口）
  const apiUrl = "/api/chat/stream";

  fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // 默认参数与自定义参数合并，确保扩展性
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      topP: 0.9,
      maxTokens: 2000,
      ...params,
    }),
    signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`请求失败：HTTP ${response.status}`);
      }

      if (!response.body) {
        throw new Error("流式响应体不存在");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          onComplete?.();
          break;
        }

        // 处理流式数据（解析SSE格式）
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");

        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6);
            if (dataStr === "[DONE]") continue;

            try {
              const chunk: StreamChunk = JSON.parse(dataStr);
              onChunk(chunk.content);
              if (chunk.finished) {
                onComplete?.();
                reader.cancel();
                break;
              }
            } catch (err) {
              onError?.(new Error(`数据解析失败：${err instanceof Error ? err.message : String(err)}`));
            }
          }
        }

        buffer = lines[lines.length - 1];
      }
    })
    .catch((error) => {
      if (!signal.aborted) {
        onError?.(error);
      }
    });

  // 返回取消函数
  return () => controller.abort();
}