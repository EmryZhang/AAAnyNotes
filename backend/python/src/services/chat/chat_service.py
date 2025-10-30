import time
from typing import Generator
from common.models import ChatStreamRequest, StreamChunk


class ChatService:
    """大模型对话服务（实际项目中替换为真实模型调用）"""

    @staticmethod
    def stream_chat(req: ChatStreamRequest) -> Generator[StreamChunk, None, None]:
        """
        流式生成大模型响应
        实际场景中：调用 OpenAI SDK / 本地模型，启用 stream=True 参数
        """
        # 模拟大模型思考过程（实际项目中替换为真实模型调用）
        response_text = "这是大模型对用户问题的流式回复内容...\n\n感谢使用！"
        tokens = list(response_text)  # 模拟按 token 拆分

        for i, token in enumerate(tokens):
            # 模拟生成延迟
            time.sleep(0.05)
            # 生成流式数据块（最后一块标记 finished=True）
            yield StreamChunk(
                content=token,
                finished=(i == len(tokens) - 1)
            )