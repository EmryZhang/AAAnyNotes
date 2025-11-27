// chatStreamApi.ts
import type { ChatStreamParams, StreamChunk } from "../types/chat";

/**
 * 后端流式请求核心函数（适配原有 getRes 逻辑）
 * @param options 请求参数 + 取消信号
 * @returns 流式 Response 对象
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
    signal: options.signal, // 关联取消信号，实现请求级取消
  });
  return response;
}

/**
 * 流式请求核心逻辑（供组件调用）
 * @param params 流式请求参数
 * @param signal 取消信号（来自组件的 AbortController）
 * @param onChunk 接收流式数据的回调
 * @param onError 错误回调
 * @param onComplete 完成回调
 */
export async function sendChatStream(
  params: ChatStreamParams,
  signal: AbortSignal,
  onChunk: (content: string, finished: boolean) => void,
  onError: (error: Error) => void,
  onComplete: () => void
) {
  try {
    // 调用后端接口
    const response = await getRes({ ...params, signal });

    // 校验响应合法性
    if (!response.ok)
      throw new Error(`请求失败：${response.status} ${response.statusText}`);
    if (!response.body) throw new Error("后端返回空的流式响应体");

    // 初始化流式读取器和解码器
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    // 循环读取流式数据
    while (true) {
      // 检测是否已取消，提前终止
      if (signal.aborted) throw new DOMException("请求已取消", "AbortError");

      const { done, value } = await reader.read();
      // 流读取完成
      if (done) {
        onComplete();
        return;
      }

      // 解码二进制数据
      const chunkStr = decoder.decode(value, { stream: true });
      // 解析 SSE 格式（基础解析，复杂过滤放组件侧）
      let content = "";
      let finished = false;
      try {
        const trimmed = chunkStr.trim();
        if (trimmed.startsWith("data: ")) {
          const jsonStr = trimmed.slice(6).trim();
          if (jsonStr) {
            const chunkData = JSON.parse(jsonStr) as StreamChunk;
            content = (chunkData.content || "").trim().replace(/\n\n+/g, "\n");
            finished = !!chunkData.finished;
          }
        }
      } catch (err) {
        console.warn("解析流式数据失败", err);
      }

      // 触发回调，传递解析后的数据给组件
      onChunk(content, finished);
    }
  } catch (error) {
    // 区分取消和其他错误
    if ((error as DOMException).name === "AbortError") {
      onError(new Error("请求已取消"));
    } else {
      onError(error instanceof Error ? error : new Error("未知流式请求错误"));
    }
  }
}
