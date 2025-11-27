import time
from typing import Generator
from common.models import ChatStreamRequest, StreamChunk


class ChatService:
    """大模型对话服务（实际项目中替换为真实模型调用）"""

    @staticmethod
    def stream_chat(req: ChatStreamRequest) -> Generator[StreamChunk, None, None]:
        print("🐍 ChatService.stream_chat 被调用！开始生成数据...")  # 日志1：确认进入生成逻辑
        response_text = "这是 大模型 对 用户 问题 的 流式 回复 内容 ...\n\n 感谢使用！"
        tokens = response_text.split(" ")
        tokens = [token + " " for token in tokens]
        tokens[-1] = tokens[-1].strip()

        for i, token in enumerate(tokens):
            time.sleep(1)
            chunk = StreamChunk(content=token, finished=(i == len(tokens) - 1))
            print(f"🐍 生成 chunk：{chunk.dict()}")  # 日志2：确认每个 chunk 生成
            yield chunk
        print("🐍 所有 chunk 生成完毕！")  # 日志3：确认循环执行完