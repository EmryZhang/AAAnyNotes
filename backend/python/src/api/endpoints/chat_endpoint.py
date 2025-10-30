from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from common.models import ChatStreamRequest  # 对应 src/common/models.py
from services.chat.chat_service import ChatService  # 对应 src/services/chat/chat_service.py
import json
from typing import Generator  

router = APIRouter(prefix="/api/chat")


@router.post("/stream")
async def chat_stream(request: Request, req: ChatStreamRequest):
    """大模型流式对话接口（供 Go 服务调用）"""

    def generate() -> Generator[str, None, None]:
        # 调用大模型服务获取流式响应
        for chunk in ChatService.stream_chat(req):
            # 检查客户端（Go 服务）是否断开连接
            if request.client_disconnected:
                break
            # 转换为 JSON 字符串并返回
            yield json.dumps(chunk.dict()) + "\n"

    # 返回流式响应（text/plain 格式，由 Go 转换为 SSE）
    return StreamingResponse(generate(), media_type="text/plain")